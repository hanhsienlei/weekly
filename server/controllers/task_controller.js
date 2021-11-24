const Task = require("../models/task_model");
const RepeatedTask = require("../models/repeated_task_model");
const { getInputLength } = require("../../utils/util");

const updateTask = async (req, res) => {
  const body = req.body;
  const taskDetails = {
    title: body.taskTitle,
    description: body.taskDescription,
    status: body.taskStatus,
    due_date: body.taskDueDate,
    due_date_unix: Math.ceil(new Date(body.taskDueDate + "T23:59:59")),
    repeat: body.taskRepeat,
  };
  const repeatDetails = {
    frequency: body.taskRepeatFrequency,
    end_date: body.taskRepeatEndDate,
    end_date_unix: Math.ceil(new Date(body.taskRepeatEndDate + "T23:59:59")),
  };
  if (getInputLength(body.taskTitle) > 100) {
    res.status(400).send({ error: "title too long" });
    return;
  }
  if (body.taskMilestoneId) {
    taskDetails.milestone_id = body.taskMilestoneId;
  }

  if (!body.taskId) {
    taskDetails.user_id = req.user.id;
    const taskId = await Task.createTask(taskDetails);
    res.status(200).send({ taskId });
  } else {
    const row = await Task.getTask(body.taskId);
    if (!row) {
      taskDetails.user_id = req.user.id;
      const taskId = await Task.createTask(taskDetails);
      res.status(200).send({ taskId });
    } else {
      if (body.taskRepeat) {
        await handleRepeatRule(repeatDetails, body.taskId);
        const taskContent = {
          title: body.taskTitle,
          description: body.taskDescription,
        };
        await RepeatedTask.updateRepeatedTasks(taskContent, body.taskId);
      }
      const updateResult = await Task.updateTask(taskDetails, body.taskId);
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
