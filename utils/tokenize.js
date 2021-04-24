var fs = require("fs").promises;

const traditionalDict = {};
const simplifiedDict = {};

(async () => {
  const data = await fs.readFile(
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
  return { traditionalDict, simplifiedDict };
})();

const tokenize = async (path) => {
  const data = await fs.readFile(path, "utf-8");

  const maxLength = Math.max(
    ...Object.keys(traditionalDict).map((key) => key.length)
  );

  const tokenizedParagraphs = data
    .split("\n")
    .filter((text) => !!text)
    .map((text) => {
      let result = [];
      let start = 0;

      while (start < text.length) {
        let length = 0;
        for (let l = 1; l <= maxLength; ++l) {
          let term = text.slice(start, start + l);
          if (traditionalDict[term] || simplifiedDict[term]) {
            length = l;
          }
        }

        if (length > 0) {
          const term = text.slice(start, start + length);
          const dict = traditionalDict[term]
            ? traditionalDict[term]
            : simplifiedDict[term];
          result.push({
            term,
            dict: [...dict],
          });
          start += length;
        } else {
          result.push({
            term: text[start],
          });
          start++;
        }
      }
      return result;
    });

  return tokenizedParagraphs;
};

module.exports = { tokenize };
