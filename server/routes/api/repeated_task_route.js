const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const {
  saveNewRepeatedTask,
  saveSavedRepeatedTask,
  updateSavedRepeatedTask,
  deleteSavedRepeatedTask,
  stopRepeatTask,
} = require("../../controllers/repeated_task_controller");

router
  .route("/repeated-task/new")
  .post(wrapAsync(saveNewRepeatedTask))

router
  .route("/repeated-task/saved")
  .post(wrapAsync(updateSavedRepeatedTask))
  .delete(wrapAsync(deleteSavedRepeatedTask));

router.route("/repeated-task/stop").post(wrapAsync(stopRepeatTask));

module.exports = router;
