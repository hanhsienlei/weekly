const Goal = require("../models/goal_model");
const {
  getDateYMD,
  getDateObjectFromYMD,
} = require("../../utils/date_converter");
const { getInputLength } = require("../../utils/util");

const saveGoal = async (req, res) => {
  const body = req.body;
  const goalDetails = {
    user_id: req.user.id,
    title: body.goalTitle,
    description: body.goalDescription,
    due_date: body.goalDueDate,
    due_date_unix: Math.ceil(new Date(body.goalDueDate + "T23:59:59")),
    category: body.goalCategory,
  };

  if (!goalDetails.category) {
    goalDetails.category = 0;
  }
  if (getInputLength(body.goalTitle) > 100) {
    res.status(400).send({ error: "title too long" });
    return;
  }

  if (!body.goalId) {
    const goalId = await Goal.createGoal(goalDetails);
    res.status(200).send({ goalId });
  } else {
    const row = await Goal.getGoal(body.goalId);
    if (!row) {
      const goalId = await Goal.createGoal(goalDetails);
      res.status(200).send({ goalId });
    } else {
      const updateResult = await Goal.saveGoal(goalDetails, body.goalId);
      res.status(200).send({ message: `Update succeeded (${updateResult})` });
    }
  }
};

const getGoal = async (req, res) => {
  const goalId = req.body.goalId;
  if (!goalId) {
    return res.status(400).send({ error: "goal id is required." });
  } else {
    const result = await Goal.getGoal(goalId);
    if (!result) {
      return res.status(400).send({ error: "goal id doesn't exist." });
    } else {
      return res.status(200).send(result);
    }
  }
};

const getGoalWithPlan = async (req, res) => {
  const goalId = req.query.goal_id;
  if (!goalId) {
    return res.status(400).send({ error: "goal id is required." });
  } else {
    const result = await Goal.getGoalWithPlan(goalId);
    const { user_id, g_id, g_title, g_description, g_status, g_category } =
      result[0];
    const goalDueDate = result[0].g_due_date
      ? getDateYMD(result[0].g_due_date)
      : null;
    const goalPlan = {
      userId: user_id,
      goalId: g_id,
      goalTitle: g_title,
      goalDescription: g_description,
      goalDueDate,
      goalStatus: g_status,
      goalCategory: g_category,
      milestones: [],
    };
    const milestoneIndexes = {};
    result.forEach((row) => {
      const milestoneDueDate = row.m_due_date
        ? getDateYMD(row.m_due_date)
        : null;
      const taskDueDate = row.t_due_date ? getDateYMD(row.t_due_date) : null;
      const repeatEndDate = row.r_end_date ? getDateYMD(row.r_end_date) : null;
      if (row.m_id && row.m_status > -1) {
        if (!Object.keys(milestoneIndexes).includes(String(row.m_id))) {
          const { m_id, m_title, m_description, m_status } = row;
          const newMilestone = {
            milestoneId: m_id,
            milestoneTitle: m_title,
            milestoneDescription: m_description,
            milestoneDueDate,
            milestoneStatus: m_status,
            tasks: [],
          };
          goalPlan.milestones.push(newMilestone);
          milestoneIndexes[row.m_id] = goalPlan.milestones.length - 1;
        }
        if (row.t_id && row.t_status > -1) {
          const index = milestoneIndexes[row.m_id];
          const {
            t_id,
            t_title,
            t_description,
            t_status,
            t_repeat,
            t_origin_id,
            r_frequency,
          } = row;
          const newTask = {
            taskId: t_id,
            taskTitle: t_title,
            taskDescription: t_description,
            taskDueDate,
            taskStatus: t_status,
            taskRepeat: t_repeat,
            taskOriginId: t_origin_id,
            repeatEndDate,
            repeatFrequency: r_frequency,
          };
          goalPlan.milestones[index].tasks.push(newTask);
        }
      }
    });
    if (!result) {
      return res.status(400).send({ error: "goal id doesn't exist." });
    } else {
      return res.status(200).send(goalPlan);
    }
  }
};

