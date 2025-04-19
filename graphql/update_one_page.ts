import { gql, request } from 'graphql-request';
import { headers, url } from './constants';

export async function updateOnePage(
  pageId: number,
  options: {
    title?: string;
    content: string;
  },
) {
  const query = gql`
    mutation Pages {
      pages {
        update(
        id: ${pageId},
        isPublished: true,
        ${options.title ? `title: ${JSON.stringify(options.title)}` : ''} 
        ${options.content ? `content: ${JSON.stringify(options.content)}` : ''} 
        ) {
          responseResult {
            succeeded
          }
        }
      }
    }
  `;

  const res = await request<any>(url, query, {}, headers);
}
