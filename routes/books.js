var express = require("express");
var router = express.Router();
var bookController = require("../controllers/book");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

router.get("/", bookController.get_book_list);
router.get("/:book", bookController.get_book_chapter_list);
router.get("/:book/:chapter", bookController.get_book_chapter_detail);

module.exports = router;
