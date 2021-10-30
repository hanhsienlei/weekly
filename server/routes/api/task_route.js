const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const { updateTask, getTask } = require("../../controllers/task_controller");

router
  .route("/task")
  .post(wrapAsync(updateTask))

module.exports = router
