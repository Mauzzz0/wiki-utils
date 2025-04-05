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
const OUTPUT_DIR = 'Cleaned_Structure_2';

// Улучшенная функция для удаления хеша из имени
function cleanName(name) {
  // Удаляем хеш (32 hex символа в конце после пробела)
  // и дополнительно очищаем имя от возможных остаточных символов
  return name.replace(/\s+[a-f0-9]{32}(\.md)?$/, '')
    .replace(/\s+$/, '')
    .trim();
}

// Функция для поиска файла заданий в папке
async function findTasksFile(dirPath) {
  try {
    const files = await readdir(dirPath);
    for (const file of files) {
      if (/^Задания(\s+[a-f0-9]{32})?\.md$/i.test(file)) {
        return path.join(dirPath, file);
      }
    }
  } catch (err) {
    // Директория не существует или нет доступа
  }
  return null;
}

// Функция для обработки одного MD файла
async function processMdFile(filePath, cleanFilePath) {
  try {
    // Создаем директорию для выходного файла
    const cleanDir = path.dirname(cleanFilePath);
    await mkdir(cleanDir, { recursive: true });

    // Читаем основной файл
    let content = await readFile(filePath, 'utf8');

    // Ищем соответствующую папку (без хеша в имени)
    const dirPath = path.join(
      path.dirname(filePath),
      cleanName(path.basename(filePath, '.md'))
    );

    // Ищем файл заданий
    const tasksFilePath = await findTasksFile(dirPath);

    if (tasksFilePath) {
      try {
        // Если есть файл заданий, добавляем его содержимое
        const tasksContent = await readFile(tasksFilePath, 'utf8');
        content += '\n\n## Задания\n\n' + tasksContent;
        console.log(`Added tasks from: ${tasksFilePath}`);
      } catch (err) {
        console.error(`Error reading tasks file ${tasksFilePath}:`, err);
      }
    }

    // Сохраняем очищенный файл
    await writeFile(cleanFilePath, content);

    // Обрабатываем изображения в текущей директории
    await processImagesInDir(path.dirname(filePath), cleanDir);

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
        const baseName = path.basename(file, ext);
        const newName = `${cleanDirName} ${baseName}${ext}`;

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
async function processDirectory(dirPath, outputPath, depth = 0) {
  try {
    const items = await readdir(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // Обрабатываем поддиректории (с очисткой имени)
        const cleanItemName = cleanName(item);
        const newOutputPath = path.join(outputPath, cleanItemName);

        await processDirectory(
          fullPath,
          newOutputPath,
          depth + 1
        );
      } else if (item.endsWith('.md')) {
        // Обрабатываем MD файлы (с очисткой имени)
        const cleanFileName = cleanName(item) + '.md';
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
(async () => {
  try {
    console.log('Starting processing...');
    await processDirectory(SOURCE_DIR, OUTPUT_DIR);
    console.log('Processing completed successfully!');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();

