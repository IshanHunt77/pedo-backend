"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const transformers = __importStar(require("@xenova/transformers"));
const redis_1 = require("../redis");
const Query = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.body.query;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        const pipe = yield transformers.pipeline('feature-extraction', 'Xenova/all-distilroberta-v1');
        const pipeOptions = { pooling: 'mean', normalize: true };
        const queryEmbedding = (yield pipe(query, pipeOptions)).data;
        let float32Buffer;
        if (Array.isArray(queryEmbedding)) {
            float32Buffer = Buffer.from(new Float32Array(queryEmbedding).buffer);
        }
        else if (queryEmbedding instanceof Float32Array) {
            float32Buffer = Buffer.from(queryEmbedding.buffer);
        }
        else {
            throw new Error('Unsupported embedding data type');
        }
        const client = yield (0, redis_1.redisConnect)();
        const jsons = yield client.ft.search('vector_json_idx', '*=>[KNN 3 @embedding $B AS score]', {
            PARAMS: { B: float32Buffer },
            RETURN: ['score', 'content'],
            DIALECT: 2,
        });
        const results = jsons.documents.map((doc) => ({
            id: doc.id,
            content: doc.value.content,
            score: parseFloat(doc.value.score).toFixed(6),
        }));
        console.log(results);
        yield client.quit();
        return res.status(200).json({ results });
    }
    catch (error) {
        console.error('Error in Query:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.Query = Query;
