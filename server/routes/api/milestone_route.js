const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");

const { saveMilestone, getMilestone } = require("../../controllers/milestone_controller");

router
  .route("/milestone")
  .post(wrapAsync(saveMilestone))
  .get(wrapAsync(getMilestone));

module.exports = router