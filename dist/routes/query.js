"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const querying_1 = require("../embeddings/querying");
const router = express_1.default.Router();
router.post('/', querying_1.Query);
exports.default = router;
