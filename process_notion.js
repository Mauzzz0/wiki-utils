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
const SUBFOLDER = `/JavaScript aab94ab8885944a481b26d4566918a66`;
const SOURCE_DIR = SOURCE + SUBFOLDER;
const TARGET_DIR = `release ${new Date().toISOString()} ` + cleanName(SUBFOLDER);

const removeNotionMetadata = (content) => {
  const regex1 = /^Owner:.*$/gm;
  const regex2 = /^Last edited.*$/gm;
  const regex3 = /^\[Задания].*$/gm;
  const regex4 = /\n\n\n+/gm;

  return content
    .replace(regex1, '')
    .replace(regex2, '')
    .replace(regex3, '')
    .replace(regex4, '\n\n')
}

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

    originalMdFileContent = removeNotionMetadata(originalMdFileContent)

    fs.mkdirSync(path.join(TARGET_DIR, newFolderName), { recursive: true });
    fs.writeFileSync(path.join(TARGET_DIR, newFileName), originalMdFileContent, 'utf8');
  }
}

main();
