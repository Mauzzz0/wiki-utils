const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const folder = './release 2025-04-08T14:21:54.370Z Backend (Nest JS)/images/';

/**
 * WARNING! Should use only in localhost DEV mode. Due to server needs to disable checks at `/u` endpoint.
 */
const main = () => {
  const files = fs.readdirSync(folder);

  for (const filename of files) {
    const formData = new FormData();
    formData.append('mediaUpload', '{"folderId":0}');
    formData.append('mediaUpload', fs.createReadStream(`${folder}${filename}`), { filename });

    fetch('http://localhost:3000/u', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        console.log(`Loaded ${filename}`);
      })
      .catch((error) => console.error('Error:', error));
  }
};

main();
