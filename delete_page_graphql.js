const axios = require('axios');
const { config } = require('dotenv');
config();

async function deletePage(id) {
  const graphqlEndpoint = 'http://localhost/graphql';
  const authToken = process.env.TMP_WIKI_JS_API_TOKEN;

  const graphqlMutation = `
        mutation {
            pages {
                delete(
                    id: ${id}
                ) {
                    responseResult {
                        succeeded
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

    console.log('Страница успешно удалена:', id);
  } catch (error) {
    console.error('Ошибка при удалении страницы:', error.response?.data || error.message);
    throw error;
  }
}

const main = async () => {
  const ids = [
    12,
    8,

  ]


  for (const id of ids) {
    await deletePage(id);
  }
}

main()
