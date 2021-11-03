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

const getMilestoneWithChildrenIds = async (milestoneId) => {
  const [ result ] = await pool.query(`
  SELECT 
    m.id m_id,
    m.title m_title,
    t.id t_id,
    t.title t_title
  FROM milestone m
  LEFT JOIN task t on m.id = t.milestone_id
  WHERE m.id = ? ; 
  `, milestoneId)
  return result
}

const DeleteMilestonesByGoalId = async (goalId) => {
  const [ result ] = await pool.query(`
  UPDATE milestone 
  SET status = -1
  WHERE goal_id = ?;
  `, goalId)
  return result
}

const DeleteMilestone = async (milestoneId) => {
  const [ result ] = await pool.query(`
  UPDATE milestone 
  SET status = -1
  WHERE id = ?;
  `, milestoneId)
  return result
}



module.exports = {
  createMilestone,
  saveMilestone,
  getMilestone,
  getMilestoneWithChildrenIds,
  DeleteMilestonesByGoalId,
  DeleteMilestone
}



