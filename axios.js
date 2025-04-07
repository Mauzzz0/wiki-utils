const axios = require('axios');

const { config } = require('dotenv');

config();

const wikiAxios = axios.create({
  url: 'http://localhost/graphql',
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.TMP_WIKI_JS_API_TOKEN}`,
  },
});

module.exports = wikiAxios;
