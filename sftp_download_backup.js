const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');
const { config: loadEnv } = require('dotenv');

loadEnv();

function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Байт';

  const k = 1024;
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

  const formattedValue = decimals === 2 && value % 1 === 0 ? value.toFixed(0) : value;

  return `${formattedValue} ${sizes[i]}`;
}

const config = {
  host: process.env.SFTP_HOST,
  port: 22,
  username: 'root',
  password: process.env.SFTP_PASSWORD,
};

const remoteDir = `/root/wiki/backups`;
const localDir = './backups';

async function downloadLatestFile() {
  const sftp = new Client();

  try {
    await sftp.connect(config);
    console.log('Подключение к SFTP успешно установлено');

    // Получаем список файлов в удаленной директории
    const files = await sftp.list(remoteDir);

    // Фильтруем только файлы (исключаем директории)
    const fileList = files.filter((file) => !file.isDirectory);

    if (fileList.length === 0) {
      console.log('В папке backups нет файлов');
      return;
    }

    // Сортируем файлы по дате изменения (новые сначала)
    fileList.sort((a, b) => b.modifyTime - a.modifyTime);

    // Берем самый новый файл
    const latestFile = fileList[0];
    const remoteFilePath = path.join(remoteDir, latestFile.name);

    console.log(`Самый новый файл: ${latestFile.name}, изменен: ${new Date(latestFile.modifyTime).toISOString()}`);
    console.log(`Размер файла: ${formatFileSize(latestFile.size)}`);

    // Создаем локальную директорию если ее нет
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const localPath = path.join(localDir, latestFile.name);

    await sftp.get(remoteFilePath, localPath);
    console.log(`Файл успешно скачан в ${localPath}`);
  } catch (err) {
    console.error('Ошибка:', err.message);
  } finally {
    await sftp.end();
    console.log('Соединение закрыто');
  }
}

downloadLatestFile();
