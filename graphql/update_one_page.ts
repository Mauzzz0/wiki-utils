import { gql, request } from 'graphql-request';
import { headers, url } from './common';

export async function updateOnePage(
  pageId: number,
  options?: {
    content?: string;
  },
) {
  const query = gql`
    mutation Pages {
      pages {
        update(
        id: ${pageId},
        isPublished: true,
        ${options?.content ? `content: ${JSON.stringify(options.content)}` : ''} 
        ) {
          responseResult {
            succeeded
          }
        }
      }
    }
  `;

  await request<any>(url, query, {}, headers);
}
