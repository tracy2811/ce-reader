var fs = require("fs");
var nodejieba = require("nodejieba");

const { traditionalDict, simplifiedDict, maxLength } = (() => {
  const traditionalDict = {};
  const simplifiedDict = {};

  const data = fs.readFileSync(
    `${__dirname}/../public/dictionaries/cedict_ts.u8`,
    "utf-8"
  );

  data.split("\n").forEach((l) => {
    if (!l || l[0] == "#") {
      return;
    }
    let text = l;
    let nextIndex = text.indexOf(" ");
    const traditional = text.slice(0, nextIndex);

    text = text.slice(nextIndex + 1);
    nextIndex = text.indexOf(" ");
    const simplified = text.slice(0, nextIndex);

    text = text.slice(nextIndex + 1);
    nextIndex = text.indexOf("]");
    const pinyin = text.slice(1, nextIndex).toLowerCase();

    text = text.slice(nextIndex + 3, text.length - 1);
    const meaning = text.split("/").filter((m) => !!m);

    if (traditionalDict[traditional]) {
      traditionalDict[traditional].push({
        traditional,
        simplified,
        pinyin,
        meaning,
      });
    } else {
      traditionalDict[traditional] = [
        { traditional, simplified, pinyin, meaning },
      ];
    }

    if (simplifiedDict[simplified]) {
      simplifiedDict[simplified].push({
        traditional,
        simplified,
        pinyin,
        meaning,
      });
    } else {
      simplifiedDict[simplified] = [
        { traditional, simplified, pinyin, meaning },
      ];
    }
  });

  const maxLength = Math.max(
    ...Object.keys(traditionalDict).map((key) => key.length)
  );

  return { traditionalDict, simplifiedDict, maxLength };
})();

const naiveTokenize = (text) => {
  let result = [];
  let start = 0;

  while (start < text.length) {
    let length = 0;
    for (let l = 1; l <= maxLength && l <= text.length; ++l) {
      let term = text.slice(start, start + l);
      if (traditionalDict[term] || simplifiedDict[term]) {
        length = l;
      }
    }
    if (length > 0) {
      const term = text.slice(start, start + length);
      result.push({
        term,
        dict: traditionalDict[term]
          ? traditionalDict[term]
          : simplifiedDict[term],
      });
      start += length;
    } else {
      result.push({ term: text[start] });
      start++;
    }
  }
  return result;
};

const tokenizeText = (text) => {
  const result = nodejieba.cut(text).reduce((acc, term) => {
    if (traditionalDict[term]) {
      acc.push({
        term,
        dict: traditionalDict[term],
      });
    } else if (simplifiedDict[term]) {
      acc.push({
        term,
        dict: simplifiedDict[term],
      });
    } else if (term.length == 1) {
      acc.push({
        term,
      });
    } else {
      acc = acc.concat(naiveTokenize(term));
    }
    return acc;
  }, []);
  return result;
};

const tokenizeFile = async (path) => {
  const data = await fs.promises.readFile(path, "utf8");

  const tokenizedParagraphs = data
    .split("\n")
    .filter((text) => !!text)
    .map((text) => tokenizeText(text));

  return tokenizedParagraphs;
};

module.exports = { tokenizeFile, tokenizeText };
