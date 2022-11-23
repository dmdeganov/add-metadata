const { readdirSync, writeFile } = require("fs");
const path = require("path");

const photosDirectory = path.resolve(__dirname, "..");

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
  const [titlesQuantity, descsQuantity, keywordsQuantity] = pattern;
  return {
    ...acc,
    [folder]:
      amountOfPhotos <= 5
        ? { titles: [""], descriptions: [""], keywords: [""] }
        : {
            titles: new Array(titlesQuantity).fill(""),
            keywords: new Array(keywordsQuantity).fill(""),
          },
  };
}, {});

writeFile(
  "data.js",
  `const data = ${JSON.stringify(dataTemplate)}; module.exports = data`,
  function (err) {
    if (err) throw err;
    console.log("Saved!");
  }
);
