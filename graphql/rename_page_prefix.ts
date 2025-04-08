import { getAllPages } from './get_all_pages';
import { getOnePage } from './get_one_page';

const r = [
  { id: 194, title: 'CI CD - Github Actions' },
  { id: 197, title: 'aa. HTTP' },
  { id: 229, title: 'ab. ТЗ' },
  { id: 214, title: 'ac. Запуск сервера' },
  { id: 220, title: 'ad. Отправка ответа' },
  { id: 223, title: 'ae. Получение данных из запроса' },
  { id: 209, title: 'af. Архитектуры (Монолит, Микросервисы)' },
  { id: 216, title: 'ag. Логгер (Pino)' },
  { id: 226, title: 'ah. Роутер' },
  { id: 200, title: 'ai. Middleware' },
  { id: 202, title: 'aj. REST API' },
  { id: 196, title: 'ak. DTO. Валидация данных' },
  { id: 218, title: 'al. Обновление пакетов (ncu)' },
  { id: 228, title: 'am. Слои' },
  { id: 212, title: 'an. База данных в файле' },
  { id: 221, title: 'ao. Пагинация' },
  { id: 193, title: 'ap. Bcrypt' },
  { id: 222, title: 'aq. Переменные окружения' },
  { id: 225, title: 'ar. Продвинутый ErrorHandler' },
  { id: 213, title: 'as. Базовое внедрение зависимостей' },
  { id: 227, title: 'at. Сессии.Cookie' },
  { id: 211, title: 'au. Аутентификация' },
  { id: 210, title: 'av. Асинхронный ErrorHandler' },
  { id: 205, title: 'aw. Sequelize ORM' },
  { id: 204, title: 'ax. Sequelize ORM Связи' },
  { id: 207, title: 'ay. UUID' },
  { id: 198, title: 'az. Inversify IoC Продвинутые зависимости' },
  { id: 217, title: 'ba. Миграции и Сиды базы данных' },
  { id: 231, title: 'bb. Транзакции' },
  { id: 199, title: 'bc. JWT' },
  { id: 208, title: 'bd. Авторизация (TODO: ТАБЛИЧКА)' },
  { id: 215, title: 'be. Кеширование' },
  { id: 224, title: 'bf. Почта (SMTP)' },
  { id: 192, title: 'bg. Axios Запрет временной почты' },
  { id: 195, title: 'bh. Cron' },
  { id: 230, title: 'bh. Тесты (unit, e2e) TODO: Дописать' },
  { id: 206, title: 'bi. Telegram Bot API' },
  { id: 219, title: 'bj. Окружения и pm2' },
];

const prefixes: string[] = [];
for (let i = 0; i < 2; i++) {
  const first = String.fromCharCode(97 + i);
  for (let j = 0; j < 26; j++) {
    const second = String.fromCharCode(97 + j);

    prefixes.push(first + second);
  }
}

async function chanePageOrder(upFromPrefix: string, pathStartsWith: string) {
  let pages = await getAllPages();

  pages = pages.filter(({ path }) => path.startsWith(pathStartsWith));

  // Страницу upFromPrefix сразу переименует наверх
  const upFromPrefixIndex = prefixes.indexOf(upFromPrefix);

  for (const page of pages) {
    const [currentPrefix, ...other] = page.title.split('.');
    if (currentPrefix.length !== 2) {
      continue;
    }

    const currentPrefixIndex = prefixes.indexOf(currentPrefix);
    if (currentPrefixIndex >= upFromPrefixIndex) {
      const newPrefix = prefixes[currentPrefixIndex + 1];

      const newTitle = `${newPrefix}.${other.join('.')}`;

      /**
       * WARNING! Сначала вывести в консоль и убедиться в правильности работы скрипта!!!
       */
      console.log(`Старое имя: "${page.title}". Новое имя: "${newTitle}"`);

      const { content } = await getOnePage(page.id);

      /**
       * WARNING! В прошлый раз отработала не идельно. В конце почему-то задвоилась одна буква.
       * Мб я виноват, на этой же букве тестил первый запуск с одним префиксом
       */
      // await updateOnePage(page.id, { title: newTitle, content });
      console.log(`Переименована страница ${page.id}`);
    }
  }
}

chanePageOrder('ai', 'Backend-1/');
