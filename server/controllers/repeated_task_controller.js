const Task = require("../models/task_model");
const RepeatedTask = require("../models/repeated_task_model");
const {
  getDateYMD,
  getDateObjectFromYMD,
} = require("../../utils/date_converter");

const { getInputLength } = require("../../utils/util");

const stopRepeatTask = async (req, res) => {
  const queryDate = req.query.task_repeat_end_date;
  const queryDateObject = getDateObjectFromYMD(queryDate);
  const endDateObject = new Date(
    queryDateObject.valueOf() - 60 * 60 * 24 * 1000
  );
  const endDate = getDateYMD(endDateObject);
  const repeatDetails = {
    end_date: endDate,
    end_date_unix: Math.ceil(new Date(endDate + "T23:59:59")),
  };
  const result = await RepeatedTask.updateRepeatRule(
    repeatDetails,
    req.query.task_origin_id
  );
  res.status(200).send({ result });
};

const saveNewRepeatedTask = async (req, res) => {
  const originId = req.body.taskOriginId;
  const title = req.body.taskTitle;
  const description = req.body.taskDescription;
  const dueDate = req.body.taskDueDate;
  const dueDateUnix = Math.ceil(new Date(dueDate + "T23:59:59"));
  const originDate = req.body.taskOriginDate;
  const originDateUnix =  Math.ceil(new Date(originDate + "T23:59:59"));
  const status = req.body.taskStatus;

  const isRepeatAlreadySaved = await validateRepeatedTask(originId, originDate)
   if (isRepeatAlreadySaved) {
     res.status(400).send({ error: "origin id / origin date already exist"});
    return;
   } 
  if (getInputLength(req.body.taskTitle) > 100) {
    res.status(400).send({ error: "title too long" });
    return;
  }
  const returnedId = await RepeatedTask.saveNewRepeatedTask(
    originId,
    title,
    description,
    status,
    dueDate,
    dueDateUnix,
    originDate,
    originDateUnix
  );
  res.status(200).send({ newTaskId: returnedId });
};

const deleteNewRepeatedTask = async (req, res) => {
  const originId = req.query.task_origin_id;
  const originDate = req.query.task_origin_date;
  const originDateUnix = Math.ceil(new Date(originDate + "T23:59:59"));

  const isRepeatAlreadySaved = await validateRepeatedTask(originId, originDate)
   if (isRepeatAlreadySaved) {
     res.status(400).send({ error: "origin id / origin date already exist"});
    return;
   } 
  const returnedId = await RepeatedTask.deleteNewRepeatedTask(
    originId,
    originDate,
    originDateUnix
  );
  res.status(200).send({ newTaskId: returnedId });
};

const updateSavedRepeatedTask = async (req, res) => {
  const taskId = req.body.taskId;
  const body = req.body;
  const taskDetails = {
    title: body.taskTitle,
    description: body.taskDescription,
    status: body.taskStatus,
    due_date: body.taskDueDate,
    due_date_unix: Math.ceil(new Date(body.taskDueDate + "T23:59:59")),
  };
  const result = await Task.updateTask(taskDetails, taskId);
  res.status(200).send({ result });
};

const deleteSavedRepeatedTask = async (req, res) => {
  const taskId = req.query.task_id;
  const deleteResult = await Task.deleteTask(taskId);
  res.status(200).send({ deleteResult: deleteResult });
};

const validateRepeatedTask = async(originId, originDate) => {
  const result = await RepeatedTask.getSavedRepeatedTask(originId, originDate)
  if(result.length){
    return true
  } else {
    return false
  }
}

module.exports = {
  saveNewRepeatedTask,
  deleteNewRepeatedTask,
  updateSavedRepeatedTask,
  deleteSavedRepeatedTask,
  stopRepeatTask,
};
