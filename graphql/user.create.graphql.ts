import { gql, request } from 'graphql-request';
import { headers, url } from './constants';

export async function registerNewUser(info: { email: string; name: string; passwordRaw: string; groups: number[] }) {
  const data = {
    providerKey: 'local',
    mustChangePassword: false,
    sendWelcomeEmail: false,
    ...info,
  };

  if (data.passwordRaw.length < 6) {
    throw Error('Password must be at least 6 characters');
  }

  const query = gql`
    mutation (
      $providerKey: String!
      $email: String!
      $name: String!
      $passwordRaw: String
      $groups: [Int]!
      $mustChangePassword: Boolean
      $sendWelcomeEmail: Boolean
    ) {
      users {
        create(
          providerKey: $providerKey
          email: $email
          name: $name
          passwordRaw: $passwordRaw
          groups: $groups
          mustChangePassword: $mustChangePassword
          sendWelcomeEmail: $sendWelcomeEmail
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

  await request<any>(url, query, data, headers);

  console.log(`Пользователь ${data.email} зарегистрирован [${data.passwordRaw}]`);
}
