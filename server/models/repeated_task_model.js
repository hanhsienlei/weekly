const { pool } = require("./config_mysql");

const createRepeatRule = async (repeatDetails) => {
  const [result] = await pool.query("INSERT INTO repeated_task SET ?", [
    repeatDetails,
  ]);
  return result.insertId;
};

const updateRepeatRule = async (repeatDetails, taskId) => {
  const updateQuery = [repeatDetails].concat(taskId);
  const [result] = await pool.query(
    "UPDATE repeated_task SET ? WHERE task_id = ?",
    updateQuery
  );
  return result.info;
};

const getRepeatRule = async (taskId) => {
  const [result] = await pool.query(
    "SELECT * FROM repeated_task WHERE task_id = ?",
    taskId
  );
  return result[0];
};

const saveNewRepeatedTask = async (
  originId,
  title,
  description,
  status,
  dueDate,
  dueDateUnix,
  originDate,
  originDateUnix
) => {
  const query = `
  INSERT INTO task (title, description, milestone_id, user_id, status, due_date, due_date_unix, \`repeat\`, origin_id, origin_date, origin_date_unix) 
  SELECT ?, ?, milestone_id, user_id, ?, ?, ?, ?, ?, ?, ?
  from task
  WHERE id = ?;`;
  const queryData = [
    title,
    description,
    status,
    dueDate,
    dueDateUnix,
    0,
    originId,
    originDate,
    originDateUnix,
    originId,
  ];
  const [result] = await pool.query(query, queryData);
  return result.insertId;
};

const deleteNewRepeatedTask = async (originId, originDate, originDateUnix) => {
  const query = `
  INSERT INTO task (title, description, milestone_id, user_id, status, origin_id, origin_date, origin_date_unix) 
  SELECT title, description, milestone_id, user_id, -1, ?, ?, ?
  from task
  WHERE id = ?;`;
  const queryData = [originId, originDate, originDateUnix, originId];
  const [result] = await pool.query(query, queryData);

  return result.insertId;
};

const deleteSavedRepeatedTask = async (taskId) => {
  const [result] = await pool.query(
    "UPDATE task SET status = -1 WHERE id = ?",
    taskId
  );
  return result.info;
};

const updateRepeatedTasks = async (taskContent, taskId) => {
  const [result] = await pool.query("UPDATE task SET ? WHERE origin_id = ?", [
    taskContent,
    taskId,
  ]);
  return result.info;
};

const deleteRepeatedTasks = async (OriginId) => {
  const [result] = await pool.query(
    "UPDATE task SET status=-1 WHERE origin_id = ?",
    OriginId
  );
  return result.info;
};

const getSavedRepeatedTask = async (originId, OriginDate) => {
  const [result] = await pool.query(
    "SELECT * FROM task WHERE origin_id = ? AND origin_date = ?",
    [ originId, OriginDate ] 
  );
  return result;
}

module.exports = {
  createRepeatRule,
  updateRepeatRule,
  getRepeatRule,
  saveNewRepeatedTask,
  deleteNewRepeatedTask,
  deleteSavedRepeatedTask,
  updateRepeatedTasks,
  deleteRepeatedTasks,
  getSavedRepeatedTask
};
