const router = require("express").Router();
const { authentication, wrapAsync } = require("../../../utils/util");

const { getGoalsLife } = require("../../controllers/life_controller");
const { USER_ROLE } = require("../../models/user_model");

router
  .route("/life")
  .get(authentication(USER_ROLE.ALL), wrapAsync(getGoalsLife));

module.exports = router;
