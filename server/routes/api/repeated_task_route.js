const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const {
  saveNewRepeatedTask,
  deleteNewRepeatedTask,
  updateSavedRepeatedTask,
  deleteSavedRepeatedTask,
  stopRepeatTask,
} = require("../../controllers/repeated_task_controller");

router
  .route("/repeated-task/new")
  .post(wrapAsync(saveNewRepeatedTask))
  .delete(wrapAsync(deleteNewRepeatedTask))

router
  .route("/repeated-task/saved")
  .post(wrapAsync(updateSavedRepeatedTask))
  .delete(wrapAsync(deleteSavedRepeatedTask));

router.route("/repeated-task/stop").post(wrapAsync(stopRepeatTask));

module.exports = router;
