var express = require("express");
var router = express.Router();
var bookController = require("../controllers/book");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

router.get("/", bookController.get_book_list);
router.get("/create-book", bookController.get_create_book);
router.post("/create-book", bookController.post_create_book);
router.get("/:book", bookController.get_book_chapter_list);
router.get("/:book/delete", bookController.get_delete_book);
router.post("/:book/delete", bookController.post_delete_book);
router.get("/:book/create-chapter", bookController.get_create_book_chapter);
router.post("/:book/create-chapter", bookController.post_create_book_chapter);
router.get("/:book/:chapter/delete", bookController.get_delete_book_chapter);
router.post("/:book/:chapter/delete", bookController.post_delete_book_chapter);
router.get("/:book/:chapter", bookController.get_book_chapter_detail);
router.put("/history", bookController.put_history);

module.exports = router;
