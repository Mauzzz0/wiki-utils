const fs = require('fs');
const path = require('path');

// Конфигурация
const SOURCE_DIR = './notion_dump/Notion dump 4 apr 2025 MD version/Private & Shared/Node JS Backend 59c3d6825fe94f988d9ff66bf09799c6';
const TARGET_DIR = 'Cleaned_Structure_4';

// Функция для проверки, является ли строка хешем (32 символа a-z0-9)
function isHash(str) {
  return /^[a-f0-9]{32}$/.test(str);
}

// Функция для удаления хеша из имени файла/папки
function removeHash(name) {
  const parts = name.split(' ');
  if (parts.length > 1 && isHash(parts[parts.length - 1])) {
    return parts.slice(0, -1).join(' ');
  }
  return name;
}

// Функция для обработки файла
async function processFile(filePath, relativePath, targetBaseDir) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  const parentDirName = path.basename(dirName);

  // Создаем целевую директорию, сохраняя структуру
  const targetDir = path.join(targetBaseDir, path.dirname(relativePath));
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Обработка изображений PNG
  if (fileName.toLowerCase().endsWith('.png')) {
    const newFileName = removeHash(parentDirName) + ' ' + removeHash(fileName);
    const targetPath = path.join(targetDir, newFileName);
    fs.copyFileSync(filePath, targetPath);
    return;
  }

  // Обработка MD файлов
  if (fileName.toLowerCase().endsWith('.md')) {
    // Удаляем хеш из имени файла
    const newFileName = removeHash(fileName);
    const targetPath = path.join(targetDir, newFileName);

    // Копируем основной файл
    fs.copyFileSync(filePath, targetPath);

    // Проверяем, есть ли папка с заданиями
    const assignmentsDir = path.join(dirName, 'Задания');
    if (fs.existsSync(assignmentsDir) && fs.statSync(assignmentsDir).isDirectory()) {
      // Ищем файл заданий
      const assignmentFiles = fs.readdirSync(assignmentsDir)
        .filter(f => f.toLowerCase().endsWith('.md') && f.startsWith('Задания'));

      if (assignmentFiles.length > 0) {
        const assignmentFile = path.join(assignmentsDir, assignmentFiles[0]);
        const assignmentContent = fs.readFileSync(assignmentFile, 'utf8');

        // Добавляем задания в конец основного файла
        fs.appendFileSync(targetPath, '\n\n## Задания\n\n' + assignmentContent);
      }
    }
  }
}

// Рекурсивная обработка директории
async function processDirectory(currentDir, relativePath = '', targetBaseDir = TARGET_DIR) {
  const files = fs.readdirSync(currentDir);

  for (const file of files) {
    if (file === 'processed_files') continue; // Пропускаем целевую директорию

    const fullPath = path.join(currentDir, file);
    const stat = fs.statSync(fullPath);
    const newRelativePath = path.join(relativePath, removeHash(file));

    if (stat.isDirectory()) {
      // Обрабатываем поддиректорию
      await processDirectory(fullPath, newRelativePath, targetBaseDir);
    } else {
      // Обрабатываем файл
      await processFile(fullPath, relativePath, targetBaseDir);
    }
  }
}

// Основная функция
async function main() {
  try {
    // Создаем целевую директорию, если ее нет
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    console.log('Начата обработка файлов...');
    await processDirectory(SOURCE_DIR);
    console.log('Обработка завершена. Результат в папке:', TARGET_DIR);
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}

// Запуск
main();
