import { gql, request } from 'graphql-request';
import { headers, url } from './common';

export async function getOnePage(
  pageId: number,
): Promise<{ id: number; path: string; render: string; content: string }> {
  const query = gql`
    query Pages {
      pages {
        single(id: ${pageId}) {
          id
          path
          render
          content
        }
      }
    }
  `;

  const data = await request<any>(url, query, {}, headers);

  return data.pages.single;
}

getOnePage(2);
