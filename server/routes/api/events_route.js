const router = require("express").Router();
const { authentication, wrapAsync } = require("../../../utils/util");
const { getEventsByDate } = require("../../controllers/events_controller");
const { USER_ROLE } = require("../../models/user_model");

router
  .route("/events/:date")
  .get(authentication(USER_ROLE.ALL), wrapAsync(getEventsByDate));

module.exports = router;
