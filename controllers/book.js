var fs = require("fs").promises;
var { tokenize } = require("../utils/tokenize");

const get_book_list = async (req, res, next) => {
  try {
    const data = await fs.readdir(`${__dirname}/../public/books`);
    res.render("book-list", {
      title: "图书馆",
      book_list: data.map((d) => ({ url: `/${d}`, title: d })),
    });
  } catch (error) {
    next(error);
  }
};

const get_book_chapter_detail = async (req, res, next) => {
  try {
    const { book, chapter } = req.params;
    const tokenized_paragraph = await tokenize(
      `${__dirname}/../public/books/${book}/${chapter}`
    );
    res.render("book-chapter-detail", {
      title: `${book} | ${chapter}`,
      book: {
        url: `/${book}`,
        title: book,
      },
      chapter: {
        title: chapter,
        url: `/${book}/${chapter}`,
        tokenized_paragraph,
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
    res.render("book-chapter-list", {
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

module.exports = {
  get_book_list,
  get_book_chapter_detail,
  get_book_chapter_list,
};
