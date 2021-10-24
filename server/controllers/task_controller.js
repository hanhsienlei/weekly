const Task = require("../models/task_model");

const saveTask = async (req, res) => {
  const body = req.body;
  const taskDetails = {
    title: body.task_title,
    description: body.task_description,
    due_date: body.task_due_date,
    milestone_id: (body.task_milestone_id > 0) ? body.task_milestone_id : null
  };
  
  console.log("taskDetails: ", taskDetails);
  if (!body.task_id) {
    const taskId = await Task.createTask(taskDetails);
    res.status(200).send(taskId);
  } else {
    console.log("body.task_id: ", body.task_id);
    const row = await Task.getTask(body.task_id);
    if (!row) {
      const taskId = await Task.createTask(taskDetails);
      res.status(200).send(taskId);
    } else {
      const updateResult = await Task.saveTask(taskDetails, body.task_id);
      res.status(200).send(`Update succeeded (${updateResult})`);
    }
  }
};

const getTask = async (req, res) => {
  const taskId = req.body.task_id;
  if (!taskId) {
    return res.status(400).send("task id is required.");
  } else {
    const result = await Task.getTask(taskId);
    if (!result) {
      return res.status(400).send("Task id doesn't exist.");
    } else {
      return res.status(200).send(result);
    }
  }
};

module.exports = {
  saveTask,
  getTask,
};
