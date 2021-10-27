const router = require("express").Router();
const { wrapAsync } = require("../../../utils/util");
const { getEventsByDate } = require("../../controllers/events_controller");

router
  .route("/events/:date")
  .get(wrapAsync(getEventsByDate))
  
module.exports = router
