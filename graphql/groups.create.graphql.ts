import { gql, request } from 'graphql-request';
import { headers, url } from './constants';

export async function groupsCreate(name: string) {
  const data = { name };

  const query = gql`
    mutation ($name: String!) {
      groups {
        create(name: $name) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
          group {
            id
            name
            createdAt
            updatedAt
          }
        }
      }
    }
  `;

  const response = await request<any>(url, query, data, headers);

  console.log(`Создана группа ${name}`);

  return response.groups.create.group;
}
