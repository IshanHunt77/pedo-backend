import { configDotenv } from 'dotenv';
configDotenv();
import {
  createClient,
  SCHEMA_FIELD_TYPE,
} from 'redis';

export const redisConnect = async () => {
  try {
    
console.log('Redis Password:', process.env.REDIS_CLOUD_PASSWORD);

const client = createClient({
    username: 'default',
    password: process.env.REDIS_CLOUD_PASSWORD,
    socket: {
        host: 'redis-19381.c263.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 19381
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

console.log("redis connected")  // >>> bar


    return client;
  } catch (error) {
    console.error('Error connecting to redis:', error);
    throw error;
  }
};
