import express from 'express'
import { Query } from '../embeddings/querying';

const router =  express.Router();

router.post('/',Query);


export default router;