const { pool } = require("./config_mysql")

const createMilestone = async (milestoneDetails) => {
  const [result] = await pool.query("INSERT INTO milestone SET ?", milestoneDetails)
  return result.insertId
}

const saveMilestone = async (milestoneDetails, milestoneId) => {
  const updateQuery = [milestoneDetails].concat(milestoneId)
  const [ result ] = await pool.query("UPDATE milestone SET ? WHERE id = ?", updateQuery)
  return result.info
}

const getMilestone = async (milestoneId) => {
  const [ result ] = await pool.query("SELECT * FROM milestone WHERE id = ?", milestoneId)
  return result[0]
}

module.exports = {
  createMilestone,
  saveMilestone,
  getMilestone
}