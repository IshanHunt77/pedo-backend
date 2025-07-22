import * as transformers from '@xenova/transformers';
import {
  createClient,
  SCHEMA_FIELD_TYPE,
} from 'redis';
import { redisConnect } from '../redis';
import { Request, Response } from 'express';

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

export const VectorDb_Embeddings = async (req: Request, res: Response) => {
  const contents = req.body.contents;

  if (!Array.isArray(contents) || contents.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty contents array' });
  }

  console.log("Starting embedding process");

  try {
    const pipe = await transformers.pipeline(
      'feature-extraction',
      'Xenova/all-distilroberta-v1'
    );
    const pipeOptions = { pooling: 'mean' as const, normalize: true };

    const client = await redisConnect();

    try {
      await client.ft.dropIndex('vector_json_idx');
    } catch (e) {
      console.warn("Index did not exist or couldn't be dropped:", e);
    }

    await client.ft.create(
      'vector_json_idx',
      {
        '$.content': { type: SCHEMA_FIELD_TYPE.TEXT, AS: 'content' },
        '$.genre': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'genre' },
        '$.embedding': {
          type: SCHEMA_FIELD_TYPE.VECTOR,
          TYPE: 'FLOAT32',
          ALGORITHM: 'HNSW',
          DISTANCE_METRIC: 'L2',
          DIM: 768,
          AS: 'embedding',
        },
      },
      {
        ON: 'JSON',
        PREFIX: 'jdoc:',
      }
    );

    let count = 0;
    for (const str of contents) {
      count++;
      const jdoc = {
        content: str,
        embedding: Array.from((await pipe(str, pipeOptions)).data),
      };
      await client.json.set(`jdoc:${count}`, '$', jdoc);
    }
    await client.quit();
    console.log("Embeddings completed successfully");
    return res.status(201).json({ msg: 'Embeddings done', count });
  } catch (error) {
    console.error('Error during embeddings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
