const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const { saveGoal, getGoal, getGoalWithPlan, getGoalProgress, getGoalsByUser } = require("../../controllers/goal_controller");

router
  .route("/goals")
  .get(wrapAsync(getGoalsByUser))

router
  .route("/goal")
  .post(wrapAsync(saveGoal))

router
  .route("/goal/plan")
  .get(wrapAsync(getGoalWithPlan))

router
  .route("/goal/progress")
  .get(wrapAsync(getGoalProgress))

module.exports = router
