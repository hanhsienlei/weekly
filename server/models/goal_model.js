const { pool } = require("./config_mysql")

const createGoal = async (goalDetails) => {
  const [result] = await pool.query("INSERT INTO goal SET ?", goalDetails)
  return result.insertId
}

const saveGoal = async (goalDetails, goalId) => {
  const updateQuery = [goalDetails].concat(goalId)
  const [ result ] = await pool.query("UPDATE goal SET ? WHERE id = ?", updateQuery)
  return result.info
}

const getGoal = async (goalId) => {
  const [ result ] = await pool.query("SELECT * FROM goal WHERE id = ?", goalId)
  return result[0]
}

module.exports = {
  createGoal,
  saveGoal,
  getGoal
}