import React, {useRef, useEffect, useCallback, useState} from 'react';
import {Configuration, OpenAIApi} from 'openai';
import {type ChatCompletionRequestMessage} from 'openai';

import {type ActionArgs} from '@remix-run/node';
import {Form, useActionData, useNavigation, Link, useSubmit} from '@remix-run/react';

import context from '~/context';
import {Arrow as ArrowIcon} from '~/components/Icons';
import Message from '~/components/Message';

export interface ReturnedDataProps {
  message?: string;
  answer: string;
  error?: string;
  chatHistory: ChatCompletionRequestMessage[];
}

export interface ChatHistoryProps extends ChatCompletionRequestMessage {
  error?: boolean,
}

/**
 * Gets the closest 5 matching results from pinecone.
 * @param query The user's question to get context for
 * @returns the top 5 matching results from pinecone
 */
async function getContext(query: string) {
  const conf = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const openai = new OpenAIApi(conf);

    // get the vector of the query string from OpenAI
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: query,
    });

    const [responseData] = embeddingResponse.data.data;

    // get top 5 results from pinecone
    const pineconeResponse = await fetch(`${process.env.PINECONE_INDEX_URL}/query`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'Api-Key': process.env.PINECONE_API_KEY
      } as any,
      body: JSON.stringify({
        includeValues: true,
        includeMetadata: true,
        vector: responseData.embedding,
        namespace: 'editions',
        topK: 5,
      }),
    });

    const pincodeResponseData = await pineconeResponse.json();

    const matchesContext = pincodeResponseData.matches.map((item: any) => (
      `{title: "${item.metadata.title}", content: "${item.metadata.content}", productId: "${item.metadata.productId}"}`
    )).join(',');

    return matchesContext;

  } catch (error: any) {
    return error.message || 'Error: something went wrong.';
  }
}

/**
 * API call executed server side
 */
export async function action({request}: ActionArgs): Promise<ReturnedDataProps> {
  const body = await request.formData();
  const message = body.get('message') as string;
  const chatHistory = JSON.parse(body.get('chat-history') as string) || [];

  // store your key in .env
  const conf = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // get 5 matching results from pinecone
    const matchingContext = await getContext(message);

    const openai = new OpenAIApi(conf);

    // get the answer from GPT-3.5-turbo completion endpoint
    const chat = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [
        ...context,
        ...chatHistory,
        {
          role: 'user',
          content: `Context:
          ${matchingContext}
          ---
          Visitor asked: ${message}
          ---
          `,
        },
      ],
    });

    let answer = chat.data.choices[0].message?.content as string;

    return {
      message: body.get('message') as string,
      answer: answer as string,
      chatHistory,
    };
  } catch (error: any) {
    return {
      message: body.get('message') as string,
      answer: '',
      error: error.message || 'Something went wrong! Please try again.',
      chatHistory,
    };
  }
}


