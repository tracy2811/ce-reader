var fs = require("fs").promises;
var constants = require("fs").constants;
var createError = require("http-errors");
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

const get_delete_book = async (req, res, next) => {
  try {
    const { book } = req.params;
    const dir = `${__dirname}/../public/books/${book}`;
    await fs.access(dir, constants.R_OK & constants.W_OK);
    const data = await fs.readdir(dir);
    res.render("book-delete", {
      title: `${book} | Delete`,
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
    res.redirect("/");
  }
};

const post_delete_book = async (req, res, next) => {
  try {
    const { book } = req.params;
    const filename = `${__dirname}/../public/books/${book}`;
    await fs.rm(filename, { recursive: true, force: true });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

const get_create_book = async (req, res, next) => {
  res.render("book-form", { title: "Create Book" });
};

const post_create_book = async (req, res, next) => {
  const { title } = req.body;
  const fail = () =>
    res.render("book-form", {
      title: "Create Book",
      error: "Invalid book title",
    });
  if (!title) {
    fail();
    return;
  }
  const sanitized_title = title.trim().replace(/\s+/g, " ").replace(/\//g, "");
  if (
    !sanitized_title ||
    sanitized_title == "create-book" ||
    sanitized_title.toLowerCase() == "delete"
  ) {
    fail();
    return;
  }
  const dir = `${__dirname}/../public/books/${sanitized_title}`;
  const success = () => res.redirect(`/${sanitized_title}`);
  try {
    await fs.access(dir, constants.R_OK & constants.W_OK);
    success();
    return;
  } catch (error) {
    try {
      await fs.mkdir(dir);
      success();
    } catch (error) {
      next(error);
    }
  }
};

const get_create_book_chapter = async (req, res, next) => {
  const { book } = req.params;
  const dir = `${__dirname}/../public/books/${book}`;
  try {
    await fs.access(dir, constants.R_OK & constants.W_OK);
    res.render("chapter-form", {
      title: `${book} | Create Chapter`,
      book: {
        url: `/${book}`,
        title: book,
      },
    });
  } catch (error) {
    next(createError(404));
  }
};

const post_create_book_chapter = async (req, res, next) => {
  const { book } = req.params;
  const { title, content } = req.body;
  const fail = () =>
    res.render("chapter-form", {
      title: `${book} | Create Chapter`,
      book: {
        url: `/${book}`,
        title: book,
      },
      error: "Invalid chapter title or content",
    });
  const dir = `${__dirname}/../public/books/${book}`;
  try {
    await fs.access(dir, constants.R_OK & constants.W_OK);
    if (!title || !content) {
      fail();
      return;
    }
    const sanitized_title = title
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\//g, "");
    const sanitized_content = content
      .trim()
      .split("\n")
      .map((p) => p.trim().replace(/\s+/g, " "))
      .filter((p) => !!p)
      .join("\n");
    if (
      !sanitized_title ||
      sanitized_title == "create-chapter" ||
      sanitized_title == "delete" ||
      !sanitized_content
    ) {
      fail();
      return;
    }
    const filename = `${__dirname}/../public/books/${book}/${sanitized_title}`;
    try {
      await fs.access(filename, constants.R_OK);
      fail();
      return;
    } catch (error) {
      try {
        await fs.writeFile(filename, sanitized_content);
        res.redirect(`/${book}/${sanitized_title}`);
      } catch (error) {
        next(error);
      }
    }
  } catch (error) {
    next(createError(404));
  }
};

const get_delete_book_chapter = async (req, res, next) => {
  try {
    const { book, chapter } = req.params;
    const filename = `${__dirname}/../public/books/${book}/${chapter}`;
    await fs.access(filename, constants.R_OK & constants.W_OK);
    res.render("chapter-delete", {
      title: `${book} | ${chapter} | Delete`,
      book: {
        url: `/${book}`,
        title: book,
      },
      chapter: {
        url: `/${book}/${chapter}`,
        title: chapter,
      },
    });
  } catch (error) {
    res.redirect(`/${book}`);
  }
};

const post_delete_book_chapter = async (req, res, next) => {
  try {
    const { book, chapter } = req.params;
    const filename = `${__dirname}/../public/books/${book}/${chapter}`;
    await fs.rm(filename, { recursive: true, force: true });
    res.redirect(`/${book}`);
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
    res.render("chapter-detail", {
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
        completed:
          history[book] && history[book][chapter]
            ? history[book][chapter].completed
            : false,
        bookmark:
          history[book] && history[book][chapter]
            ? history[book][chapter].bookmark
            : -1,
      },
    });
  } catch (error) {
    next(createError(404));
  }
};

const get_book_chapter_list = async (req, res, next) => {
  try {
    const { book } = req.params;
    const data = await fs.readdir(`${__dirname}/../public/books/${book}`);
    const history = getHistory();
    const tokenized_title = tokenizeText(book);
    res.render("chapter-list", {
      tokenized_title,
      title: book,
      book: {
        url: `/${book}`,
        title: book,
      },
      chapter_list: data.map((d) => ({
        url: `/${book}/${d}`,
        title: d,
        completed:
          history[book] && history[book][d]
            ? history[book][d].completed
            : false,
      })),
    });
  } catch (error) {
    next(createError(404));
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
  get_create_book,
  get_create_book_chapter,
  post_create_book,
  post_create_book_chapter,
  get_delete_book,
  post_delete_book,
  get_delete_book_chapter,
  post_delete_book_chapter,
};
