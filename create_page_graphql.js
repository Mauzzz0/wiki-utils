const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');
const { customAlphabet } = require('nanoid');

config();

async function createPage(filename, folder, file) {
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
                    path: "${folder}/${slug}"
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
  const base = 'Cleaned_Structure_5 release v1'
  const folder = 'JavaScript';
  const files = fs.readdirSync(path.join(base, folder));
  for (const file of files) {
    if (!file.endsWith('.md')) {
      continue;
    }

    await createPage(path.join(base, folder, file), folder, file);
  }
}


main()
