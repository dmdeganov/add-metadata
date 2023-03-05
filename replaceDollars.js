const { readdirSync, writeFile, existsSync, unlink } = require('fs');
const fs = require('fs');
const { exiftool } = require('exiftool-vendored');
const path = require('path');
const { insertWordsToImage } = require('./insertWordsToImage');

const photosDirectory = path.resolve(__dirname, '..');
let error = false;

const getFoldersList = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => name !== 'add-metadata' && !name.startsWith('.'));

const parentFolders = getFoldersList(photosDirectory);
(async () => {
  for (const parentFolder of parentFolders) {
    const subFolders = getFoldersList(path.resolve(photosDirectory, parentFolder));

    for (const subFolder of subFolders) {
      const pathToSubFolder = path.resolve(photosDirectory, parentFolder, subFolder);
      const subFolderFilesList = readdirSync(pathToSubFolder);
      const txtFile = subFolderFilesList.find((file) => {
        const pathToFile = path.resolve(pathToSubFolder, file);
        return path.extname(pathToFile) === '.txt';
      });
      if (!txtFile) return;
      const pathToTxt = path.resolve(pathToSubFolder, txtFile);
      const toInsert = fs.readFileSync(pathToTxt).toString().split('=')[1].split('\r\n')[0].trim();
      const imagesInSubFolder = subFolderFilesList.filter((file) => file !== txtFile);
      for (const image of imagesInSubFolder) {
        const pathToImage = path.resolve(pathToSubFolder, image);
        await insertWordsToImage(pathToImage, toInsert);
      }
      for (const file of readdirSync(pathToSubFolder)) {
        if (file.includes('original')) {
          const fileName = path.resolve(pathToSubFolder, file);
          unlink(fileName, function (err) {
            if (err) console.log(err);
          });
        }
      }
    }
  }

  await exiftool.end();
  console.log('Dollars were successfully replaced');
})();
