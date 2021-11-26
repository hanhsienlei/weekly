const router = require("express").Router();
const { authentication, errorCatcher } = require("../../../utils/util");

const { getGoalsLife } = require("../../controllers/life_controller");
const { USER_ROLE } = require("../../models/user_model");

router
  .route("/life")
  .get(authentication(USER_ROLE.ALL), errorCatcher(getGoalsLife));

module.exports = router;
