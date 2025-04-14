import { gql, request } from 'graphql-request';
import { headers, url } from './constants';

export const createPage = async (info: { content: string; path: string; title: string }) => {
  const mutation = gql`
    mutation (
      $content: String!
      $description: String!
      $editor: String!
      $isPrivate: Boolean!
      $isPublished: Boolean!
      $locale: String!
      $path: String!
      $tags: [String]!
      $title: String!
    ) {
      pages {
        create(
          content: $content
          description: $description
          editor: $editor
          isPublished: $isPublished
          isPrivate: $isPrivate
          locale: $locale
          path: $path
          title: $title
          tags: $tags
        ) {
          responseResult {
            succeeded
            slug
            message
          }
          page {
            id
            path
            hash
            title
          }
        }
      }
    }
  `;

  const data = {
    editor: 'ckeditor',
    isPublished: true,
    isPrivate: false,
    locale: 'ru',
    tags: [],
    description: '',
    ...info,
  };

  const response = await request<any>(url, mutation, data, headers);

  console.log(`Страница успешно создана`);

  return response.pages.create.page;
};
