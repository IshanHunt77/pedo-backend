import express from 'express'
import { VectorDb_Embeddings } from '../embeddings/pipeline';

const router =  express.Router();

router.post('/',VectorDb_Embeddings);


export default router;