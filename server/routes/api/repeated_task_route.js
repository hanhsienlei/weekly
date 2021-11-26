const router = require("express").Router();
const {
  authentication,
  errorCatcher,
  validateTaskDueDate,
} = require("../../../utils/util");

const {
  saveNewRepeatedTask,
  deleteNewRepeatedTask,
  updateSavedRepeatedTask,
  deleteSavedRepeatedTask,
  stopRepeatTask,
} = require("../../controllers/repeated_task_controller");

const { USER_ROLE } = require("../../models/user_model");

router
  .route("/repeated-task/new")
  .post(
    authentication(USER_ROLE.ALL),
    validateTaskDueDate(),
    errorCatcher(saveNewRepeatedTask)
  )
  .delete(authentication(USER_ROLE.ALL), errorCatcher(deleteNewRepeatedTask));

router
  .route("/repeated-task/saved")
  .post(
    authentication(USER_ROLE.ALL),
    validateTaskDueDate(),
    errorCatcher(updateSavedRepeatedTask)
  )
  .delete(authentication(USER_ROLE.ALL), errorCatcher(deleteSavedRepeatedTask));

router
  .route("/repeated-task/stop")
  .post(authentication(USER_ROLE.ALL), errorCatcher(stopRepeatTask));

module.exports = router;
