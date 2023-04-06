import {useRef, useState, useEffect} from 'react';
import cn from 'classnames';
import ReactMarkdown from 'react-markdown';

import editionsData from '~/data/editions.json';
import {Link as LinkIcon} from '~/components/Icons';

import {type Role} from '~/types';

export interface MessageProps {
  content: string;
  role?: Role;
  error?: boolean;
}

export interface RoleIconProps {
  error?: boolean;
  role: Role;
}

const getProductInfo = (productId: number) => {
  // get the product info from the product id using editionsData
  const productInfo = editionsData.sections.find((section) => section.productId === productId);

  return productInfo;
}

/**
 * Renders a message
 * TODO: Content could be json or string, need to handle both
 * TODO: Handle malformed json
 */
export default function Message({content, error, role = 'user'}: MessageProps) {
  const rendered = useRef<null | boolean>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const messageWrapRef = useRef<HTMLDivElement>(null);
  const messageBodyRef = useRef<HTMLDivElement>(null);
  const [messageHeight, setMessageHeight] = useState(0);

  // may need to optimize this
  let answer;
  let productIds = [];

  try {
    const contentJson = JSON.parse(content);

    answer = contentJson.answer;
    // could potential fail as well
    productIds = contentJson.productIds || [];
  } catch {
    answer = content;
  }

  const handleTransitionEnd = () => {
    const theMessageWrap = messageWrapRef.current;
    if (!theMessageWrap) {
      return;
    }

    theMessageWrap.removeAttribute('style');
  }

  useEffect(() => {
    const theMessage = messageRef.current;

    if (rendered.current !== null || !theMessage) {
      return
    }

    rendered.current = true;

    const contentHeight = theMessage.clientHeight;
    setMessageHeight(contentHeight);
  }, []);

  useEffect(() => {
    const theMessageWrap = messageWrapRef.current;
    if (!theMessageWrap) {
      return;
    }

    theMessageWrap.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      theMessageWrap.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, []);

  return (
    <div
      className="message-wrap transition-height duration-300"
      ref={messageWrapRef}
      style={{height: `${messageHeight}px`, overflow: 'hidden'}}
    >
      <div className="message-wrap-inner" ref={messageRef}>
        {!!productIds.length && (
          <div
            className={cn(
              'product-ids grid md:grid-cols-2 gap-2 items-end mb-4 transition-[opacity,transform] duration-[400ms] delay-75 relative',
              rendered.current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7',
            )}
          >
            {productIds.map((id: number, index: number) => {
              const productInfo = getProductInfo(id) as any;

              if (productInfo?.title) {
                return (
                  <div
                    key={`${productInfo.title}-${index}`}
                    className="text-white bg-[#1F1F1F] rounded-4xl p-4 grid grid-rows-[1fr_auto]"
                  >
                    <div className="">
                      {productInfo?.youtubeId && (
                        <iframe
                          className="w-full aspect-video rounded-t-[20px] mb-4"
                          src={`https://www.youtube.com/embed/${productInfo.youtubeId}`}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                      <h2 className="text-lg font-bold mb-2">{productInfo.title}</h2>
                      <p className="text-[#868686] text-sm">{productInfo.content}</p>
                    </div>
                    {!!productInfo?.relatedLinks.length && (
                      <div className="links-wrapper flex gap-2 small-mobile:max-sm:text-sm item-center flex-wrap mt-4">
                        {productInfo.relatedLinks.map((link: any, index: number) => (
                          <a
                            className="text-white no-underline hover:underline text-sm inline-flex gap-1"
                            key={`link-${link.url}-${index}`} href={link.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <LinkIcon />
                            {link.content}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
        <div
          className={cn(
            'message w-full flex small-mobile:max-sm:text-sm',
            role === 'user' ? 'justify-end text-right' : 'justify-start',
            error && 'text-error'
          )}
        >
          <div
            className={cn(
              'message-inner space-x-4 max-w-[480px] rounded-4xl p-4 transition-[opacity,transform] delay-150 relative',
              productIds.length ? 'delay-150 duration-[400ms]' : 'duration-300',
              role === 'user' ? 'bg-gradient-to-r from-dark-blue to-light-blue' : 'bg-white text-black',
              rendered.current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7',

            )}
            ref={messageBodyRef}
          >
            <div className="response">
              <ReactMarkdown children={answer} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}