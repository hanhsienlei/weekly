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

const getGoalWithPlan = async (goalId) => {
  const [ result ] = await pool.query(`
  SELECT 
	  g.user_id user_id,
    g.id g_id,
    g.title g_title,
    g.description g_description,
    g.due_date g_due_date,
    g.status g_status,
    g.group_id g_group_id,
    g.publish g_publish,
    g.popularity g_popularity,
    g.purpose_id p_id,
    p.title p_title,
    m.id m_id,
    m.title m_title,
    m.description m_description,
    m.due_date m_due_date,
    m.status m_status,
    t.id t_id,
    t.title t_title,
    t.description t_description,
    t.due_date t_due_date,
    t.status t_status,
    t.repeat t_repeat,
    r.frequency r_frequency,
    r.end_date r_end_date
  FROM goal g
  LEFT JOIN purpose p on g.purpose_id = p.id
  LEFT JOIN milestone m ON g.id = m.goal_id
  LEFT JOIN task t ON m.id = t.milestone_id
  LEFT JOIN repeated_task r ON t.id = r.task_id
  WHERE g.id = ?  
  `, goalId)
  return result
}

const getGoalsAndMilestonesByUser = async (userId) => {
  const [ result ] = await pool.query(`
  SELECT 
    g.id g_id,
    g.title g_title,
    g.due_date g_due_date,
    g.status g_status,
    g.group_id g_group_id,
    g.publish g_publish,
    g.purpose_id p_id,
    m.id m_id,
    m.title m_title,
    m.due_date m_due_date,
    m.status m_status
  FROM goal g
  LEFT JOIN purpose p on g.purpose_id = p.id
  LEFT JOIN milestone m ON g.id = m.goal_id
  WHERE g.user_id = ? ; 
  `, userId)
  return result
}

const getGoalsByUser = async (userId) => {
  const [ result ] = await pool.query(`
  SELECT 
    g.id g_id,
    g.title g_title,
    g.due_date g_due_date,
    g.status g_status,
    g.group_id g_group_id,
    g.publish g_publish,
    g.purpose_id p_id
  FROM goal g
  WHERE g.user_id = ? ; 
  `, userId)
  return result
}


const deleteGoalAndChildren = async (goalId) => {
  const [ result ] = await pool.query(`
  UPDATE goal g 
  INNER JOIN milestone m ON (g.id = m.goal_id)
  INNER JOIN task t ON (m.id = t.milestone_id)
  SET
  g.status = -1, m.status = -1, t.status = -1 
  WHERE g.id = ? ;
  `, goalId)
  return result
}



module.exports = {
  createGoal,
  saveGoal,
  getGoal,
  getGoalWithPlan,
  getGoalsAndMilestonesByUser,
  getGoalsByUser,
  deleteGoalAndChildren
}