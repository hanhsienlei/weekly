const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const { saveMilestone, getMilestone, deleteMilestoneAndChildren } = require("../../controllers/milestone_controller");

router
  .route("/milestone")
  .post(wrapAsync(saveMilestone))
  .delete(wrapAsync(deleteMilestoneAndChildren))

module.exports = router