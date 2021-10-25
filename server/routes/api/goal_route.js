const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const { saveGoal, getGoal } = require("../../controllers/goal_controller");

router
  .route("/goal")
  .post(wrapAsync(saveGoal))

module.exports = router
