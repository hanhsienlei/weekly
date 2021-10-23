const Milestone = require("../models/milestone_model");

const saveMilestone = async (req, res) => {
  const body = req.body;
  const milestoneDetails = {
    title: body.milestone_title,
    description: body.milestone_description,
    due_date: body.milestone_due_date,
    goal_id: body.milestone_goal_id,
  };
  
  console.log("milestoneDetails: ", milestoneDetails);
  if (!body.milestone_id) {
    const milestoneId = await Milestone.createMilestone(milestoneDetails);
    res.status(200).send(milestoneId);
  } else {
    console.log("body.milestone_id: ", body.milestone_id);
    const row = await Milestone.getMilestone(body.milestone_id);
    if (!row) {
      res.status(400).send("Milestone id doesn't exist.");
    } else {
      const updateResult = await Milestone.saveMilestone(milestoneDetails, body.milestone_id);
      res.status(200).send(`Update succeeded (${updateResult})`);
    }
  }
};

const getMilestone = async (req, res) => {
  const milestoneId = req.body.milestone_id;
  if (!milestoneId) {
    return res.status(400).send("Milestone id is required.");
  } else {
    const result = await Milestone.getMilestone(milestoneId);
    if (!result) {
      const milestoneId = await Milestone.createMilestone(milestoneDetails);
      res.status(200).send(milestoneId);
    } else {
      return res.status(200).send(result);
    }
  }
};

module.exports = {
  saveMilestone,
  getMilestone,
};
