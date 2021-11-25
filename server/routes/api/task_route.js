const router = require("express").Router();
const {
  authentication,
  wrapAsync,
  validateTaskDueDate,
} = require("../../../utils/util");

const { updateTask, deleteTask } = require("../../controllers/task_controller");
const { USER_ROLE } = require("../../models/user_model");

router
  .route("/task")
  .post(
    authentication(USER_ROLE.ALL),
    validateTaskDueDate(),
    wrapAsync(updateTask)
  )
  .delete(authentication(USER_ROLE.ALL), wrapAsync(deleteTask));

module.exports = router;
