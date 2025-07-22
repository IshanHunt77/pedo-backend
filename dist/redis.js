"use strict";
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
exports.redisConnect = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const redis_1 = require("redis");
const redisConnect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Redis Password:', process.env.REDIS_CLOUD_PASSWORD);
        const client = (0, redis_1.createClient)({
            username: 'default',
            password: process.env.REDIS_CLOUD_PASSWORD,
            socket: {
                host: 'redis-19381.c263.us-east-1-2.ec2.redns.redis-cloud.com',
                port: 19381
            }
        });
        client.on('error', err => console.log('Redis Client Error', err));
        yield client.connect();
        console.log("redis connected"); // >>> bar
        return client;
    }
    catch (error) {
        console.error('Error connecting to redis:', error);
        throw error;
    }
});
exports.redisConnect = redisConnect;
