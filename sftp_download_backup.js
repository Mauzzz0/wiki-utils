const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');
const { config: loadEnv } = require('dotenv');

loadEnv();

const config = {
  host: process.env.SFTP_HOST,
  port: 22,
  username: 'root',
  password: process.env.SFTP_PASSWORD,
};

const filename = 'backup_2025-04-08_17:30:04.sql';
const remoteFilePath = `/root/wiki/backups/${filename}`;
const localDir = './backups';

async function downloadFile() {
  const sftp = new Client();

  try {
    await sftp.connect(config);
    console.log('Подключение к SFTP успешно установлено');

    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const localPath = path.join(localDir, filename);

    await sftp.get(remoteFilePath, localPath);
    console.log(`Файл успешно скачан в ${localPath}`);
  } catch (err) {
    console.error('Ошибка:', err.message);
  } finally {
    await sftp.end();
    console.log('Соединение закрыто');
  }
}

downloadFile();
