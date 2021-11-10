const router = require("express").Router();
const { authentication, wrapAsync, validateMilestoneDueDate } = require("../../../utils/util");

const { saveMilestone, getMilestone, deleteMilestoneAndChildren } = require("../../controllers/milestone_controller");

const {
    USER_ROLE
} = require('../../models/user_model');

router
  .route("/milestone")
  .post(authentication(USER_ROLE.ALL), validateMilestoneDueDate(), wrapAsync(saveMilestone))
  .delete(authentication(USER_ROLE.ALL), wrapAsync(deleteMilestoneAndChildren))

module.exports = router