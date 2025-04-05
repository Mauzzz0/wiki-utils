const { config } = require('dotenv');
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

async function getLatestSqlFile(backupDir) {
  const files = await fs.promises.readdir(backupDir);

  let sqlFiles = files.filter((file) => file.endsWith('.sql'));

  sqlFiles = sqlFiles.map((file) => ({
    name: file,
    path: path.join(backupDir, file),
    time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
  }));

  if (sqlFiles.length === 0) {
    throw new Error('No SQL files found in backup directory');
  }

  // Сортируем по дате изменения (новые сначала)
  sqlFiles.sort((a, b) => b.time - a.time);

  return sqlFiles[0].path;
}

const bootstrap = async () => {
  config();
  const bot = new Telegraf(process.env.TG_TOKEN);

  bot.launch();

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  const source = './' + await getLatestSqlFile('./backups');

  const chatId = 834333336;
  await bot.telegram.sendMessage(chatId, 'Создан бекап базы данных');
  await bot.telegram.sendDocument(chatId, { source });

  bot.stop();
  process.exit();
};

bootstrap();
