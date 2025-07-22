"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const embed_1 = __importDefault(require("./routes/embed"));
const query_1 = __importDefault(require("./routes/query"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use(express_1.default.json());
app.use('/api/embed', embed_1.default);
app.use('/api/query', query_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
