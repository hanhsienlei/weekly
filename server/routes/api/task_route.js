const router = require("express").Router();
const {
  authentication,
  errorCatcher,
  validateTaskDueDate,
} = require("../../../utils/util");

const { updateTask, deleteTask } = require("../../controllers/task_controller");
const { USER_ROLE } = require("../../models/user_model");

router
  .route("/task")
  .post(
    authentication(USER_ROLE.ALL),
    validateTaskDueDate(),
    errorCatcher(updateTask)
  )
  .delete(authentication(USER_ROLE.ALL), errorCatcher(deleteTask));

module.exports = router;
