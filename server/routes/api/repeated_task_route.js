const router = require("express").Router();
const {
  authentication,
  wrapAsync,
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
    wrapAsync(saveNewRepeatedTask)
  )
  .delete(authentication(USER_ROLE.ALL), wrapAsync(deleteNewRepeatedTask));

router
  .route("/repeated-task/saved")
  .post(
    authentication(USER_ROLE.ALL),
    validateTaskDueDate(),
    wrapAsync(updateSavedRepeatedTask)
  )
  .delete(authentication(USER_ROLE.ALL), wrapAsync(deleteSavedRepeatedTask));

router
  .route("/repeated-task/stop")
  .post(authentication(USER_ROLE.ALL), wrapAsync(stopRepeatTask));

module.exports = router;
