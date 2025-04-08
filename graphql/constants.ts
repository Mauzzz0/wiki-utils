import { config } from 'dotenv';

config();

export const url = 'http://localhost/graphql';
export const headers = { Authorization: `Bearer ${process.env.TMP_WIKI_JS_API_TOKEN}` };
