const { pool } = require("./config_mysql")

const createTask = async (taskDetails) => {
  const [result] = await pool.query("INSERT INTO task SET ?", taskDetails)
  return result.insertId
}

const updateTask = async (taskDetails, taskId) => {
  const updateQuery = [taskDetails].concat(taskId)
  const [ result ] = await pool.query("UPDATE task SET ? WHERE id = ?", updateQuery)
  return result.info
}

const getTask = async (taskId) => {
  const [ result ] = await pool.query("SELECT * FROM task WHERE id = ?", taskId)
  return result[0]
}

const deleteTask = async (taskId) => {
  const [ result ] = await pool.query(`
  UPDATE task 
  SET status = -1
  WHERE id = ?;
  `, taskId)
  return result
}



module.exports = {
  createTask,
  updateTask,
  getTask,
  deleteTask,
}