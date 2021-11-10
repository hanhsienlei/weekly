const router = require("express").Router();
const { authentication, wrapAsync, validateGoalDueDate } = require("../../../utils/util");

const { saveGoal, getGoal, getGoalWithPlan, getGoalProgress, getGoalsByUser, deleteGoalAndChildren } = require("../../controllers/goal_controller");
const {
    USER_ROLE
} = require('../../models/user_model');

router
  .route("/goals")
  .get(authentication(USER_ROLE.ALL), wrapAsync(getGoalsByUser))

router
  .route("/goal")
  .post(authentication(USER_ROLE.ALL), validateGoalDueDate(), wrapAsync(saveGoal))
  .delete(authentication(USER_ROLE.ALL), wrapAsync(deleteGoalAndChildren))

router
  .route("/goal/plan")
  .get(authentication(USER_ROLE.ALL), wrapAsync(getGoalWithPlan))

router
  .route("/goal/progress")
  .get(authentication(USER_ROLE.ALL), wrapAsync(getGoalProgress))

module.exports = router
