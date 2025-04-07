const wikiAxios = require('./axios');

async function linkToPage(id) {
  const pageList = `query Pages { pages { list(limit: 10000) { id, path, title } } }`;

  const graphqlQuery = `
          query {
            pages {
                single(id: ${id}) {
                    content
                }}}`;

  const r = await wikiAxios.post({ data: { query: graphqlQuery } });

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

  console.log(`Страница успешно обновлена: ${id}`);
  return response.data.data.pages.create;
}

const main = async () => {
  const ids = [6];

  for (const id of ids) {
    await linkToPage(id);
  }
};

main();
