require("dotenv").config();
const User = require("../server/models/user_model");
const { TOKEN_SECRET } = process.env; // 30 days in seconds
const jwt = require("jsonwebtoken");
const {
  getDateYMD,
  getDateObjectFromYMD,
  getUserByeDay,
} = require("./date_converter");
const { getUserByGoal } = require("../server/models/goal_model");
const {
  getMilestone,
  getMilestonesByGoalId,
  getGoalByMilestone,
  getTasksByMilestone,
  getUserByMilestone,
} = require("../server/models/milestone_model");
const { getTask, getUserByTask } = require("../server/models/task_model");
const { getRepeatRule } = require("../server/models/repeated_task_model");

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

const authentication = (roleId) => {
  return async function (req, res, next) {
    let accessToken = req.get("Authorization");
    if (!accessToken) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    accessToken = accessToken.replace("Bearer ", "");
    if (accessToken == "null") {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    try {
      const user = jwt.verify(accessToken, TOKEN_SECRET);
      req.user = user;
      if (roleId == null) {
        next();
      } else {
        let userDetail;
        if (roleId == User.USER_ROLE.ALL) {
          userDetail = await User.getUserDetail(user.email);
        } else {
          userDetail = await User.getUserDetail(user.email, roleId);
        }
        if (!userDetail) {
          res.status(403).send({ error: "Forbidden" });
        } else {
          req.user.id = userDetail.id;
          req.user.role_id = userDetail.role_id;
          next();
        }
      }
      return;
    } catch (err) {
      res.status(403).send({ error: "Forbidden" });
      return;
    }
  };
};

const authorizationGoalProgress = () => {
  return async function (req, res, next) {
    const goalId = Number(req.query.goal_id);
    if (goalId) {
      const userId = Number(req.user.id);
      const returnedUserId = await getUserByGoal(goalId);
      if (userId !== returnedUserId.user_id) {
        res.status(400).send({ error: "This is not your goal!" });
        return;
      } else {
        next();
      }
    }
  };
};

const validateGoalDueDate = () => {
  return async function (req, res, next) {
    const userBirthday = new Date(req.user.birthday);
    const userByeDay = getUserByeDay(userBirthday);
    const goalDueDate = getDateObjectFromYMD(req.body.goalDueDate);
    const goalId = req.body.goalId;

    // user
    if (goalId) {
      const userId = Number(req.user.id);
      const returnedUserId = await getUserByGoal(goalId);
      if (userId !== returnedUserId.user_id) {
        res.status(400).send({ error: "This is not your goal!" });
        return;
      }
    }
    // goal date
    if (goalDueDate < userBirthday) {
      res.status(400).send({ error: "You were not born yet." });
      return;
    }

    if (goalDueDate > userByeDay) {
      res
        .status(400)
        .send({ error: "Let's plan something before 80 year old." });
      return;
    }

    //goal id and children
    if (!goalId) {
      next();
    } else {
      try {
        const milestones = await getMilestonesByGoalId(goalId);
        if (!milestones.length) {
          next();
        } else {
          for (let i = 0; i < milestones.length; i++) {
            const milestoneDueDate = new Date(milestones[i].m_due_date);
            const milestoneDueDateYMD = getDateYMD(milestoneDueDate);
            const milestoneTitle = milestones[i].m_title;
            if (goalDueDate < milestoneDueDate) {
              res.status(400).send({
                error: `Goal shouldn't due before its milestones ${milestoneTitle} (${milestoneDueDateYMD}).`,
              });
              return;
            }
          }
          next();
        }
      } catch (err) {
        res.status(500).send({ error: "Something went wrong" });
        return;
      }
    }
  };
};

const validateMilestoneDueDate = () => {
  return async function (req, res, next) {
    const userBirthday = new Date(req.user.birthday);
    const userByeDay = getUserByeDay(userBirthday);
    const milestoneDueDate = getDateObjectFromYMD(req.body.milestoneDueDate);
    const milestoneId = req.body.milestoneId;
    const goalId = req.body.milestoneGoalId;
    const userId = Number(req.user.id);

    if (milestoneDueDate < userBirthday) {
      res.status(400).send({ error: "You were not born yet." });
      return;
    }

    if (milestoneDueDate > userByeDay) {
      res
        .status(400)
        .send({ error: "Let's plan something before 80 year old." });
      return;
    }

    // user
    if (goalId) {
      const returnedUserId = await getUserByGoal(goalId);
      console.log(goalId, userId, returnedUserId.user_id);
      if (userId !== returnedUserId.user_id) {
        res.status(400).send({ error: "This is not your goal!" });
        return;
      }
    } else if (milestoneId) {
      const returnedUserId = await getUserByMilestone(milestoneId);
      console.log(
        "milestone id: ",
        milestoneId,
        userId,
        returnedUserId.user_id
      );
      if (userId !== returnedUserId.user_id) {
        res.status(400).send({ error: "This is not your milestone!" });
        return;
      }
    }

    // milestone's family

    if (!milestoneId) {
      next();
    } else {
      try {
        const goal = await getGoalByMilestone(milestoneId);
        const goalDueDate = new Date(goal[0].g_due_date);
        const goalDueDateYMD = getDateYMD(goalDueDate);
        const goalTitle = goal[0].g_title;
        const tasks = await getTasksByMilestone(milestoneId);

        // goal
        if (milestoneDueDate > goalDueDate) {
          res.status(400).send({
            error: `Milestone shouldn't due after its goal ${goalTitle} (${goalDueDateYMD}).`,
          });
          return;
        }

        // task

        if (!tasks.length) {
          next();
          return;
        } else {
          for (let i = 0; i < tasks.length; i++) {
            const taskDueDate = new Date(tasks[i].t_due_date);
            const taskDueDateYMD = getDateYMD(taskDueDate);
            const taskTitle = tasks[i].t_title;
            console.log(
              "milestoneDueDate,  taskDueDate ",
              milestoneDueDate,
              taskDueDate
            );
            if (milestoneDueDate < taskDueDate) {
              console.log("400 error: ", milestoneDueDate, taskDueDate);
              res.status(400).send({
                error: `Milestone shouldn't due before its task ${taskTitle} (${taskDueDateYMD}).`,
              });
              return;
            }
            // task repeat
            if (tasks[i].t_repeat) {
              const repeatEndDate = new Date(tasks[i].r_end_date);
              const repeatEndDateYMD = getDateYMD(repeatEndDate);

              if (milestoneDueDate < repeatEndDate) {
                res.status(400).send({
                  error: `Milestone shouldn't due before its task ${taskTitle} (repeat until ${repeatEndDateYMD}).`,
                });
                return;
              }
            }
          }
          next();
        }
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Something went wrong." });
        return;
      }
    }
  };
};

const validateTaskDueDate = () => {
  return async function (req, res, next) {
    const userBirthday = new Date(req.user.birthday);
    const userByeDay = getUserByeDay(userBirthday);
    const taskDueDate = getDateObjectFromYMD(req.body.taskDueDate);
    const taskId = req.body.taskId;
    const milestoneId = req.body.taskMilestoneId;
    const userId = Number(req.user.id);
    console.log("req.body: ", req.body);

    if (taskDueDate < userBirthday) {
      res.status(400).send({ error: "You were not born yet." });
      return;
    }

    if (taskDueDate > userByeDay) {
      res
        .status(400)
        .send({ error: "Let's plan something before 80 year old." });
      return;
    }
    //repeat end date
    if (req.body.task_repeat) {
      const taskRepeatEndDate = req.body.taskRepeatEndDate
        ? getDateObjectFromYMD(req.body.taskRepeatEndDate)
        : null;

      if (!taskRepeatEndDate && !milestoneId) {
        req.body.taskRepeatEndDate = getDateYMD(userByeDay);
        console.log("independent task repeat end date set to forever");
      } else {
        if (taskDueDate > taskRepeatEndDate) {
          res.status(400).send({
            error: `Task shouldn't due after its repeat end date (${getDateYMD(
              taskRepeatEndDate
            )}).`,
          });
          return;
        }

        if (taskRepeatEndDate < userBirthday) {
          res.status(400).send({ error: "You were not born yet." });
          return;
        }

        if (taskRepeatEndDate > userByeDay) {
          res
            .status(400)
            .send({ error: "Let's plan something before 80 year old." });
          return;
        }
      }
    }

    //user
    if (taskId) {
      const returnedUserId = await getUserByTask(taskId);
      if (userId !== returnedUserId.user_id) {
        res.status(400).send({ error: "This is not your task!" });
        return;
      }
    } else if (milestoneId) {
      const returnedUserId = await getUserByMilestone(milestoneId);
      console.log(
        "milestone id: ",
        milestoneId,
        userId,
        returnedUserId.user_id
      );
      if (userId !== returnedUserId.user_id) {
        res.status(400).send({ error: "This is not your milestone!" });
        return;
      }
    }

    //new task
    if (!taskId) {
      console.log("it's a new task");
      next();
      return;
    } else {
      try {
        // milestone
        const task = await getTask(taskId);
        const milestoneId = task.milestone_id;
        console.log("task", task);
        if (!task) {
          next();
          return;
        } else if (milestoneId) {
          const milestone = await getMilestone(milestoneId);
          const milestoneDueDate = new Date(milestone.due_date);
          const milestoneDueDateYMD = getDateYMD(milestoneDueDate);
          const milestoneTitle = milestone.title;
          if (taskDueDate > milestoneDueDate) {
            res.status(400).send({
              error: `Task shouldn't due after its milestone ${milestoneTitle} (${milestoneDueDateYMD}).`,
            });
            return;
          }
          if (req.body.taskRepeat) {
            const taskRepeatEndDate = getDateObjectFromYMD(
              req.body.taskRepeatEndDate
            );
            if (taskRepeatEndDate > milestoneDueDate) {
              res.status(400).send({
                error: `Task should only repeat until when its milestone dues: ${milestoneTitle} (${milestoneDueDateYMD}).`,
              });
              return;
            }
          }
          next();
        } else {
          next();
        }
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Something went wrong." });
        return;
      }
    }
  };
};

const getInputLength = (string) => {
  return string.replace(/[^\x00-\xff]/g, "xx").length;
};

module.exports = {
  wrapAsync,
  authentication,
  authorizationGoalProgress,
  validateGoalDueDate,
  validateMilestoneDueDate,
  validateTaskDueDate,
  getInputLength,
};
