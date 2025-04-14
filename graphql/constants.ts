import { config } from 'dotenv';

config();

export const url = `${process.env.WIKI_JS_URL}/graphql`;
export const headers = { Authorization: `Bearer ${process.env.TMP_WIKI_JS_API_TOKEN}` };