export default function IndexPage() {
  const minTextareaRows = 1;
  const maxTextareaRows = 6;

  const data = useActionData<typeof action>();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navigation = useNavigation();
  const submit = useSubmit();
  const [chatHistory, setChatHistory] = useState<ChatHistoryProps[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  /**
   * Handles the change event of a textarea element and adjusts its height based on the content.
   * Note: Using the ref to alter the rows rather than state since it's more performant / faster.
   * @param event - The change event of the textarea element.
   */
  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!inputRef.current) {
      return;
    }

    // reset required for when the user pressed backspace (otherwise it would stay at max rows)
    inputRef.current.rows = minTextareaRows;

    const lineHeight = parseInt(window.getComputedStyle(inputRef.current).lineHeight);
    const paddingTop = parseInt(window.getComputedStyle(inputRef.current).paddingTop);
    const paddingBottom = parseInt(window.getComputedStyle(inputRef.current).paddingBottom);
    const scrollHeight = inputRef.current.scrollHeight - paddingTop - paddingBottom;
    const currentRows = Math.floor(scrollHeight / lineHeight);

    if (currentRows >= maxTextareaRows) {
      inputRef.current.rows = maxTextareaRows;
      inputRef.current.scrollTop = event.target.scrollHeight;
    } else {
      inputRef.current.rows = currentRows;
    }
  };

  /**
   * Adds a new message to the chat history
   * @param data The message to add
   */
  const pushChatHistory = useCallback((data: ChatHistoryProps) => {
    setChatHistory(prevState => ([...prevState, data]));
  }, [setChatHistory]);

  /**
   * Saves the user's message to the chat history
   * @param content The user's message
   */
  const saveUserMessage = useCallback((content: string) => {
    pushChatHistory({
      content,
      role: 'user',
    })
  }, [pushChatHistory]);

  /**
   * Ensure the user message is added to the chat on submit (button press)
   * @param event Event from the form
   */
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.target as HTMLFormElement);
    const message = formData.get('message');

    saveUserMessage(message as string);
  };

  /**
   * Submits the form when the user pressed enter but not shift + enter
   * Also saves a mesasge to the the chat history
   *
   * @param event The keydown event
   */
  const submitFormOnEnter = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      const value = (event.target as HTMLTextAreaElement).value
      saveUserMessage(value);
      submit(formRef.current, {replace: true});
    }
  }, [submit, formRef, saveUserMessage]);

  /**
   * Handles the click event of a prefilled option
   */
  const handlePrefilledOption = (prompt: string) => {
    if (!inputRef.current || isSubmitting) {
      return;
    }

    inputRef.current.value = prompt;
    saveUserMessage(prompt);
    submit(formRef.current, {replace: true});
  }

  /**
   * Scrolls to the bottm of the page and uses requestAnimationFrame to animate the scrolling (Since the height of the message animates)
   */
  const scrollToBottom = (animationDuration: number = 300) => {
    const body = document.body;
    const html = document.documentElement;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const targetScrollTop = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
      );
      const progress = (currentTime - startTime) / animationDuration;

      window.scrollTo({ top: targetScrollTop });

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };


  /**
   * Focuses the input element when the page is loaded and clears the
   * input when the form is submitted
   */
  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (navigation.state === 'submitting') {
      inputRef.current.value = '';
      inputRef.current.rows = 1;

      // adding a small dekay so both messages don't appear at the same time
      setTimeout(() => {
        setIsThinking(true);
        scrollToBottom();
      }, 100);
    } else {
      inputRef.current.focus();
      setIsThinking(false);
    }
  }, [navigation.state, scrollToBottom, setIsThinking]);

  /**
   * Adds the API's response message to the chat history
   * when the data comes back from the action method
   */
  useEffect(() => {
    if (data?.error) {
      pushChatHistory({
        content: data.error as string,
        role: 'assistant',
        error: true,
      })

      return;
    }

    if (data?.answer) {
      pushChatHistory({
        content: data.answer as string,
        role: 'assistant',
      })
    }
  }, [data, pushChatHistory])

  /**
   * Scrolls to the bottom of the chat container when the chat history changes
   */
  useEffect(() => {
    if (!chatContainerRef.current) {
      return;
    }

    if (chatHistory.length) {
      scrollToBottom();
    }
  }, [chatHistory]);

  return (
    <main className="container mx-auto rounded-lg h-full grid grid-rows-layout p-4 pb-0 sm:p-8 sm:pb-0 max-w-full sm:max-w-auto">
      <div className="chat-container" ref={chatContainerRef}>
        {chatHistory.length === 0 && (
          <div className="intro grid place-items-center h-full text-center">
            <div className="intro-content">
              <h1 className="text-4xl font-semibold">Editions GPT</h1>
              <p className="mt-4">Ask anything about the Winter ’23 Edition</p>
            </div>
          </div>
        )}

        {chatHistory.length > 0 && (
          <div className="messages max-w-maxWidth mx-auto min-h-full grid place-content-end grid-cols-1 gap-4">
            {chatHistory.map((chat, index) => (
              <React.Fragment key={`message-${index}`}>
                <Message
                  error={chat.error}
                  content={chat.content}
                  key={`message-${index}`}
                  role={chat.role}
                />
              </React.Fragment>
            ))}
            {isThinking && (
              <Message content="Thinking..." role="assistant" />
            )}
          </div>
        )}
      </div>
      <div className="form-container p-4 sm:p-8 backdrop-blur-md sticky bottom-0">
        <Form
          aria-disabled={isSubmitting}
          method="post"
          ref={formRef}
          onSubmit={handleFormSubmit}
          replace
          className="max-w-[500px] mx-auto"
        >
          <div className="input-wrap relative">
            <label htmlFor="message" className="absolute left[-9999px] w-px h-px overflow-hidden">Ask about this Edition</label>
            <textarea
              id="message"
              aria-disabled={isSubmitting}
              ref={inputRef}
              className="auto-growing-input m-0 appearance-none text-white placeholder:text-white resize-none text-sm md:text-lg py-4 px-6  border-none outline-none rounded-4xl w-full block leading-6 bg-gradient-to-r from-dark-blue to-light-blue"
              placeholder="Ask about this Edition"
              name="message"
              onChange={handleTextareaChange}
              required
              rows={1}
              onKeyDown={submitFormOnEnter}
              minLength={2}
              disabled={isSubmitting}
            />
            <input
              type="hidden"
              value={JSON.stringify(chatHistory)} name="chat-history"
            />
            <button
              aria-label="Submit"
              aria-disabled={isSubmitting}
              className="absolute right-2 items-center top-1/2 -translate-y-1/2 appearance-none bg-transparent text-black h-11 w-11 border-none cursor-pointer shadow-none rounded-full grid place-items-center group bg-white hover:bg-light-shade transition-colors disabled:opacity-[0.4] disabled:text-black disabled:cursor-not-allowed disabled:hover:bg-[#e0e0e0] focus:outline-dark-blue"
              type="submit"
              disabled={isSubmitting}
            >
              <ArrowIcon />
            </button>
          </div>
        </Form>
        <p className="made-with text-xs text-center mt-4 text-white-faded-less flex flex-wrap gap-4 justify-center">
          <span className="text-white-faded w-full small-mobile:w-auto">Suggestions:</span>
          <button type="button" onClick={() => handlePrefilledOption('Anything new with marketing?')}>Marketing</button>
          <button type="button" onClick={() => handlePrefilledOption('Tell me something new with logistics!')}>Logistics</button>
          <button type="button" onClick={() => handlePrefilledOption('Anything new with the Shop app?')}>Shop app</button>
        </p>
      </div>
    </main>
  );
}

export function ErrorBoundary({error}: {error: Error}) {
  return (
    <main className="container mx-auto bg-white rounded-lg grid grid-rows-layout p-8">
      <h1 className="text-4xl text-dark-shade font-semibold">Something went wrong!</h1>
      <p className="error mt-4 p-5 rounded text-error border border-error">{error.message || 'Unknown error'}</p>
      <p className="mt-4"><Link to="/">Back to chat</Link></p>
    </main>
  );
}