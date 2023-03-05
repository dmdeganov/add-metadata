const { readdirSync, writeFile, existsSync } = require('fs');
const path = require('path');
const createTagsFromTxt = require('./createTagsFromTxt');

const photosDirectory = path.resolve(__dirname, '..');
let error = false;

const getFoldersList = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => name !== 'add-metadata' && !name.startsWith('.'));

const folders = getFoldersList(photosDirectory);
folders.forEach((folder) => {
  if (!existsSync(`${photosDirectory}/${folder}.txt`)) {
    console.log(`file ${folder}.txt doesn't exist`);
    error = true;
  }
});

const dataTemplate =
  !error &&
  folders.reduce((acc, folder) => {
    const folderPath = path.resolve(__dirname, '..', folder);
    const amountOfPhotos = readdirSync(folderPath).length;
    const patterns = {
      upTo5: [1, 1, 1],
      upTo10: [2, 2, 2],
      above10: [3, 3, 2],
    };
    const pattern = (() => {
      if (amountOfPhotos <= 5) return patterns.upTo5;
      if (amountOfPhotos <= 10) return patterns.upTo10;
      if (amountOfPhotos > 10) return patterns.above10;
    })();
    const [titlesQuantity, descriptionsQuantity, keywordsQuantity] = pattern;
    const patternTagsQuantity = { titlesQuantity, descriptionsQuantity, keywordsQuantity };
    const { folderData: folderTags, error: errorInTxtFIle } = createTagsFromTxt(
      path.resolve(__dirname, '..', `${folder}.txt`)
    );
    if (!folderTags || errorInTxtFIle) {
      error = true;
      if (errorInTxtFIle) {
        console.log(errorInTxtFIle);
      } else {
        console.log(`unknown error in folder ${folder}`);
      }
      return;
    }
    const folderTagsQuantity = {
      titlesQuantity: folderTags.titles.length,
      descriptionsQuantity: folderTags.descriptions.length,
      keywordsQuantity: folderTags.keywords.length,
    };
    folderTags.keywords.forEach((keywords, index) => {
      const keywordsArr=  keywords.split(',').map(keyword => keyword.trim())
      const keywordsAmount = keywordsArr.length;
      if (keywordsAmount > 48 || keywordsAmount < 45) {
        console.log(`!!! folder "${folder}", set ${index + 1}, has ${keywordsAmount} keywords !!!`);
      }
      const duplicatedWords = keywordsArr.filter((item, i) => keywordsArr.indexOf(item) !== i);
      if(duplicatedWords.length){
        console.log(`!!! folder "${folder}", set ${index + 1}, has duplicated keywords: ${duplicatedWords.join(', ')} !!!`);
      }

    });
    for (const tag in folderTagsQuantity) {
      if (folderTagsQuantity[tag] !== patternTagsQuantity[tag]) {
        console.log(
          `folder ${folder} has ${folderTagsQuantity[tag]} ${tag.replace('Quantity', '')}, but must have ${
            patternTagsQuantity[tag]
          }`
        );
        error = true;
      }
    }

    return {
      ...acc,
      [folder]: folderTags,
    };
  }, {});

if (!error) {
  // writeFile('data.js', `const data = ${JSON.stringify(dataTemplate)}; module.exports = data`, function (err) {
  //   if (err) throw err;
  //   console.log('Saved!');
  // });
} else {
  console.log('files were not changed');
}
