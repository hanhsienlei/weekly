const { pool } = require("./config_mysql")

const createGoal = async (goal_details) => {
  const [result] = await pool.query("INSERT INTO goal SET ?", goal_details)
  return result.insertId
}

const saveGoal = async (goal_details, goal_id) => {
  const updateQuery = [goal_details].concat(goal_id)
  const [ result ] = await pool.query("UPDATE goal SET ? WHERE id = ?", updateQuery)
  return result.info
}

const getGoal = async (goal_id) => {
  const [ result ] = await pool.query("SELECT * FROM goal WHERE id = ?", goal_id)
  return result[0]
}

module.exports = {
  createGoal,
  saveGoal,
  getGoal
}