const Goal = require("../models/goal_model");
const { getDateYMD } = require("../../utils/date_converter");

const saveGoal = async (req, res) => {
  const body = req.body;
  const goalDetails = {
    user_id: req.user.id,
    title: body.goal_title,
    description: body.goal_description,
    due_date: body.goal_due_date,
    due_date_unix: body.goal_due_date_unix,
    purpose_id: body.goal_purpose_id,
  };
  if (!goalDetails.purpose_id) {
    delete goalDetails.purpose_id;
  }

  console.log("goalDetails: ", goalDetails);
  if (!body.goal_id) {
    const goalId = await Goal.createGoal(goalDetails);
    res.status(200).send({ goal_id: goalId });
  } else {
    console.log("body.goal_id: ", body.goal_id);
    const row = await Goal.getGoal(body.goal_id);
    if (!row) {
      const goalId = await Goal.createGoal(goalDetails);
      res.status(200).send({ goal_id: goalId });
    } else {
      const updateResult = await Goal.saveGoal(goalDetails, body.goal_id);
      res.status(200).send({ message: `Update succeeded (${updateResult})` });
    }
  }
};

const getGoal = async (req, res) => {
  const goalId = req.body.goal_id;
  if (!goalId) {
    return res.status(400).send({error:"goal id is required."});
  } else {
    const result = await Goal.getGoal(goalId);
    if (!result) {
      return res.status(400).send({error:"goal id doesn't exist."});
    } else {
      return res.status(200).send(result);
    }
  }
};

const getGoalWithPlan = async (req, res) => {
  const goalId = req.query.goal_id;
  console.log("goalId: ", goalId);
  if (!goalId) {
    return res.status(400).send({ error: "goal id is required." });
  } else {
    const result = await Goal.getGoalWithPlan(goalId);
    const {
      user_id,
      g_id,
      g_title,
      g_description,
      g_status,
      g_group_id,
      g_popularity,
      g_publish,
    } = result[0];
    const g_due_date = result[0].g_due_date
      ? getDateYMD(result[0].g_due_date)
      : null;
    const goalPlan = {
      user_id,
      g_id,
      g_title,
      g_description,
      g_due_date,
      g_status,
      g_group_id,
      g_popularity,
      g_publish,
      milestones: [],
    };
    const milestoneIndexes = {};
    result.forEach((row) => {
      const m_due_date = row.m_due_date ? getDateYMD(row.m_due_date) : null;
      const t_due_date = row.t_due_date ? getDateYMD(row.t_due_date) : null;
      const r_end_date = row.r_end_date ? getDateYMD(row.r_end_date) : null;
      if (row.m_id && row.m_status > -1) {
        if (!Object.keys(milestoneIndexes).includes(String(row.m_id))) {
          const { m_id, m_title, m_description, m_status } = row;
          const newMilestone = {
            m_id,
            m_title,
            m_description,
            m_due_date,
            m_status,
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
          r_frequency,
        } = row;
        const newTask = {
          t_id,
          t_title,
          t_description,
          t_due_date,
          t_status,
          t_repeat,
          r_end_date,
          r_frequency,
        };
        goalPlan.milestones[index].tasks.push(newTask);
      }
      }
    });
    if (!result) {
      return res.status(400).send({error:"goal id doesn't exist."});
    } else {
      return res.status(200).json(goalPlan);
    }
  }
};

const getGoalProgress = async (req, res) => {
  const goalId = req.query.goal_id;
  console.log("goalId: ", goalId);
  if (!goalId) {
    return res.status(400).send({ error: "goal id is required." });
  } else {
    const result = await Goal.getGoalWithPlan(goalId);
    console.log("goal controller, Goal.getGoalWithPlan(goalId): result: ", result)
    const { user_id, g_id, g_title, g_description } = result[0];
    const g_due_date = result[0].g_due_date
      ? getDateYMD(result[0].g_due_date)
      : null;
    const goalProgress = {
      user_id,
      g_id,
      g_title,
      g_description,
      g_due_date,
      g_summary: { milestone: [], task: [] },
      m_ids: [],
      m_titles: [],
      m_due_dates: [],
      m_number_of_task: [],
      m_number_of_task_done: [],
    };
    const milestoneIndexes = {};
    const reducer = (previousValue, currentValue) =>
      previousValue + currentValue;
    result.forEach((row) => {
      if (row.m_id) {
        if (!Object.keys(milestoneIndexes).includes(String(row.m_id))) {
          const { m_id, m_title } = row;
          const m_due_date = row.m_due_date ? getDateYMD(row.m_due_date) : null;
          goalProgress.m_ids.push(m_id);
          goalProgress.m_titles.push(m_title);
          goalProgress.m_due_dates.push(m_due_date);
          goalProgress.m_number_of_task.push(0);
          goalProgress.m_number_of_task_done.push(0);
          milestoneIndexes[row.m_id] = goalProgress.m_ids.length - 1;
        }
      }
      if (row.t_id) {
        const index = milestoneIndexes[row.m_id];
        const { t_status } = row;
        //status === -1: archived, not calculated here
        if (t_status === 1) {
          goalProgress.m_number_of_task[index] += 1;
          goalProgress.m_number_of_task_done[index] += 1;
        }
        if (!t_status) {
          goalProgress.m_number_of_task[index] += 1;
        }
      }
    });
    const numberOfMilestone = Object.keys(goalProgress.m_titles).length;
    const milestonesCalculator = () => {
      let count = 0;
      for (let i = 0; i < goalProgress.m_number_of_task.length; i++) {
        if (
          goalProgress.m_number_of_task[i] ===
          goalProgress.m_number_of_task_done[i]
        ) {
          count += 1;
        }
      }
      return count;
    };
    const numberOfMilestoneDone = milestonesCalculator();
    const taskLength = goalProgress.m_number_of_task.length
    const taskDoneLength = goalProgress.m_number_of_task_done.length
    const sumOfTask = taskLength ? goalProgress.m_number_of_task.reduce(reducer) : 0;
    const sumOfTaskDone = taskDoneLength? goalProgress.m_number_of_task_done.reduce(reducer): 0;
    goalProgress.g_summary.milestone.push(
      numberOfMilestoneDone,
      numberOfMilestone
    );
    goalProgress.g_summary.task.push(sumOfTaskDone, sumOfTask);
    if (!result) {
      return res.status(400).send({error: "goal id doesn't exist."});
    } else {
      return res.status(200).json(goalProgress);
    }
  } 
};

const getGoalsByUser = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).send({error:"user id is required."});
  } else {
    const result = await Goal.getGoalsByUser(userId);
    if (!result) {
      return res.status(400).send({error:"user id doesn't exist."});
    } else {
      return res.status(200).send(result);
    }
  }
};

const deleteGoalAndChildren = async (req, res) => {
  const goalId = req.query.goal_id;
  if (!goalId) {
    return res.status(400).send({error:"goal id is required."});
  } else {
    const result = await Goal.deleteGoalAndChildren(goalId);
    console.log(goalId, result)
    return res.status(200).send(result);
  }
};

module.exports = {
  saveGoal,
  getGoal,
  getGoalWithPlan,
  getGoalProgress,
  getGoalsByUser,
  deleteGoalAndChildren
};
