const router = require("express").Router();
const {
  authentication,
  errorCatcher,
  validateMilestoneDueDate,
} = require("../../../utils/util");

const {
  saveMilestone,
  deleteMilestoneAndChildren,
} = require("../../controllers/milestone_controller");

const { USER_ROLE } = require("../../models/user_model");

router
  .route("/milestone")
  .post(
    authentication(USER_ROLE.ALL),
    validateMilestoneDueDate(),
    errorCatcher(saveMilestone)
  )
  .delete(authentication(USER_ROLE.ALL), errorCatcher(deleteMilestoneAndChildren));

module.exports = router;
