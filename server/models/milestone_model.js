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

const deleteMilestoneAndChildren = async (milestoneId) => {
  const [ result ] = await pool.query(`
  UPDATE 
  milestone m 
  RIGHT JOIN task t ON (m.id = t.milestone_id)
  SET
  m.status = -1, t.status = -1
  WHERE m.id = ? ;
  `, milestoneId)
  return result
}

const getMilestonesByGoalId = async (GoalId) => {
  const [ result ] = await pool.query(`
  SELECT 
    m.id m_id,
    m.title m_title,
    m.due_date m_due_date
  FROM milestone m
  WHERE m.goal_id = ?
  AND m.status>-1 ; 
  `, GoalId)
  console.log(result)
  return result
}


const getGoalByMilestone = async (milestoneId) => {
  const [ result ] = await pool.query(`
  SELECT 
    m.id m_id,
    m.title m_title,
    m.due_date m_due_date,
    g.id g_id,
    g.title g_title,
    g.due_date g_due_date
  FROM milestone m 
  JOIN goal g ON (g.id = m.goal_id)
  WHERE m.id = ? ;
  `, milestoneId)
  console.log(result)
  return result
}

const getTasksByMilestone = async (milestoneId) => {
  const [ result ] = await pool.query(`
  SELECT 
    m.id m_id,
    m.title m_title,
    m.due_date m_due_date,
    t.id t_id,
    t.title t_title,
    t.due_date t_due_date,
    t.repeat t_repeat,
    r.end_date r_end_date
  FROM task t
  LEFT JOIN milestone m  ON (t.milestone_id = m.id)
  LEFT JOIN repeated_task r ON (t.id = r.task_id)
  WHERE m.id = ? AND t.status > -1;
  `, milestoneId)
  console.log(result)
  return result
}

const getUserByMilestone = async (milestoneId) => {
  const query = `
  SELECT g.user_id user_id
  FROM goal g
  JOIN milestone m ON (g.id = m.goal_id)
  WHERE m.id = ?
  `
  const [ result ] = await pool.query(query, milestoneId)
  return result[0]
}


module.exports = {
  createMilestone,
  saveMilestone,
  getMilestone,
  getMilestoneWithChildrenIds,
  deleteMilestoneAndChildren,
  getMilestonesByGoalId,
  getGoalByMilestone,
  getTasksByMilestone,
  getUserByMilestone
}



