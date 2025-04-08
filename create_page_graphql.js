const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');
const { customAlphabet } = require('nanoid');

config();

async function createPage(filename, path, file) {
  const graphqlEndpoint = 'http://localhost/graphql';
  const authToken = process.env.TMP_WIKI_JS_API_TOKEN;

  const content = fs.readFileSync(filename, 'utf8');

  const slug = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 3)();

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
                    title: "${file.replace('.md', '')}"
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
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        query: graphqlMutation,
      },
    });

    const { id, path, title } = response.data.data.pages.create.page;
    console.log(`Страница успешно создана: ${id} ${path} ${title}`);
    return id;
  } catch (error) {
    console.error('Ошибка при создании страницы:', error.response?.data || error.message);
    throw error;
  }
}

async function changeCodeblock(id) {
  const graphqlEndpoint = 'http://localhost/graphql';
  const authToken = process.env.TMP_WIKI_JS_API_TOKEN;

  const convert = `
  mutation Pages {
    pages {
      convert(id:${id}, editor:"ckeditor") {
        responseResult {
                succeeded
          }
      }
    }
  }`;

  const convertResponse = await axios({
    url: graphqlEndpoint,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    data: { query: convert },
  });

  const graphqlQuery = `
          query {
            pages {
                single(id: ${id}) {
                    content
                }
            }
        }
    `;

  const response = await axios({
    url: graphqlEndpoint,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    data: { query: graphqlQuery },
  });

  let content = response.data.data.pages.single.content;

  // Set TS for codeblock
  const regex = /class="language-(plaintext|javascript|jsx|tsx)"/g;
  content = content.replace(regex, 'class="language-typescript"');

  // Up h3. (###) to h2. (##) and h2. (##) to h1. (#)
  content = content.replace(/<\/?h2/g, (match) => (match === '<h2' ? '<h1' : '</h1'));
  content = content.replace(/<\/?h3/g, (match) => (match === '<h3' ? '<h2' : '</h2'));

  const newline = '<p>&nbsp;</p>';
  content = content.replace(/<h2/g, newline + '\n' + '<h2');

  const mutation = `
    mutation Pages {
    pages {
        update(id: ${id}, content: ${JSON.stringify(content)}, isPublished: true) {
            responseResult {
                succeeded
            }
        }
    }
}`;

  await axios({
    url: graphqlEndpoint,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    data: { query: mutation },
  });

  const render = `
    mutation Pages {
    pages {
        render(id: ${id}) {
            responseResult {
                succeeded
            }
        }
    }
}`;

  console.log(`Страница успешно обновлена: ${id}`);
  return response.data.data.pages.create;
}

const main = async () => {
  const wikiPathName = 'Git';
  const folder = 'release 2025-04-08T13:02:40.820Z Инструменты 183e3e6c7873809a91f1edabea498c10/Git';
  const files = fs.readdirSync(folder);

  const createdIds = [];

  for (const file of files) {
    if (!file.endsWith('.md')) {
      continue;
    }

    const id = await createPage(path.join(folder, file), wikiPathName, file);

    createdIds.push(id);
  }

  for (const id of createdIds) {
    await changeCodeblock(id);
  }
};

main();