const getGoalProgress = async (req, res) => {
  const goalId = req.query.goal_id;
  if (!goalId) {
    return res.status(400).send({ error: "goal id is required." });
  } else {
    const result = await Goal.getGoalWithPlan(goalId);

    const { user_id, g_id, g_title, g_description, g_category } = result[0];
    const goalDueDate = result[0].g_due_date
      ? getDateYMD(result[0].g_due_date)
      : null;
    const todayValue = new Date().valueOf();
    const weekInMilliSecond = 60 * 60 * 24 * 1000 * 7;
    const goalDueDateValue = getDateObjectFromYMD(goalDueDate);
    const goalWeeksFromNow = Math.ceil(
      (goalDueDateValue - todayValue) / weekInMilliSecond
    );
    const goalProgress = {
      userId: user_id,
      goalId: g_id,
      goalTitle: g_title,
      goalDescription: g_description,
      goalDueDate,
      goalCategory: g_category,
      goalWeeksFromNow,
      goalSummary: { milestone: [], task: [] },
      milestoneIds: [],
      milestoneTitles: [],
      milestoneDueDates: [],
      milestoneNumberOfTask: [],
      milestoneNumberOfTaskDone: [],
    };
    const milestoneIndexes = {};
    const reducer = (previousValue, currentValue) =>
      previousValue + currentValue;
    result.forEach((row) => {
      if (row.m_id && row.m_status > -1) {
        if (!Object.keys(milestoneIndexes).includes(String(row.m_id))) {
          const milestoneDueDate = row.m_due_date
            ? getDateYMD(row.m_due_date)
            : null;
          goalProgress.milestoneIds.push(row.m_id);
          goalProgress.milestoneTitles.push(row.m_title);
          goalProgress.milestoneDueDates.push(milestoneDueDate);
          goalProgress.milestoneNumberOfTask.push(0);
          goalProgress.milestoneNumberOfTaskDone.push(0);
          milestoneIndexes[row.m_id] = goalProgress.milestoneIds.length - 1;
        }
      }
      if (row.t_id) {
        const index = milestoneIndexes[row.m_id];
        if (row.t_status === 1) {
          goalProgress.milestoneNumberOfTask[index] += 1;
          goalProgress.milestoneNumberOfTaskDone[index] += 1;
        }
        if (!row.t_status) {
          goalProgress.milestoneNumberOfTask[index] += 1;
        }
      }
    });
    const numberOfMilestone = Object.keys(goalProgress.milestoneTitles).length;
    const milestonesCalculator = () => {
      let count = 0;
      for (let i = 0; i < goalProgress.milestoneNumberOfTask.length; i++) {
        if (
          goalProgress.milestoneNumberOfTask[i] ===
            goalProgress.milestoneNumberOfTaskDone[i] &&
          goalProgress.milestoneNumberOfTaskDone[i] != 0
        ) {
          count += 1;
        }
      }
      return count;
    };
    const numberOfMilestoneDone = milestonesCalculator();
    const taskLength = goalProgress.milestoneNumberOfTask.length;
    const taskDoneLength = goalProgress.milestoneNumberOfTaskDone.length;
    const sumOfTask = taskLength
      ? goalProgress.milestoneNumberOfTask.reduce(reducer)
      : 0;
    const sumOfTaskDone = taskDoneLength
      ? goalProgress.milestoneNumberOfTaskDone.reduce(reducer)
      : 0;
    goalProgress.goalSummary.milestone.push(
      numberOfMilestoneDone,
      numberOfMilestone
    );
    goalProgress.goalSummary.task.push(sumOfTaskDone, sumOfTask);
    if (!result) {
      return res.status(400).send({ error: "goal id doesn't exist." });
    } else {
      return res.status(200).send(goalProgress);
    }
  }
};

const getGoalsByUser = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).send({ error: "user id is required." });
  } else {
    const result = await Goal.getGoalsByUser(userId);
    if (!result) {
      return res.status(400).send({ error: "user id doesn't exist." });
    } else {
      data = result.map((goal) => {
        return {
          goalId: goal.g_id,
          goalTitle: goal.g_title,
          goalCategory: goal.g_category,
        };
      });
      return res.status(200).send(data);
    }
  }
};

const deleteGoalAndChildren = async (req, res) => {
  const goalId = req.query.goal_id;
  if (!goalId) {
    return res.status(400).send({ error: "goal id is required." });
  } else {
    const result = await Goal.deleteGoalAndChildren(goalId);
    return res.status(200).send(result);
  }
};

module.exports = {
  saveGoal,
  getGoal,
  getGoalWithPlan,
  getGoalProgress,
  getGoalsByUser,
  deleteGoalAndChildren,
};
