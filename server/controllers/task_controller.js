const Task = require("../models/task_model");
const RepeatedTask = require("../models/repeated_task_model");
const { getInputLength } = require("../../utils/util");

const updateTask = async (req, res) => {
  const body = req.body;
  const taskDetails = {
    title: body.task_title,
    description: body.task_description,
    status: body.task_status,
    due_date: body.task_due_date,
    due_date_unix: Math.ceil(new Date(body.task_due_date + "T23:59:59")),
    repeat: body.task_repeat,
  };
  const repeatDetails = {
    frequency: body.task_r_frequency,
    end_date: body.task_r_end_date,
    end_date_unix: Math.ceil(new Date(body.task_r_end_date + "T23:59:59")),
  };
  if (getInputLength(body.task_title) > 100) {
    res.status(400).send({ error: "title too long" });
    return;
  }
  if (body.task_milestone_id) {
    taskDetails.milestone_id = body.task_milestone_id;
  }

  if (!body.task_id) {
    taskDetails.user_id = req.user.id;
    const taskId = await Task.createTask(taskDetails);
    res.status(200).send({ task_id: taskId });
  } else {
    const row = await Task.getTask(body.task_id);
    if (!row) {
      taskDetails.user_id = req.user.id;
      const taskId = await Task.createTask(taskDetails);
      res.status(200).send({ task_id: taskId });
    } else {
      if (body.task_repeat) {
        await handleRepeatRule(repeatDetails, body.task_id);
        const taskContent = {
          title: body.task_title,
          description: body.task_description,
        };
        await RepeatedTask.updateRepeatedTasks(taskContent, body.task_id);
      }
      const updateResult = await Task.updateTask(taskDetails, body.task_id);
      res.status(200).send({ message: `Update succeeded (${updateResult})` });
    }
  }
};

const handleRepeatRule = async (repeatDetails, taskId) => {
  const repeatRule = await RepeatedTask.getRepeatRule(taskId);
  if (!repeatRule) {
    repeatDetails.task_id = taskId;
    await RepeatedTask.createRepeatRule(repeatDetails);
  } else {
    await RepeatedTask.updateRepeatRule(repeatDetails, taskId);
  }
};

const deleteTask = async (req, res) => {
  const taskId = req.query.task_id;
  if (!taskId) {
    return res.status(400).send({ error: "task id is required." });
  } else {
    const result = [
      await Task.deleteTask(taskId),
      await RepeatedTask.deleteRepeatedTasks(taskId),
    ];
    return res.status(200).send(result);
  }
};

module.exports = {
  updateTask,
  deleteTask,
};
