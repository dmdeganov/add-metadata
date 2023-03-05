const { exiftool } = require('exiftool-vendored');
const path = require('path');

const insertWordsToImage = async (pathToImage, toInsert) => {
  const imageMeta = await exiftool.read(pathToImage);
  const { Title, Keywords, Description } = imageMeta;
  console.log({ Title, Keywords, Description });
  const newTitle = Title.replaceAll('$', toInsert);
  const newDescription = Description.replaceAll('$', toInsert);
  const keywordsToInsert = toInsert.split(' ').join(', ');
  const newKeywords = Keywords.replaceAll('$', keywordsToInsert);

  const keywordsArr = newKeywords.split(',').map((keyword) => keyword.trim());
  const keywordsAmount = keywordsArr.length;
  if (keywordsAmount > 48 || keywordsAmount < 45) {
    console.log(`!!! "${pathToImage}", has ${keywordsAmount} keywords !!!`);
  }
  const duplicatedWords = keywordsArr.filter((item, i) => keywordsArr.indexOf(item) !== i);
  if (duplicatedWords.length) {
    console.log(`!!! "${pathToImage}" has duplicated keywords: ${duplicatedWords.join(', ')} !!!`);
  }

  const tags = {
    Title: newTitle,
    ObjectName: newTitle,
    Keywords: newKeywords,
    Subject: newKeywords,
    ImageDescription: newDescription,
    'Caption-Abstract': newDescription,
    Description: newDescription,
  };
  await exiftool.write(pathToImage, tags);
};

module.exports = { insertWordsToImage };
