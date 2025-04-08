import { request } from 'graphql-request';
import { headers, url } from './common';

export async function deletePages(pageId: number | number[] | { id: number }[]) {
  const ids = [pageId].flat(2).map((value) => {
    if (typeof value === 'number') {
      return value;
    }

    return value.id;
  });

  for (const id of ids) {
    const query = `
        mutation {
            pages {
                delete(id: ${id}) {
                    responseResult {
                        succeeded
                    }
                }
            }
        }`;

    await request<any>(url, query, {}, headers);

    console.log(`Страница успешно удалена ${id}`);
  }
}

deletePages([
  {
    id: 239,
  },
  {
    id: 238,
  },
  {
    id: 237,
  },
  {
    id: 236,
  },
  {
    id: 235,
  },
  {
    id: 234,
  },
  {
    id: 233,
  },
]);
