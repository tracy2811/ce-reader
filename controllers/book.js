var fs = require("fs").promises;
var { tokenizeFile, tokenizeText } = require("../utils/tokenize");
var { getHistory, updateHistory, saveHistory } = require("../utils/history");

const get_book_list = async (req, res, next) => {
  try {
    const data = await fs.readdir(`${__dirname}/../public/books`);
    const title = "图书馆";
    const tokenized_title = tokenizeText(title);
    res.render("book-list", {
      title,
      tokenized_title,
      book_list: data.map((d) => ({ url: `/${d}`, title: d })),
    });
  } catch (error) {
    next(error);
  }
};

const get_book_chapter_detail = async (req, res, next) => {
  try {
    const { book, chapter } = req.params;
    const paragraphs = await tokenizeFile(
      `${__dirname}/../public/books/${book}/${chapter}`
    );
    const title = `${book} | ${chapter}`;
    const tokenized_title = tokenizeText(title);
    const history = getHistory();
    res.render("book-chapter-detail", {
      title,
      tokenized_title,
      book: {
        url: `/${book}`,
        title: book,
      },
      chapter: {
        title: chapter,
        url: `/${book}/${chapter}`,
        paragraphs,
        completed: history[book] && history[book][chapter] ? history[book][chapter].completed : false,
        bookmark:
          history[book] && history[book][chapter] ? history[book][chapter].bookmark : -1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const get_book_chapter_list = async (req, res, next) => {
  try {
    const { book } = req.params;
    const data = await fs.readdir(`${__dirname}/../public/books/${book}`);
    const history = getHistory();
    const tokenized_title = tokenizeText(book);
    res.render("book-chapter-list", {
      tokenized_title,
      title: book,
      book: {
        url: `/${book}`,
        title: book,
      },
      chapter_list: data.map((d) => ({
        url: `/${book}/${d}`,
        title: d,
        completed: history[book] && history[book][d] ? history[book][d].completed : false,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const put_history = async (req, res, next) => {
  const { book, chapter, index, bookmark } = req.body;
  if (!book || !chapter || index < 0 || bookmark == undefined) {
    res.status(400).end();
    return;
  }
  try {
    const updated = await updateHistory(book, chapter, index, bookmark);
    if (!updated) {
      res.status(400).end();
      return;
    }
    try {
      await saveHistory();
      res.status(200).json(getHistory());
    } catch (err) {
      res.status(500).end();
    }
  } catch (err) {
    res.status(400).end();
  }
};

module.exports = {
  get_book_list,
  get_book_chapter_detail,
  get_book_chapter_list,
  put_history,
};
