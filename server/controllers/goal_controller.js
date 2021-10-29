const Goal = require("../models/goal_model");

const saveGoal = async (req, res) => {
  const body = req.body;
  const goalDetails = {
    title: body.goal_title,
    description: body.goal_description,
    due_date: body.goal_due_date,
    due_date_unix: body.goal_due_date_unix,
    purpose_id: body.goal_purpose_id

  };
if (!goalDetails.purpose_id){delete goalDetails.purpose_id}

  console.log("goalDetails: ", goalDetails);
  if (!body.goal_id) {
    const goalId = await Goal.createGoal(goalDetails);
    res.status(200).send(goalId);
  } else {
    console.log("body.goal_id: ", body.goal_id);
    const row = await Goal.getGoal(body.goal_id);
    if (!row) {
      const goalId = await Goal.createGoal(goalDetails);
      res.status(200).send(goalId);
    } else {
      const updateResult = await Goal.saveGoal(goalDetails, body.goal_id);
      res.status(200).send({message: `Update succeeded (${updateResult})`});
    }
  }
};

const getGoal = async (req, res) => {
  const goalId = req.body.goal_id;
  if (!goalId) {
    return res.status(400).send("goal id is required.");
  } else {
    const result = await Goal.getGoal(goalId);
    if (!result) {
      return res.status(400).send("goal id doesn't exist.");
    } else {
      return res.status(200).send(result);
    }
  }
};

const getGoalWithPlan = async (req, res) => {
  const goalId = req.query.goal_id;
  if (!goalId) {
    return res.status(400).send("goal id is required.");
  } else {
    const result = await Goal.getGoalWithPlan(goalId);
    const {
      user_id,
      g_id,
      g_title,
      g_description,
      g_due_date,
      g_status,
      g_group_id,
      g_popularity,
      g_publish,
    } = result[0];
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
    result.forEach((result) => {
      if (!Object.keys(milestoneIndexes).includes(String(result.m_id))) {
        const { m_id, m_title, m_description, m_due_date, m_status } = result;
        const newMilestone = {
          m_id,
          m_title,
          m_description,
          m_due_date,
          m_status,
          tasks: [],
        };
        goalPlan.milestones.push(newMilestone);
        milestoneIndexes[result.m_id] = goalPlan.milestones.length - 1;
      }

      if (result.t_id) {
        const index = milestoneIndexes[result.m_id];
        const {
          t_id,
          t_title,
          t_description,
          t_due_date,
          t_status,
          t_repeat,
          r_end_date,
          r_frequency,
        } = result;
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
    });

    if (!result) {
      return res.status(400).send("goal id doesn't exist.");
    } else {
      return res.status(200).json(goalPlan);
    }
  }
};

module.exports = {
  saveGoal,
  getGoal,
  getGoalWithPlan,
};
