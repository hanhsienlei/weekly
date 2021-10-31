const { pool } = require("./config_mysql")

const createRepeatRule = async (repeatDetails) => {
  console.log("[createRepeatRule model] repeatDetails: ", repeatDetails)
  const [result] = await pool.query("INSERT INTO repeated_task SET ?", [repeatDetails])
  console.log(result)
  return result.insertId
}

const updateRepeatRule = async (repeatDetails, taskId) => {
    console.log("[updateRepeatRule model ] repeatDetails: ", repeatDetails)
  const updateQuery = [repeatDetails].concat(taskId)
  const [ result ] = await pool.query("UPDATE repeated_task SET ? WHERE task_id = ?", updateQuery)
  return result.info
}

const getRepeatRule = async (taskId) => {
    console.log("[getRepeatRule model] taskId: ", taskId)
  const [ result ] = await pool.query("SELECT * FROM repeated_task WHERE task_id = ?", taskId)
  return result[0]
}

module.exports = {
  createRepeatRule,
  updateRepeatRule,
  getRepeatRule
}