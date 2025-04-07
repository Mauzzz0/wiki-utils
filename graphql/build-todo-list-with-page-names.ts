import { getAllPages } from './get_all_pages';

async function buildTodoListWithPageNames() {
  let pages = await getAllPages();

  // Sort by PATH's first word + title
  pages = pages
    .filter(({ path }) => !path.startsWith('Users'))
    .sort((a, b) => {
      const [aPath] = a.path.split('/');
      const [bPath] = b.path.split('/');
      return aPath.localeCompare(bPath) || a.title.localeCompare(b.title);
    });

  const openTag = '<ul class="todo-list">\n';
  const closeTag = '</ul>\n';
  const nbsp = '<p>&nbsp;</p>\n';

  let { html } = pages.reduce(
    (acc, page) => {
      const li = `<li><label class="todo-list__label"><input type="checkbox" disabled="disabled"><span class="todo-list__label__description">&nbsp; </span></label><a href="/${page.path}"><label class="todo-list__label"><span class="todo-list__label__description">${page.title}</span></label></a></li>\n`;

      const [section] = page.path.split('/');

      if (section !== acc.previousSection) {
        if (acc.previousSection !== '') {
          acc.html += closeTag;
        }

        acc.previousSection = section;

        acc.html += nbsp;
        acc.html += nbsp;
        acc.html += `<h1>${section}</h1>\n`;
        acc.html += openTag;
      }

      acc.html += li;

      return acc;
    },
    { html: '', previousSection: '' },
  );

  html += closeTag;

  console.log(html);
}

buildTodoListWithPageNames();
