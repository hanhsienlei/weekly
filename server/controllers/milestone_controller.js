const Milestone = require("../models/milestone_model");

const saveMilestone = async (req, res) => {
  const body = req.body;
  const milestoneDetails = {
    title: body.milestone_title,
    description: body.milestone_description,
    due_date: body.milestone_due_date,
    due_date_unix: body.milestone_due_date_unix,
    goal_id: body.milestone_goal_id,
  };
  if (!milestoneDetails.goal_id){delete milestoneDetails.goal_id}
  
  console.log("milestoneDetails: ", milestoneDetails);
  if (!body.milestone_id) {
    const milestoneId = await Milestone.createMilestone(milestoneDetails);
    res.status(200).json({milestone_id: milestoneId});
  } else {
    console.log("body.milestone_id: ", body.milestone_id);
    const row = await Milestone.getMilestone(body.milestone_id);
    if (!row) {
      res.status(400).send({error:"Milestone id doesn't exist."});
    } else {
      const updateResult = await Milestone.saveMilestone(milestoneDetails, body.milestone_id);
      res.status(200).send({message: `Update succeeded (${updateResult})`});
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

const deleteMilestoneAndChildren = async (req, res) => {
  const milestoneId = req.query.milestone_id;
  if (!milestoneId) {
    return res.status(400).send({error:"milestone id is required."});
  } else {
    const result = await Milestone.deleteMilestoneAndChildren(milestoneId);
    console.log(milestoneId, result)
    return res.status(200).send(result);
  }
};

module.exports = {
  saveMilestone,
  getMilestone,
  deleteMilestoneAndChildren
};
