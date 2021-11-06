const Task = require("../models/task_model");
const RepeatedTask = require("../models/repeated_task_model");

const updateTask = async (req, res) => {
  const body = req.body;
  const taskDetails = {
    title: body.task_title,
    description: body.task_description,
    status: body.task_status,
    due_date: body.task_due_date,
    due_date_unix: body.task_due_date_unix,
    milestone_id: body.task_milestone_id,
    repeat: body.task_repeat,
  };
  const repeatDetails = {
    frequency: body.task_r_frequency,
    end_date: body.task_r_end_date,
    end_date_unix: body.task_r_end_date_unix,
  };

  if (!taskDetails.milestone_id) {
    delete taskDetails.milestone_id;
  }

  console.log("taskDetails: ", taskDetails);

  if (!body.task_id) {
    taskDetails.user_id = Number(body.user_id);
    console.log("taskDetails with user id: ", taskDetails);
    const taskId = await Task.createTask(taskDetails);
    res.status(200).send({ task_id: taskId });
  } else {
    console.log("body.task_id: ", body.task_id);
    console.log("repeatDetails: ", repeatDetails);
    const row = await Task.getTask(body.task_id);
    if (!row) {
      taskDetails.user_id = body.user_id;
      const taskId = await Number(Task.createTask(taskDetails));
      if (body.task_repeat) {
        console.log("[updateTask controller ]repeatDetails: ", repeatDetails);
        await handleRepeatRule(repeatDetails, taskId);
      }
      res.status(200).send({ task_id: taskId });
    } else {
      if (body.task_repeat) {
        console.log("[updateTask controller ]repeatDetails: ", repeatDetails);
        const repeatedRuleResult = await handleRepeatRule(repeatDetails, body.task_id);
        console.log("repeatedRuleResult: ", repeatedRuleResult)
        const taskContent = {
          title: body.task_title,
          description: body.task_description
        }
        const repeatedTasksResult = await RepeatedTask.updateRepeatedTasks(taskContent, body.task_id)
        console.log("repeatedTasksResult: ", repeatedTasksResult)
      }
      const updateResult = await Task.updateTask(taskDetails, body.task_id);
      res.status(200).send({ message: `Update succeeded (${updateResult})` });
    }
  }
};

const getTask = async (req, res) => {
  const taskId = req.body.task_id;
  if (!taskId) {
    return res.status(400).send("task id is required.");
  } else {
    const result = await Task.getTask(Number(taskId));
    if (!result) {
      return res.status(400).send("Task id doesn't exist.");
    } else {
      return res.status(200).send(result);
    }
  }
};

const handleRepeatRule = async (repeatDetails, taskId) => {
  //only fired when task repeat = true
  //if rule exist, update rule
  if (taskId > 0) {
    const repeatRule = await RepeatedTask.getRepeatRule(taskId);
    if (!repeatRule) {
      repeatDetails.task_id = taskId;
      const ruleId = await RepeatedTask.createRepeatRule(repeatDetails);
      console.log("create new repeat rule: ", ruleId);
    } else {
      const result = await RepeatedTask.updateRepeatRule(repeatDetails, taskId);
      console.log("update repeat rule: ", result);
    }
  }
};

const deleteTask = async (req, res) => {
  const taskId = req.query.task_id;
  if (!taskId) {
    return res.status(400).send("task id is required.");
  } else {
    const result = [await Task.deleteTask(taskId), await RepeatedTask.deleteRepeatedTasks(taskId)]
    return res.status(200).send(result);
  }
};

module.exports = {
  updateTask,
  getTask,
  deleteTask
};
