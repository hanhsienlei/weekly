const Task = require("../models/task_model");

const saveTask = async (req, res) => {
  const body = req.body;
  const taskDetails = {
    title: body.task_title,
    description: body.task_description,
    due_date: body.task_due_date,
    due_date_unix: body.task_due_date_unix,
    milestone_id: body.task_milestone_id
  };
  if (!taskDetails.milestone_id){delete taskDetails.milestone_id}
  
  console.log("taskDetails: ", taskDetails);
  if (!body.task_id) {
    const taskId = await Task.createTask(taskDetails);
    res.status(200).send({task_id: taskId});
  } else {
    console.log("body.task_id: ", body.task_id);
    const row = await Task.getTask(body.task_id);
    if (!row) {
      const taskId = await Task.createTask(taskDetails);
      res.status(200).send(taskId);
    } else {
      const updateResult = await Task.saveTask(taskDetails, body.task_id);
      res.status(200).send({message: `Update succeeded (${updateResult})`});
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
