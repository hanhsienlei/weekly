const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const { saveGoal, getGoal, getGoalWithPlan } = require("../../controllers/goal_controller");

router
  .route("/goal")
  .post(wrapAsync(saveGoal))

router
  .route("/goal/plan")
  .get(wrapAsync(getGoalWithPlan))

module.exports = router
