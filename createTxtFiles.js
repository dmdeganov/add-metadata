const { readdirSync, writeFile, existsSync } = require('fs');
const path = require('path');

const photosDirectory = path.resolve(__dirname, '..');
let error = false;

const getFoldersList = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => name !== 'add-metadata' && name !== '.idea');

const folders = getFoldersList(photosDirectory);
for (const folder of folders) {

  if (!existsSync(`${photosDirectory}/${folder}.txt`)) {
    writeFile(`${photosDirectory}/${folder}.txt`, '', function (err) {
      if (err) throw err;
      console.log(`${folder}.txt created!`);
    });
  }


}
console.log('The end')
