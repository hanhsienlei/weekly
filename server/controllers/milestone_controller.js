const Milestone = require("../models/milestone_model");
const { getInputLength } = require("../../utils/util");

const saveMilestone = async (req, res) => {
  const body = req.body;
  const milestoneDetails = {
    title: body.milestoneTitle,
    description: body.milestoneDescription,
    due_date: body.milestoneDueDate,
    due_date_unix: Math.ceil(new Date(body.milestoneDueDate + "T23:59:59")),
  };
  if (body.milestoneGoalId) {
    milestoneDetails.goal_id = body.milestoneGoalId;
  }

  if (getInputLength(body.milestoneTitle) > 100) {
    res.status(400).send({ error: "title too long" });
    return;
  }
  if (!body.milestoneId) {
    const milestoneId = await Milestone.createMilestone(milestoneDetails);
    res.status(200).send({ milestoneId });
    return;
  } else {
    const row = await Milestone.getMilestone(body.milestoneId);
    if (!row) {
      res.status(400).send({ error: "Milestone id doesn't exist." });
      return;
    } else {
      const updateResult = await Milestone.saveMilestone(
        milestoneDetails,
        body.milestoneId
      );
      res.status(200).send({ message: `Update succeeded (${updateResult})` });
      return;
    }
  }
};

const getMilestone = async (req, res) => {
  const milestoneId = req.body.milestoneId;
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
    return res.status(400).send({ error: "milestone id is required." });
  } else {
    const result = await Milestone.deleteMilestoneAndChildren(milestoneId);
    return res.status(200).send(result);
  }
};

module.exports = {
  saveMilestone,
  getMilestone,
  deleteMilestoneAndChildren,
};
