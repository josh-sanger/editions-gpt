# Editions GPT
A context-loaded chat assistant for answering questions about Editions Winter ’23 using OpenAI's [gpt-3.5-turbo](https://platform.openai.com/docs/guides/chat) API.

<img width="1381" alt="Screenshot 2023-03-28 at 3 48 26 PM" src="https://user-images.githubusercontent.com/58700044/228587624-4900913c-cc36-45b6-8232-724a4d7ce941.png">


# Getting started
1. Clone or fork the repo
2. Run `npm i`
3. Create an `.env` file in root and add your [Open AI API key](https://platform.openai.com/account/api-keys) to it (this file is not tracked) and add your [Pinecone](https://pinecone.io) index URL and API key
```javaScript
OPENAI_API_KEY=superSecretAPIKey
PINECONE_INDEX_URL=indexURL
PINECONE_API_KEY=superSecretAPIKey
```
4. Run `npm run dev`
5. Open in your browser `http://localhost:3000/`
6. Start playing with the context you wish to add in `/app/context/index.ts`

# Under the hood
This is build using [Remix](https://remix.run/) (a react based framework), [Typescript](https://www.typescriptlang.org/), and uses [TailwindCSS](https://tailwindcss.com/) for styling. Some key notes:
- Pages can be found under `/app/routes`
- Custom styling can be found in `/app/stylesheets` and can be added in the `/app/root.tsx` file in the `links()` function
- Context for the chat interaction should be stored in `/app/context/index.ts` and should follow the data format for [messages](https://platform.openai.com/docs/guides/chat/introduction) (role, content)
- This is using the Toolformer modal to decide when it needs to fetch data about products
- This is using Pinecone.io as the embeddings vector DB
- To generate the embeddings vector JSON visit `http://localhost:3000/endpoints/generate`. You can then use the file to upsert into the DB

# Deployment
This repo was set up to deploy to [Vercel](https://vercel.com/) as the main deplopyment source but you can customize it if you wish to suit your needs.

# Feedback
Would love to hear some feedback. Please feel free to open issues or hit me up on [Twitter](https://twitter.com/JoshSanger_eth).
