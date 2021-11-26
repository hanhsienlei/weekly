const router = require("express").Router();

const { errorCatcher, authentication } = require("../../../utils/util");

const {
  signUp,
  signIn,
  getUserProfile,
} = require("../../controllers/user_controller");

router.route("/user/signup").post(errorCatcher(signUp));

router.route("/user/signin").post(errorCatcher(signIn));

router.route("/user/profile").get(authentication(), errorCatcher(getUserProfile));

module.exports = router;
