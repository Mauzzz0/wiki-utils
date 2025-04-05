const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

const SOURCE_DIR = './notion_dump/Notion dump 4 apr 2025 MD version/Private & Shared/Node JS Backend 59c3d6825fe94f988d9ff66bf09799c6';
const OUTPUT_DIR = './Cleaned_Structure_1';

// Функция для удаления хеша из имени
function cleanName(name) {
  return name.replace(/\s+[a-f0-9]{32}$/, '').trim();
}

// Функция для обработки одного MD файла
async function processMdFile(filePath, cleanFilePath) {
  try {
    // Создаем директорию для выходного файла
    await mkdir(path.dirname(cleanFilePath), { recursive: true });

    // Читаем основной файл
    let content = await readFile(filePath, 'utf8');

    // Проверяем есть ли соответствующая папка
    const dirPath = filePath.replace(/\.md$/, '');
    const tasksFilePath = path.join(dirPath, 'Задания.md');

    try {
      // Если есть файл заданий, добавляем его содержимое
      const tasksContent = await readFile(tasksFilePath, 'utf8');
      content += '\n\n## Задания\n\n' + tasksContent;

      // Обрабатываем изображения в папке заданий
      await processImagesInDir(dirPath, path.dirname(cleanFilePath));
    } catch (err) {
      // Файл заданий не найден - это нормально
    }

    // Сохраняем очищенный файл
    await writeFile(cleanFilePath, content);

    // Обрабатываем изображения в текущей директории
    await processImagesInDir(path.dirname(filePath), path.dirname(cleanFilePath));

    console.log(`Processed: ${cleanFilePath}`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

// Функция для обработки изображений в директории
async function processImagesInDir(sourceDir, targetDir) {
  try {
    const files = await readdir(sourceDir);

    for (const file of files) {
      if (/\.(png|jpg|jpeg|gif)$/i.test(file)) {
        const cleanDirName = cleanName(path.basename(sourceDir));
        const ext = path.extname(file);
        const newName = `${cleanDirName} ${path.basename(file, ext)}${ext}`;

        await mkdir(targetDir, { recursive: true });
        await copyFile(
          path.join(sourceDir, file),
          path.join(targetDir, newName)
        );

        console.log(`Copied image: ${path.join(targetDir, newName)}`);
      }
    }
  } catch (err) {
    // Директория не существует или нет изображений - это нормально
  }
}

// Основная функция
async function processDirectory(dirPath, outputPath) {
  try {
    const items = await readdir(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // Рекурсивно обрабатываем поддиректории
        await processDirectory(
          fullPath,
          path.join(outputPath, cleanName(item))
        );
      } else if (item.endsWith('.md')) {
        // Обрабатываем MD файлы
        const cleanFileName = cleanName(item);
        await processMdFile(
          fullPath,
          path.join(outputPath, cleanFileName)
        );
      }
    }
  } catch (err) {
    console.error(`Error processing directory ${dirPath}:`, err);
  }
}

// Запускаем обработку
processDirectory(SOURCE_DIR, OUTPUT_DIR)
  .then(() => console.log('Processing completed!'))
  .catch(err => console.error('Error:', err));
