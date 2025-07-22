import {
  createClient,
  SCHEMA_FIELD_TYPE,
} from 'redis';

export const redisConnect = async () => {
  try {
    const client = createClient({ url: 'redis://localhost:6379' });
    await client.connect();
    console.log('redis connected');
    return client;
  } catch (error) {
    console.error('Error connecting to redis:', error);
    throw error;
  }
};