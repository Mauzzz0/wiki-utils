import { gql, request } from 'graphql-request';
import { headers, url } from './constants';

export async function getAllPages(query?: {
  orderBy?: string;
  orderByDirection?: 'ASC' | 'DESC';
}): Promise<{ id: number; path: string; title: string }[]> {
  const { orderBy, orderByDirection } = query ?? {};

  const gquery = gql`
    query Pages {
      pages {
        list(
        limit: 10000
        ${orderBy ? `orderBy: ${orderBy}` : ''}
        ${orderBy ? `orderByDirection: ${orderByDirection}` : ''}
        ) {
          id
          path
          title
        }
      }
    }
  `;

  const data = await request<any>(url, gquery, {}, headers);

  return data.pages.list;
}
