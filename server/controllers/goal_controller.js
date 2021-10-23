const Goal = require("../models/goal_model");

const saveGoal = async (req, res) => {
  const body = req.body;
  const goalDetails = {
    title: body.goal_title,
    description: body.goal_description,
    due_date: body.goal_due_date,
    purpose_id: body.goal_purpose_id,
    status: body.status,
    user_id:body.goal_user_id
  };
  console.log("goalDetails: ", goalDetails);
  if (!body.goal_id) {
    const goalId = await Goal.createGoal(goalDetails);
    res.status(200).send(goalId);
  } else {
    console.log("body.goal_id: ", body.goal_id);
    const row = await Goal.getGoal(body.goal_id);
    if (!row) {
      res.status(400).send("Goal id doesn't exist.");
    } else {
      const updateResult = await Goal.saveGoal(goalDetails, body.goal_id);
      res.status(200).send(`Update succeeded (${updateResult})`);
    }
  }
};

const getGoal = async (req, res) => {
  const goalId = req.body.goal_id;
  const result = await Goal.getGoal(goalId);
  res.status(200).send(result);
};

module.exports = {
  saveGoal,
  getGoal,
};
