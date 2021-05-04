var fs = require("fs");

const path = `${__dirname}/../public/.history.txt`;

const getHistory = async () => {
  try {
    const data = await fs.promises.readFile(path, "utf8");
    const history = JSON.parse(data);
    return history;
  } catch (error) {
    return {};
  }
};

const saveHistory = async (history) => {
  await fs.promises.writeFile(path, JSON.stringify(history));
};

module.exports = {
  saveHistory,
  getHistory,
};
