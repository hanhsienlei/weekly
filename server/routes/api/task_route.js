const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const { updateTask, getTask, deleteTask } = require("../../controllers/task_controller");

router
  .route("/task")
  .post(wrapAsync(updateTask))
  .delete(wrapAsync(deleteTask))

module.exports = router
