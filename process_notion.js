const fs = require('fs');
const path = require('path');

function cleanName(name) {
  return name
    .replace(/\s+[a-f0-9]{32}(\.md)?$/, '')
    .replace(/\s+$/, '')
    .trim();
}

// Конфигурация
const SOURCE =
  './notion_dump/Notion dump 4 apr 2025 MD version/Private & Shared/Node JS Backend 59c3d6825fe94f988d9ff66bf09799c6';
const SUBFOLDER = `/Подготовка 183e3e6c787380e18ceeec4a8a3bd3e7`;
const SOURCE_DIR = SOURCE + SUBFOLDER;
const TARGET_DIR = 'Cleaned_Structure_5' + cleanName(SUBFOLDER);

async function main() {
  const files = fs.readdirSync(SOURCE_DIR);

  const mdFiles = files.filter((f) => f.endsWith('.md'));

  for (const file of mdFiles) {
    const filePath = path.join(SOURCE_DIR, file);
    const folderPath = filePath.replace('.md', '');
    let originalMdFileContent = fs.readFileSync(filePath, 'utf8');

    const newFolderName = cleanName(file);
    const newFileName = newFolderName + '.md';

    let filesInFolder = [];
    try {
      filesInFolder = fs.readdirSync(folderPath);
    } catch (e) {}

    console.log(file, filesInFolder);

    for (const fileInFolder of filesInFolder) {
      if (fileInFolder.endsWith('.md')) { // && fileInFolder.toLowerCase().includes('задани')
        const taskFileContent = fs.readFileSync(path.join(folderPath, fileInFolder), 'utf8');

        const separator = taskFileContent.startsWith('# Задания') ? '' : '# Задания';

        originalMdFileContent += '\n' + separator + taskFileContent;

        fs.mkdirSync(path.join(TARGET_DIR, newFolderName), { recursive: true });
        fs.writeFileSync(path.join(TARGET_DIR, newFolderName, cleanName(fileInFolder) + '.md'), originalMdFileContent, 'utf8');
      }

      if (fileInFolder.endsWith('.png') || fileInFolder.endsWith('.webp')) {
        fs.mkdirSync(path.join(TARGET_DIR, newFolderName), { recursive: true });
        await fs.copyFileSync(
          path.join(folderPath, fileInFolder),
          path.join(TARGET_DIR, newFolderName, `${newFolderName} ${fileInFolder}`)
        );
      }
    }

    fs.mkdirSync(path.join(TARGET_DIR, newFolderName), { recursive: true });
    fs.writeFileSync(path.join(TARGET_DIR, newFileName), originalMdFileContent, 'utf8');
  }
}

main();
