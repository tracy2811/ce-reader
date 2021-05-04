var fs = require("fs").promises;
var { tokenizeFile, tokenizeText } = require("../utils/tokenize");
var { getHistory, saveHistory } = require("../utils/history");

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
    const tokenized_paragraph = await tokenizeFile(
      `${__dirname}/../public/books/${book}/${chapter}`
    );
    const title = `${book} | ${chapter}`;
    const tokenized_title = tokenizeText(title);
    const history = await getHistory();
    const paragraphs = tokenized_paragraph.map((p, i) => ({
      content: p,
      saved:
        history[book] && history[book][chapter] && i == history[book][chapter],
    }));
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
      })),
    });
  } catch (error) {
    next(error);
  }
};

const put_history = async (req, res, next) => {
  const history = await getHistory();
  const { book, chapter, index } = req.body;
  if (book && chapter && index >= 0) {
    if (!history[book]) {
      history[book] = {};
    }
    history[book][chapter] = index;
    try {
      await saveHistory(history);
      res.status(200).json(history);
    } catch (err) {
      res.status(500).end();
    }
  } else {
    res.status(400).end();
  }
};

module.exports = {
  get_book_list,
  get_book_chapter_detail,
  get_book_chapter_list,
  put_history,
};
