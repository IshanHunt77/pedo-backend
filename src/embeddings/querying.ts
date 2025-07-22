import * as transformers from '@xenova/transformers';
import { Request, Response } from 'express';
import {
  createClient,
  SCHEMA_FIELD_TYPE,
} from 'redis';
import { redisConnect } from '../redis';

type SearchDocument = {
  id: string;
  value: {
    content: string;
    score: string;
  };
};
type SearchResult = {
  total: number;
  documents: SearchDocument[];
};

export const Query = async (req: Request, res: Response) => {
  try {
    const query = req.body.query;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const pipe = await transformers.pipeline(
      'feature-extraction',
      'Xenova/all-distilroberta-v1'
    );

    const pipeOptions = { pooling: 'mean' as const, normalize: true };
    const queryEmbedding = (await pipe(query, pipeOptions)).data;

    let float32Buffer: Buffer;
    if (Array.isArray(queryEmbedding)) {
      float32Buffer = Buffer.from(new Float32Array(queryEmbedding).buffer);
    } else if (queryEmbedding instanceof Float32Array) {
      float32Buffer = Buffer.from(queryEmbedding.buffer);
    } else {
      throw new Error('Unsupported embedding data type');
    }

    const client = await redisConnect();

    const jsons = await client.ft.search(
      'vector_json_idx',
      '*=>[KNN 3 @embedding $B AS score]',
      {
        PARAMS: { B: float32Buffer },
        RETURN: ['score', 'content'],
        DIALECT: 2,
      }
    ) as SearchResult;

    const results = jsons.documents.map((doc) => ({
      id: doc.id,
      content: doc.value.content,
      score: parseFloat(doc.value.score).toFixed(6),
    }));

    console.log(results);

    await client.quit();
    return res.status(200).json({ results });
  } catch (error) {
    console.error('Error in Query:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
