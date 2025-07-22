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
exports.VectorDb_Embeddings = void 0;
const transformers = __importStar(require("@xenova/transformers"));
const redis_1 = require("redis");
const redis_2 = require("../redis");
const VectorDb_Embeddings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contents = req.body.contents;
    if (!Array.isArray(contents) || contents.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty contents array' });
    }
    console.log("Starting embedding process");
    try {
        const pipe = yield transformers.pipeline('feature-extraction', 'Xenova/all-distilroberta-v1');
        const pipeOptions = { pooling: 'mean', normalize: true };
        const client = yield (0, redis_2.redisConnect)();
        try {
            yield client.ft.dropIndex('vector_json_idx');
        }
        catch (e) {
            console.warn("Index did not exist or couldn't be dropped:", e);
        }
        yield client.ft.create('vector_json_idx', {
            '$.content': { type: redis_1.SCHEMA_FIELD_TYPE.TEXT, AS: 'content' },
            '$.genre': { type: redis_1.SCHEMA_FIELD_TYPE.TAG, AS: 'genre' },
            '$.embedding': {
                type: redis_1.SCHEMA_FIELD_TYPE.VECTOR,
                TYPE: 'FLOAT32',
                ALGORITHM: 'HNSW',
                DISTANCE_METRIC: 'L2',
                DIM: 768,
                AS: 'embedding',
            },
        }, {
            ON: 'JSON',
            PREFIX: 'jdoc:',
        });
        let count = 0;
        for (const str of contents) {
            count++;
            const jdoc = {
                content: str,
                embedding: Array.from((yield pipe(str, pipeOptions)).data),
            };
            yield client.json.set(`jdoc:${count}`, '$', jdoc);
        }
        console.log("Embeddings completed successfully");
        yield client.quit();
        return res.status(201).json({ msg: 'Embeddings done', count });
    }
    catch (error) {
        console.error('Error during embeddings:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.VectorDb_Embeddings = VectorDb_Embeddings;
