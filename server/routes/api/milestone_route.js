const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const { saveMilestone, getMilestone } = require("../../controllers/milestone_controller");

router
  .route("/milestone")
  .post(wrapAsync(saveMilestone))

module.exports = router