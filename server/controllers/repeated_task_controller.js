const Task = require("../models/task_model");
const RepeatedTask = require("../models/repeated_task_model");
const {
  getDateYMD,
  getDateObjectFromYMD,
} = require("../../utils/date_converter");

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
  const dueDate = req.body.task_due_date;
  const dueDateUnix = Math.ceil(new Date(dueDate + "T23:59:59"));
  const status = req.body.task_status;
  const returnedId = await RepeatedTask.saveNewRepeatedTask(
    originId,
    status,
    dueDate,
    dueDateUnix
  );
  res.status(200).send({ newTaskId: returnedId });
};

const deleteNewRepeatedTask = async (req, res) => {
  const originId = req.query.task_origin_id;
  const dueDate = req.query.task_due_date;
  const dueDateUnix = Math.ceil(new Date(dueDate + "T23:59:59"));
  const status = -1;
  console.log(originId,
    status,
    dueDate,
    dueDateUnix)
  const returnedId = await RepeatedTask.saveNewRepeatedTask(
    originId,
    status,
    dueDate,
    dueDateUnix
  );
  res.status(200).send({ newTaskId: returnedId });
};

//delete the repeated task and create a regular task
const updateSavedRepeatedTask = async (req, res) => {
  //delete the repeated task
  const taskId = req.body.task_id;
  const deleteResult = await RepeatedTask.deleteSavedRepeatedTask(taskId);

  //create a new regular task
  const body = req.body;
  const taskDetails = {
    title: body.task_title,
    description: body.task_description,
    status: body.task_status,
    due_date: body.task_due_date,
    due_date_unix: Math.ceil(new Date(body.task_due_date + "T23:59:59")),
    milestone_id: body.task_milestone_id,
    repeat: body.task_repeat,
  };
  const repeatDetails = {
    frequency: body.task_r_frequency,
    end_date: body.task_r_end_date,
    end_date_unix: Math.ceil(new Date(body.task_r_end_date + "T23:59:59")),
  };

  if (!taskDetails.milestone_id) {
    delete taskDetails.milestone_id;
  }

  taskDetails.user_id = req.user.id;
  
  const NewTaskId = await Task.createTask(taskDetails);
  if (body.task_repeat) {
    await handleRepeatRule(repeatDetails, NewTaskId);
  }
  
  res.status(200).send({ task_id: NewTaskId });
};

const deleteSavedRepeatedTask = async (req, res) => {
  //delete the repeated task
  const taskId = req.query.task_id;
  const deleteResult = await Task.deleteTask(taskId);
  res.status(200).send({ deleteResult: deleteResult });
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

module.exports = {
  saveNewRepeatedTask,
  deleteNewRepeatedTask,
  updateSavedRepeatedTask,
  deleteSavedRepeatedTask,
  stopRepeatTask,
};
