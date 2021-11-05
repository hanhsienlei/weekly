const Task = require("../models/task_model");
const RepeatedTask = require("../models/repeated_task_model");

const stopRepeatTask = async (req, res) => {
  const body = req.body;

  const repeatDetails = {
    task_id: body.task_origin_id,
    end_date: body.task_r_end_date,
    end_date_unix: Math.ceil(new Date(body.task_r_end_date + "T23:59:59")),
  };

  const result = await RepeatedTask.updateRepeatRule(repeatDetails, body.task_origin_id);
  res.status(200).send({ result: result });
};

module.exports = {
  // saveNewRepeatedTask,
  // deleteNewRepeatedTask,
  // saveSavedRepeatedTask,
  // deleteSavedRepeatedTask,
  stopRepeatTask,
};
