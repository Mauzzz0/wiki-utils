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
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        query: graphqlMutation,
      },
    });

    console.log('Страница успешно удалена:', id);
  } catch (error) {
    console.error('Ошибка при удалении страницы:', error.response?.data || error.message);
    throw error;
  }
}

const main = async () => {
  const ids = [
    {
      id: 191,
    },
    {
      id: 190,
    },
    {
      id: 189,
    },
    {
      id: 188,
    },
    {
      id: 187,
    },
    {
      id: 186,
    },
    {
      id: 185,
    },
    {
      id: 184,
    },
    {
      id: 183,
    },
    {
      id: 182,
    },
    {
      id: 181,
    },
    {
      id: 180,
    },
  ];

  for (const { id } of ids) {
    await deletePage(id);
  }
};

main();
