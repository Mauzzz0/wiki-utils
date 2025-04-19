import { getAllPages } from './get_all_pages';
import { getOnePage } from './get_one_page';
import { updateOnePage } from './update_one_page';

const main = async () => {
  const pages = await getAllPages();

  const filteredItems = pages.filter((item) => /^[a-z]{1,2}\./i.test(item.title));

  for (let i = 0; i < filteredItems.length; i++) {
    const page = filteredItems[i];
    const { title, id } = page;

    const spaceIndex = title.indexOf(' ');
    const newTitle = title.substring(spaceIndex + 1);

    console.log(`[${i + 1}/${filteredItems.length}]\t"${title}"\t=>\t\t"${newTitle}"`);

    const { content } = await getOnePage(id);
    await updateOnePage(id, { content, title: newTitle });
  }
};

main();
