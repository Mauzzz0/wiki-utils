const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

config();

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
  // content = content.replace(/<h1>/g, newline + '\n' +'<h1>');

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

  // await axios({
  //   url: graphqlEndpoint,
  //   method: 'post',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${authToken}`
  //   },
  //   data: { query: render }
  // });

  console.log(`Страница успешно обновлена: ${id}`);
  return response.data.data.pages.create;
}

const main = async () => {
  const ids = [149];

  for (const id of ids) {
    await changeCodeblock(id);
  }
};

// main()
