import { getAllPages } from './get_all_pages';
import { updateOnePage } from './update_one_page';

const openTag = '<ul class="todo-list">\n';
const closeTag = '</ul>\n';
const nbsp = '<p>&nbsp;</p>\n';
const header = `<blockquote><p><strong>⛔️ Технический раздел!</strong></p></blockquote>\n`;

async function updateContentPage() {
  const CONTENT_PAGE_ID = 232;

  let pages = await getAllPages();

  /**
   * Sorting order:
   * Every not custom path without "/"
   * Every not custom path with "/"
   * Custom order for paths with "/"
   */
  const customSortingOrder = [
    'Intro',
    'WebStorm',
    'Git',
    'Software',
    'JavaScript',
    'TypeScript',
    'Backend-1',
    'Backend-2',
  ];
  pages = pages
    .filter(({ path }) => !path.startsWith('Users'))
    .sort((a, b) => {
      const aHasSlash = a.path.includes('/');
      const bHasSlash = b.path.includes('/');

      if (aHasSlash !== bHasSlash) {
        return aHasSlash ? 1 : -1;
      }

      const [aPathPart] = a.path.split('/');
      const [bPathPart] = b.path.split('/');

      const aPriority = customSortingOrder.indexOf(aPathPart);
      const bPriority = customSortingOrder.indexOf(bPathPart);

      if (aPriority !== bPriority) {
        return aPriority > bPriority ? 1 : -1;
      }

      const pathComparison = aPathPart.localeCompare(bPathPart);

      if (pathComparison !== 0) {
        return pathComparison;
      }

      return a.orderPriority - b.orderPriority;
    });

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
        acc.html += `<h1>${section}</h1>\n`;
        acc.html += openTag;
      }

      acc.html += li;

      return acc;
    },
    { html: header, previousSection: '' },
  );

  html += closeTag;

  await updateOnePage(CONTENT_PAGE_ID, { content: html });

  console.log(`Page ${CONTENT_PAGE_ID} updated`);
}

updateContentPage();
