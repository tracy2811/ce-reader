var fs = require("fs").promises;
var { tokenizeFile, tokenizeText } = require("../utils/tokenize");

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
    const tokenized_paragraph = await tokenizeFile(
      `${__dirname}/../public/books/${book}/${chapter}`
    );
    const title = `${book} | ${chapter}`;
    const tokenized_title = tokenizeText(title);
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
    const tokenized_title = tokenizeText(book);
    console.log(tokenized_title);
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

module.exports = {
  get_book_list,
  get_book_chapter_detail,
  get_book_chapter_list,
};
