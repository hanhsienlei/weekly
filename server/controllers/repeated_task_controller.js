const Task = require("../models/task_model");
const RepeatedTask = require("../models/repeated_task_model");
const {
  getDateYMD,
  getDateObjectFromYMD,
} = require("../../utils/date_converter");

const { getInputLength } = require("../../utils/util");

const stopRepeatTask = async (req, res) => {
  const queryDate = req.query.task_r_end_date
  const queryDateObject = getDateObjectFromYMD(queryDate)
  const endDateObject = new Date(queryDateObject.valueOf() - (60 * 60 * 24 * 1000))
  const ednDate = getDateYMD(endDateObject)
  const repeatDetails = {
    end_date: ednDate,
    end_date_unix: Math.ceil(new Date(ednDate + "T23:59:59")),
  };
console.log(repeatDetails)
  const result = await RepeatedTask.updateRepeatRule(
    repeatDetails,
    req.query.task_origin_id
  );
  res.status(200).send({ result: result });
};

const saveNewRepeatedTask = async (req, res) => {
  console.log("[saveNewRepeatedTask controller ] req.body: ", req.body)
  
  const originId = req.body.task_origin_id;
  const title = req.body.task_title;
  const description = req.body.task_description;
  const dueDate = req.body.task_due_date;
  const dueDateUnix = Math.ceil(new Date(dueDate + "T23:59:59"));
  const originDate = req.body.task_origin_date;
  const originDateUnix = Math.ceil(new Date(originDate + "T23:59:59"));
  const status = req.body.task_status;
  if (getInputLength(req.body.task_title) > 100) {
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
  const returnedId = await RepeatedTask.deleteNewRepeatedTask(
    originId,
    originDate,
    originDateUnix
  );
  res.status(200).send({ newTaskId: returnedId });
};

//delete the repeated task and create a regular task
const updateSavedRepeatedTask = async (req, res) => {
  const taskId = req.body.task_id;
  const body = req.body;
  const taskDetails = {
    title: body.task_title,
    description: body.task_description,
    status: body.task_status,
    due_date: body.task_due_date,
    due_date_unix: Math.ceil(new Date(body.task_due_date + "T23:59:59")),
  };

  const result = await Task.updateTask(taskDetails, taskId);
  
  res.status(200).send({ result });
};

const deleteSavedRepeatedTask = async (req, res) => {
  //delete the repeated task
  const taskId = req.query.task_id;
  const deleteResult = await Task.deleteTask(taskId);
  res.status(200).send({ deleteResult: deleteResult });
};

module.exports = {
  saveNewRepeatedTask,
  deleteNewRepeatedTask,
  updateSavedRepeatedTask,
  deleteSavedRepeatedTask,
  stopRepeatTask,
};
