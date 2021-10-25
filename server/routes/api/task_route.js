const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const { saveTask, getTask } = require("../../controllers/task_controller");

router
  .route("/task")
  .post(wrapAsync(saveTask))

module.exports = router
