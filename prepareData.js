const fs = require('fs');
const lines = fs
  .readFileSync('../Female+notepad.txt')
  .toString()
  .split('\r\n')
  .filter((line) => line.length > 5);

const patternObj = {
  sentences: 0,
  keywords: 0,
};

lines.forEach((line) => {
  if ((line.match(/,/g) || []).length > 10) {
    patternObj.keywords++;
  } else {
    patternObj.sentences++;
  }
});
const resolvePattern = (obj) => {
  if (obj.sentences === 3) return '332';
  if (obj.sentences === 2 && obj.keywords === 2) return '222';
  if (obj.sentences === 2 && obj.keywords === 1) return '111';
};
const pattern = resolvePattern(patternObj);

const initialAcc = { titles: [], descriptions: [], keywords: [] };

const folderData = lines.reduce((acc, line, index) => {
  if (pattern === '111') {
    if (index === 0) return { ...acc, titles: [line] };
    if (index === 1) return { ...acc, descriptions: [line] };
    if (index === 2) return { ...acc, keywords: [line] };
    return acc;
  }
  if (pattern === '222') {
    if ([0,1].includes(index)) return { ...acc, titles: [...acc.titles, line], descriptions: [...acc.descriptions, line] };
    if([2,3].includes(index)) return {...acc, keywords: [...acc.keywords, line]}
  }
  if (pattern === '332') {
    if ([0,1,2].includes(index)) return { ...acc, titles: [...acc.titles, line], descriptions: [...acc.descriptions, line] };
    if([3,4].includes(index)) return {...acc, keywords: [...acc.keywords, line]}
  }
}, initialAcc);

console.log(folderData)
