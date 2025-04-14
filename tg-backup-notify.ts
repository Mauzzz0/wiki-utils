import { config } from 'dotenv';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Telegraf } from 'telegraf';

config();

const prettifyFilesize = (bytes: number): string => {
  if (bytes === 0) return '0 Байт';

  const k = 1024;
  const sizes = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${value} ${sizes[i]}`;
};

const getLatestSqlFile = (backupDir: string) => {
  const files = readdirSync(backupDir);

  const sqlFiles = files
    .filter((file) => file.endsWith('.sql'))
    .map((file) => {
      const stats = statSync(join(backupDir, file));

      return {
        name: file,
        path: join(backupDir, file),
        size: prettifyFilesize(stats.size),
        time: stats.mtime.getTime(),
      };
    })
    .sort((a, b) => b.time - a.time);

  if (sqlFiles.length === 0) {
    throw new Error('No SQL files found in backup directory');
  }

  return sqlFiles[0];
};

const bootstrap = async () => {
  if (!process.env.TG_TOKEN) {
    throw Error('process.env.TG_TOKEN is not specified');
  }

  const chatId = process.env.TG_CHAT_ID;
  if (!chatId) {
    throw Error('process.env.TG_CHAT_ID is not specified');
  }

  const bot = new Telegraf(process.env.TG_TOKEN);

  bot.launch();

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  const file = getLatestSqlFile('./backups');
  await bot.telegram.sendMessage(
    chatId,
    `✅ *Создан бекап базы данных*  
   ━━━━━━━━━━━━━━━  
   📂 *Файл:* \`${file.name}\`  
   📊 *Размер:* \`${file.size}\``,
    // eslint-disable-next-line camelcase
    { parse_mode: 'MarkdownV2' },
  );

  bot.stop();
  process.exit();
};

bootstrap();
