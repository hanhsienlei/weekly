const router = require("express").Router();
const {
  authentication,
  errorCatcher,
  validateGoalDueDate,
  authorizationGoalProgress,
} = require("../../../utils/util");

const {
  saveGoal,
  getGoalWithPlan,
  getGoalProgress,
  getGoalsByUser,
  deleteGoalAndChildren,
} = require("../../controllers/goal_controller");
const { USER_ROLE } = require("../../models/user_model");

router
  .route("/goals")
  .get(authentication(USER_ROLE.ALL), errorCatcher(getGoalsByUser));

router
  .route("/goal")
  .post(
    authentication(USER_ROLE.ALL),
    validateGoalDueDate(),
    errorCatcher(saveGoal)
  )
  .delete(authentication(USER_ROLE.ALL), errorCatcher(deleteGoalAndChildren));

router
  .route("/goal/plan")
  .get(authentication(USER_ROLE.ALL), errorCatcher(getGoalWithPlan));

router
  .route("/goal/progress")
  .get(
    authentication(USER_ROLE.ALL),
    authorizationGoalProgress(),
    errorCatcher(getGoalProgress)
  );

module.exports = router;
