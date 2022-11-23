const { readdirSync, writeFile } = require("fs");
const path = require("path");
const createTagsFromTxt = require('./createTagsFromTxt');

const photosDirectory = path.resolve(__dirname, "..");
let error = false

const getFoldersList = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => name !== "add-metadata" && name !== ".idea");

const folders = getFoldersList(photosDirectory);


const dataTemplate = folders.reduce((acc, folder) => {
  const folderPath = path.resolve(__dirname, "..", folder);
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
  const patternTagsQuantity = {titlesQuantity, descriptionsQuantity, keywordsQuantity}
  const folderTags = createTagsFromTxt(path.resolve(__dirname, "..", `${folder}.txt`))
  if(!folderTags) {
    error = true
    return
  }
  const folderTagsQuantity = {
    titlesQuantity: folderTags.titles.length,
    descriptionsQuantity: folderTags.descriptions.length,
    keywordsQuantity: folderTags.keywords.length,
  };
  for (const tag in folderTagsQuantity){
    if (folderTagsQuantity.tag !== patternTagsQuantity.tag){
      console.log(`${folder} has ${folderTagsQuantity.tag.replace('Quantity', '')} ${tag}, but must have ${patternTagsQuantity.tag}`)
    }
  }

  return {
    ...acc,
    [folder]:folderTags
  };

}, {});

if(!error){
  writeFile(
    "data.js",
    `const data = ${JSON.stringify(dataTemplate)}; module.exports = data`,
    function (err) {
      if (err) throw err;
      console.log("Saved!");
    }
  );
}

