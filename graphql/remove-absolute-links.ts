import { getOnePage } from './get_one_page';
import { updateOnePage } from './update_one_page';

const main = async () => {
  const ids = [
    {
      id: 289,
    },
    {
      id: 291,
    },
    {
      id: 2,
    },
    {
      id: 279,
    },
    {
      id: 281,
    },
    {
      id: 285,
    },
    {
      id: 287,
    },
    {
      id: 282,
    },
    {
      id: 283,
    },
    {
      id: 284,
    },
    {
      id: 286,
    },
  ];

  for (const { id } of ids) {
    const page = await getOnePage(id);

    const content = page.content.replace(/href="http:\/\/188.120.224.251/g, 'href="');

    await updateOnePage(id, { content });

    console.log(`Страница ${id} ${page.title} обновлена и ДОЛЖНА БЫТЬ ПЕРЕРЕНДЕРЕНА`);
  }
};

main();
