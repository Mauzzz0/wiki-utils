import { nanoid } from 'nanoid';
import { getOnePage } from './get_one_page';
import { groupsCreate } from './groups.create.graphql';
import { createPage } from './page.create.graphql';
import { rulesCreate } from './rules.create.graphql';
import { registerNewUser } from './user.create.graphql';

const initializeProcess = async () => {
  const templatePageId = 6;
  const allowPublicGroupId = 4;

  const student = {
    name: 'aa', // off. $Name for disabled
    email: 'aa@gmail.com',
    passwordRaw: 'aa', // pwd "inactive" for disabled
  };

  const slug = nanoid(6);
  const path = 'Users/' + slug;

  const { id, render, ...template } = await getOnePage(templatePageId);

  const page = { ...template };
  page.title = student.name;
  page.content = template.content.replace(/\$NAME/g, student.name);
  page.path = path;

  // Page
  await createPage(page);

  // Group
  const group = await groupsCreate(`Student: ${slug}`);

  // Allow rule
  await rulesCreate(group.id, slug);

  // User
  await registerNewUser({ ...student, groups: [allowPublicGroupId, group.id] });
};

initializeProcess();
