"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pipeline_1 = require("../embeddings/pipeline");
const router = express_1.default.Router();
router.post('/', pipeline_1.VectorDb_Embeddings);
exports.default = router;
