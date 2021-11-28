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
//const { getRepeatRule } = require("../server/models/repeated_task_model");

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const errorCatcher = (fn) => {
  return function (req, res, next) {
    // catch unhandled errors from async middlewares 
    // and next() to final error handler
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
          req.user.roleId = userDetail.role_id;
          next();
        }
      }
      return;
    } catch (err) {
      console.log(err)
      res.status(403).send({ error: "Forbidden" });
      return;
    }
  };
};

const authorizationGoalProgress = () => {
  return async function (req, res, next) {
    const goalId = Number(req.query.goal_id);
    const userId = Number(req.user.id);
    if (goalId && (await authorizeGoal(goalId, userId, res))) return;
    next();
  };
};

const validateDateByUser = (req, res, dateObject) => {
  const userBirthday = new Date(req.user.birthday);
  const userByeDay = getUserByeDay(userBirthday);

  if (dateObject < userBirthday) {
    res.status(400).send({ error: "You were not born yet." });
    return true;
  }

  if (dateObject > userByeDay) {
    res
      .status(400)
      .send({ error: "Let's plan something before 80 years old." });
    return true;
  }
};

const authorizeGoal = async (goalId, userId, res) => {
  const returnedUserId = await getUserByGoal(goalId);
  if (userId !== returnedUserId.user_id) {
    res.status(400).send({ error: "This is not your goal!" });
    return true;
  } else {
    return;
  }
};

const authorizeMilestone = async (milestoneId, userId, res) => {
  const returnedUserId = await getUserByMilestone(milestoneId);
  if (userId !== returnedUserId.user_id) {
    res.status(400).send({ error: "This is not your milestone!" });
    return true;
  }
};

const authorizeTask = async (taskId, userId, res) => {
  const returnedUserId = await getUserByTask(taskId);
  if (userId !== returnedUserId.user_id) {
    res.status(400).send({ error: "This is not your task!" });
    return true;
  }
};

const validateGoalDueDate = () => {
  return async function (req, res, next) {
    const goalDueDate = getDateObjectFromYMD(req.body.goalDueDate);
    const goalId = req.body.goalId;
    const userId = Number(req.user.id);

    if (validateDateByUser(req, res, goalDueDate)) return;
    if (!goalId) return next();
    if (await authorizeGoal(goalId, userId, res)) return;
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
  };
};

const validateMilestoneDueDate = () => {
  return async function (req, res, next) {
    const milestoneDueDate = getDateObjectFromYMD(req.body.milestoneDueDate);
    const milestoneId = req.body.milestoneId;
    const goalId = req.body.milestoneGoalId;
    const userId = Number(req.user.id);

    if (validateDateByUser(req, res, milestoneDueDate)) return;
    if (goalId && (await authorizeGoal(goalId, userId, res))) return;
    if (!milestoneId) return next();
    if (milestoneId && (await authorizeMilestone(milestoneId, userId, res)))
      return;

    try {
      const tasks = await getTasksByMilestone(milestoneId);
      const goal = await getGoalByMilestone(milestoneId);
      const goalDueDate = new Date(goal[0].g_due_date);
      const goalDueDateYMD = getDateYMD(goalDueDate);
      const goalTitle = goal[0].g_title;
      if (milestoneDueDate > goalDueDate) {
        res.status(400).send({
          error: `Milestone shouldn't due after its goal ${goalTitle} (${goalDueDateYMD}).`,
        });
        return;
      }
      if (!tasks.length) return next();
      for (let i = 0; i < tasks.length; i++) {
        const taskDueDate = new Date(tasks[i].t_due_date);
        const taskDueDateYMD = getDateYMD(taskDueDate);
        const taskTitle = tasks[i].t_title;
        if (milestoneDueDate < taskDueDate) {
          res.status(400).send({
            error: `Milestone shouldn't due before its task ${taskTitle} (${taskDueDateYMD}).`,
          });
          return;
        }
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
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Something went wrong." });
      return;
    }
  };
};

const validateTaskDueDate = () => {
  return async function (req, res, next) {
    const taskDueDate = getDateObjectFromYMD(req.body.taskDueDate);
    const taskId = req.body.taskId;
    const milestoneId = req.body.taskMilestoneId;
    const userId = Number(req.user.id);
    if (validateDateByUser(req, res, taskDueDate)) return;
    if (req.body.taskRepeat) {
      const taskRepeatEndDate = req.body.taskRepeatEndDate
        ? getDateObjectFromYMD(req.body.taskRepeatEndDate)
        : null;
      if (!taskRepeatEndDate && !milestoneId) {
        req.body.taskRepeatEndDate = getDateYMD(userByeDay);
      } else {
        if (validateDateByUser(req, res, taskRepeatEndDate)) return;
        if (taskDueDate > taskRepeatEndDate) {
          res.status(400).send({
            error: `Task shouldn't due after its repeat end date (${getDateYMD(
              taskRepeatEndDate
            )}).`,
          });
          return;
        }
      }
    }

    if (taskId && (await authorizeTask(taskId, userId, res))) return;
    if (milestoneId && (await authorizeMilestone(milestoneId, userId, res)))
      return;
    if (!taskId) return next();

    try {
      const task = await getTask(taskId);
      const milestoneId = task.milestone_id;
      if (!task) {
        res.status(400).send({
          error: `Task (id: ${taskId}) doesn't exist.`,
        });
        return;
      }
      if (milestoneId) {
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
        if (!req.body.taskRepeat) return next();
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
      } 
      next();
      
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Something went wrong." });
      return;
    }
  };
};

const getInputLength = (string) => {
  return string.replace(/[^\x00-\xff]/g, "xx").length;
};

module.exports = {
  errorCatcher,
  authentication,
  authorizationGoalProgress,
  validateGoalDueDate,
  validateMilestoneDueDate,
  validateTaskDueDate,
  getInputLength,
};
