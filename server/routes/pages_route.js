const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("index");
});
router.get("/signup", (req, res) => {
  res.render("signup");
});
router.get("/signin", (req, res) => {
  res.render("signin");
});
router.get("/life", (req, res) => {
  res.render("life");
});
router.get("/horizon", (req, res) => {
  res.render("horizon");
});
router.get("/review", (req, res) => {
  res.render("review");
});

module.exports = router;
