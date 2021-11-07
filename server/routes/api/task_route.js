const router = require("express").Router();
const { authentication, wrapAsync } = require("../../../utils/util");

const { updateTask, getTask, deleteTask } = require("../../controllers/task_controller");
const {
    USER_ROLE
} = require('../../models/user_model');


router
  .route("/task")
  .post(authentication(USER_ROLE.ALL), wrapAsync(updateTask))
  .delete(authentication(USER_ROLE.ALL), wrapAsync(deleteTask))

module.exports = router
