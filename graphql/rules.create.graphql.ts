import { gql, request } from 'graphql-request';
import { headers, url } from './constants';

export async function rulesCreate(groupId: number, slug: string) {
  const data = {
    id: groupId,
    name: `Student: ${slug}`,
    redirectOnLogin: `/`,
    permissions: ['read:pages', 'read:assets', 'read:comments', 'write:comments'],
    pageRules: [
      {
        id: 'default',
        path: `Users/${slug}`,
        roles: ['read:pages', 'read:assets', 'read:comments', 'write:comments'],
        match: 'EXACT',
        deny: false,
        locales: [],
      },
    ],
  };

  const query = gql`
    mutation (
      $id: Int!
      $name: String!
      $redirectOnLogin: String!
      $permissions: [String]!
      $pageRules: [PageRuleInput]!
    ) {
      groups {
        update(
          id: $id
          name: $name
          redirectOnLogin: $redirectOnLogin
          permissions: $permissions
          pageRules: $pageRules
        ) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
        }
      }
    }
  `;

  const response = await request<any>(url, query, data, headers);
}
