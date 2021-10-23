const Goal = require("../models/goal_model");

const saveGoal = async (req, res) => {
  const body = req.body;
  const goalDetails = {
    title: body.goal_title,
    description: body.goal_description,
    due_date: body.goal_due_date,
    purpose_id: body.goal_purpose_id,
  };
  if (goalDetails.purpose_id === "null" || !goalDetails.purpose_id){
    goalDetails.purpose_id = null
  }
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
      res.status(200).send(`Update succeeded (${updateResult})`);
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

module.exports = {
  saveGoal,
  getGoal,
};
