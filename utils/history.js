var fs = require("fs");

const historyPath = `${__dirname}/../public/.history.txt`;
const bookDir = `${__dirname}/../public/books`;

let history = (() => {
  try {
    return JSON.parse(fs.readFileSync(historyPath, "utf8"));
  } catch (err) {
    console.error(err);
    return {};
  }
})();

const getHistory = () => history;

const updateHistory = async (book, chapter, index, bookmark) => {
  if (index < 0) return false;
  const chapterContent = await fs.promises.readFile(
    `${bookDir}/${book}/${chapter}`,
    "utf8"
  );
  const length = chapterContent
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => !!e).length;

  if (index < length) {
    if (bookmark) {
      if (!history[book]) {
        history[book] = {};
      }
      history[book][chapter] = {
        bookmark: index,
        completed: index == length - 1,
      };
    } else if (history[book] && history[book][chapter]) {
      delete history[book][chapter];
    }
  } else {
    return false;
  }
  return true;
};

const saveHistory = async () =>
  await fs.promises.writeFile(historyPath, JSON.stringify(history));

module.exports = {
  updateHistory,
  getHistory,
  saveHistory,
};
