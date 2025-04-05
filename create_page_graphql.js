const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');
const { customAlphabet } = require('nanoid');

config();

async function createPage(filename, path, file) {
  const graphqlEndpoint = 'http://localhost/graphql';
  const authToken = process.env.TMP_WIKI_JS_API_TOKEN;

  const content = fs.readFileSync(filename, 'utf8')

  const slug = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 3)()

  const graphqlMutation = `
        mutation {
            pages {
                create(
                    content: ${JSON.stringify(content)}
                    description: ""
                    editor: "markdown"
                    isPublished: true
                    isPrivate: false
                    locale: "ru"
                    path: "${path}/${slug}"
                    title: "${file.replace('.md', '')} (x)"
                    tags: []
                ) {
                    responseResult {
                        succeeded
                        slug
                        message
                    }
                    page {
                        id
                        path
                        hash
                        title
                    }
                }
            }
        }
    `;

  try {
    const response = await axios({
      url: graphqlEndpoint,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        query: graphqlMutation
      }
    });

    console.log('Страница успешно создана:', response.data.data.pages.create);
    return response.data.data.pages.create;
  } catch (error) {
    console.error('Ошибка при создании страницы:', error.response?.data || error.message);
    throw error;
  }
}

const main = async () => {
  const wikiPathName = 'JavaScript'
  const folder = 'release 2025-04-05T18:47:59.963Z JavaScript';
  const files = fs.readdirSync(folder);
  for (const file of files) {
    if (!file.endsWith('.md')) {
      continue;
    }

    await createPage(path.join(folder, file), wikiPathName, file);
  }
}


main()
