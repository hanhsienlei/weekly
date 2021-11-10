require("dotenv").config();
const User = require("../server/models/user_model");
const { TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require("jsonwebtoken");
const {
  getDateYMD,
  getDateObjectFromYMD,
  getUserByeDay,
} = require("./date_converter");
const {
  getMilestonesByGoalId,
  GetGoalByMilestone,
  GetTasksByMilestone,
} = require("../server/models/milestone_model");

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

const validateGoalDueDate = () => {
  return async function (req, res, next) {
    const userBirthday = new Date(req.user.birthday);
    const userByeDay = getUserByeDay(userBirthday);
    const goalDueDate = getDateObjectFromYMD(req.body.goal_due_date);
    const goalId = req.body.goal_id;
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
    if (!goalId) {
      next();
    }
    try {
      const milestones = await getMilestonesByGoalId(goalId);
      if (!milestones.length) {
        next();
      }

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
    } catch (err) {
      res.status(500).send({ error: "Something went wrong" });
      return;
    }
  };
};

const validateMilestoneDueDate = () => {
  return async function (req, res, next) {
    const userBirthday = new Date(req.user.birthday);
    const userByeDay = getUserByeDay(userBirthday);
    const milestoneDueDate = getDateObjectFromYMD(req.body.milestone_due_date);
    const milestoneId = req.body.milestone_id;
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
    if (!milestoneId) {
      next();
    }
    try {
      // goal
      const goal = await GetGoalByMilestone(milestoneId);
      const goalDueDate = new Date(goal[0].g_due_date);
      const goalDueDateYMD = getDateYMD(goalDueDate);
      const goalTitle = goal[0].g_title;
      if (milestoneDueDate > goalDueDate) {
        res.status(400).send({
          error: `Milestone shouldn't due before its milestones ${goalTitle} (${goalDueDateYMD}).`,
        });
        return;
      }
      // task
      const tasks = await GetTasksByMilestone(milestoneId);
      if (!tasks.length) {
        next();
      }

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
        // task repeat
        if (tasks[i].t_repeat) {
          const repeatEndDate = new Date(tasks[i].r_end_date);
          const repeatEndDateYMD = getDateYMD(repeatEndDate);
          res.status(400).send({
            error: `Milestone shouldn't due before its task ${taskTitle} (repeat until ${repeatEndDateYMD}).`,
          });
          return;
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

module.exports = {
  wrapAsync,
  authentication,
  validateGoalDueDate,
  validateMilestoneDueDate,
};
