const { readdirSync, renameSync, readFileSync, writeFile, unlink } = require('fs');
const path = require('path');
const data = require('./data');
const { exiftool } = require('exiftool-vendored');

const photosDirectory = path.resolve(__dirname, '..');
const combinations = {
  111: ['111'],
  222: ['121', '212', '122', '211'],
  332: ['131', '322', '211', '311', '132', '321', '212', '121', '232', '122', '312', '231'],
};

const getFoldersList = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => name !== 'add-metadata' && !name.startsWith('.'));
const folders = getFoldersList(photosDirectory);

const missingAmountOfTags = [];

const foldersWithMissingTags = folders.reduce((acc, folder) => {
  if (data[folder].titles.length > 1) {
    data[folder].descriptions = data[folder].titles;
  }
  const { titles, descriptions, keywords } = data[folder] || {};
  console.log({ folder, titles, descriptions, keywords });
  if (!titles.every((value) => value) || !descriptions.every((value) => value) || !keywords.every((value) => value)) {
    acc.push(folder);
  }
  const amountOfTags = `${titles.length}${descriptions.length}${keywords.length}`;
  if (!combinations[amountOfTags]) {
    missingAmountOfTags.push({ folder, missingCombination: amountOfTags });
  }
  return acc;
}, []);

console.log({ foldersWithMissingTags });
if (foldersWithMissingTags.length > 0) {
  foldersWithMissingTags.forEach((folder) => {
    console.log(`tags are missing for folder ${folder}`);
  });
  return;
}
if (missingAmountOfTags.length > 0) {
  missingAmountOfTags.forEach((problem) =>
    console.log(`missing tags combination ${problem.missingCombination} in folder ${problem.folder}`)
  );
  return;
}

const addMetaTagsToFolder = async (folder) => {
  const { titles, descriptions, keywords } = data[folder] || {};
  const folderPath = path.resolve(__dirname, '..', folder);
  const amountOfTags = `${titles.length}${descriptions.length}${keywords.length}`;
  const tagsPattern = combinations[amountOfTags];
  let index = 0;
  const calcNextIndex = () => {
    if (tagsPattern[index + 1]) {
      index++;
    } else {
      index = 0;
    }
    return index;
  };

  for (const file of readdirSync(folderPath)) {
    const fileName = path.resolve(__dirname, '..', folder, file);
    const [titleIndex, descriptionIndex, keywordsIndex] = tagsPattern[index].split('').map((number) => +number - 1);

    const tags = {
      Title: titles[titleIndex],
      ObjectName: titles[titleIndex],
      Keywords: keywords[keywordsIndex],
      Subject: keywords[keywordsIndex],
      ImageDescription: descriptions[descriptionIndex],
      'Caption-Abstract': descriptions[descriptionIndex],
      Description: descriptions[descriptionIndex],
    };
    await exiftool.write(fileName, tags);
    // exiftool.read(fileName).then((data) => console.log(data));
    console.log(`${file} rewritten with pattern ${tagsPattern[index]}`, {
      title: tags.Title,
      keywords: tags.Keywords,
      description: tags.ImageDescription,
      pattern: tagsPattern[index],
    });
    index = calcNextIndex();
  }

  for (const file of readdirSync(folderPath)) {
    if (file.includes('original')) {
      const fileName = path.resolve(__dirname, '..', folder, file);
      unlink(fileName, function (err) {
        if (err) console.log(err);
      });
    }
  }
};
(async () => {
  for (const folder of folders) {
    await addMetaTagsToFolder(folder);
    if (folders.indexOf(folder) === folders.length - 1) {
      await exiftool.end();
      console.log('Tags successfully added. And... I love you, Mary :)');
    }
  }
})();
