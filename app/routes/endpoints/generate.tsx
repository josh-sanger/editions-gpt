import {json} from '@remix-run/node';
import {Configuration, OpenAIApi} from 'openai';
import fs from 'fs/promises';

import editionsData from '~/data/editions.json';

/**
 * When the page loads, create a json file with the embeddings
 */
export async function loader() {
  try {
    const sections = editionsData.sections;
    const inputs = sections.slice();

    let embeddings = [] as any[];

    // Open AI key stored in .env
    const conf = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(conf);

    while (inputs.length) {
      let tokenCount = 0;
      let batchedSections = [];

      // limit of embeddings per call is 4096
      while (inputs.length && tokenCount < 4096) {
        let inputSection = inputs.shift();
        let input = `
        Title:
        ${inputSection?.title || ''}
        Content:
        ${inputSection?.content || ''}
        ${inputSection?.relatedLinks.length ? `
        Related Links:
        ${inputSection.relatedLinks.join(', ') || ''}
        ` : ''}
        `;
        batchedSections.push(input);

        tokenCount += input.split(' ').length;
      }

      const embeddingResult = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: batchedSections,
      });

      embeddings = embeddings.concat(
        embeddingResult.data.data.map((data: any) => data.embedding)
      )
    }

    // build vectors
    let vectors = sections.map((section, i) => {
      return {
        id: section.title,
        metadata: {
          title: section.title,
          content: section.content,
          relatedLinks: section.relatedLinks,
          productId: section.productId,
        },
        values: embeddings[i],
      }
    });

    const jsonData = {
      vectors,
      namespace: 'editions',
    }

    fs.writeFile('vector-json/editions-vector.json', JSON.stringify(jsonData));

    return json({
      message: 'File created and stored in vector-json/editions-vector.json',
    });
  } catch (error: any) {
    return json({
      error: error.message,
    });
  }
}
