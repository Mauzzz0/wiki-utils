import axios from 'axios';
import dayjs from 'dayjs';
import { config } from 'dotenv';
import { createReadStream, readdirSync, statSync, unlinkSync } from 'fs';
import { execSync } from 'node:child_process';
import { join } from 'path';
import { Telegraf } from 'telegraf';

config();

const prettifyFilesize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${value} ${sizes[i]}`;
};
const msToSec = (ms: number) => {
  return (ms / 1000).toFixed(2);
};

const createBackup = () => {
  const start = Date.now();
  const filename = `backup_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}_sql.txt`;
  const filepath = './backups/' + filename;

  execSync('docker exec -t $POSTGRES_CONTAINER_NAME pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_FILE', {
    env: {
      POSTGRES_USER: process.env.POSTGRES_USER,
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
      POSTGRES_DB: process.env.POSTGRES_DB,
      POSTGRES_CONTAINER_NAME: process.env.POSTGRES_CONTAINER_NAME,
      BACKUP_FILE: filepath,
    },
  });

  return {
    filename,
    filepath,
    duration: msToSec(Date.now() - start),
  };
};

const removeOldFiles = () => {
  const keepLast = 10;

  const prefix = 'backup_';
  const dir = './backups';

  const files = readdirSync(dir)
    .filter((file) => file.startsWith(prefix))
    .map((file) => ({
      name: file,
      time: statSync(join(dir, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > keepLast) {
    const filesToDelete = files.slice(keepLast);

    filesToDelete.forEach((file) => {
      const filePath = join(dir, file.name);
      unlinkSync(filePath);
    });

    return filesToDelete.length;
  }

  return 0;
};

const uploadFileToYaDisk = async (file: { filepath: string; filename: string }) => {
  const start = Date.now();

  const {
    data: { href },
  } = await axios.get<{ href: string }>(`https://cloud-api.yandex.net/v1/disk/resources/upload`, {
    headers: { Authorization: `OAuth ${process.env.YA_DISK_TOKEN}` },
    params: { path: `Backups/${encodeURIComponent(file.filename)}` },
  });

  const fileStream = createReadStream(file.filepath);

  await axios.put(href, fileStream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': statSync(file.filepath).size,
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 120000,
  });

  return msToSec(Date.now() - start);
};

const bootstrap = async () => {
  const backup = createBackup();
  const uploadTime = await uploadFileToYaDisk(backup);

  if (!process.env.TG_TOKEN) {
    throw Error('process.env.TG_TOKEN is not specified');
  }

  const chatId = process.env.TG_CHAT_ID;
  if (!chatId) {
    throw Error('process.env.TG_CHAT_ID is not specified');
  }

  const bot = new Telegraf(process.env.TG_TOKEN);

  bot.launch(async () => {
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    const removed = removeOldFiles();

    const size = prettifyFilesize(statSync(backup.filepath).size);

    await bot.telegram.sendMessage(
      chatId,
      `✅ *Создан бекап базы данных*  
   ━━━━━━━━━━━━━━━  
   📂 *Файл:* \`${backup.filename}\`  
   📊 *Размер:* \`${size}\`
   ⌛️ *Время создания:* \`${backup.duration}\` сек
   ⌛️ *Время загрузки:* \`${uploadTime}\` сек
   🗑️ *Удалено старых:* \`${removed}\` файлов
   [Открыть бекапы](https://disk.yandex.ru/client/disk/Backups)`,
      // eslint-disable-next-line camelcase
      { parse_mode: 'MarkdownV2' },
    );

    bot.stop();
    process.exit();
  });
};

bootstrap();
