const { pool } = require("./config_mysql")

const getEventsByDate = async (userId, date) => {
  const queryConditions = [userId, userId, date, date, date]
  const [result] = await pool.query(`
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
    g.category g_category,
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
    t.origin_id t_origin_id,
    t.origin_date t_origin_date,
    r.frequency r_frequency,
    r.end_date r_end_date
    FROM goal g
    LEFT JOIN purpose p on g.purpose_id = p.id
    LEFT JOIN milestone m ON g.id = m.goal_id
    LEFT JOIN task t ON m.id = t.milestone_id
    LEFT JOIN repeated_task r ON t.id = r.task_id
    WHERE (t.user_id=? or g.user_id=?) AND (t.due_date=? or m.due_date=? or g.due_date=?);  
  `, queryConditions) 
  return result
}

const getEventsByDateRange = async (userId, dateStart, dateEnd) => {
  const queryConditions = [userId, userId, dateStart, dateEnd, dateStart, dateEnd, dateStart, dateEnd, dateStart, dateEnd, dateStart, dateStart, userId, userId, dateStart, dateEnd, dateStart, dateEnd, dateStart, dateEnd, dateStart, dateEnd, dateStart, dateStart]
  const [result] = await pool.query(`
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
    g.category g_category,
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
    t.origin_id t_origin_id,
    t.origin_date t_origin_date,
    r.frequency r_frequency,
    r.end_date r_end_date
    FROM goal g
    LEFT JOIN purpose p on g.purpose_id = p.id
    LEFT JOIN milestone m ON g.id = m.goal_id
    LEFT JOIN task t ON m.id = t.milestone_id
    LEFT JOIN repeated_task r ON t.id = r.task_id
    WHERE (t.user_id=? or g.user_id=?)  
    AND
    ((t.due_date BETWEEN ? AND ?) 
    OR (t.origin_date BETWEEN ? AND ?) 
    OR (m.due_date  BETWEEN ? AND ?) 
    OR (g.due_date  BETWEEN ? AND ?)
    OR (t.repeat = 1 AND t.due_date < ? AND r.end_date >= ?))
    UNION ALL
    SELECT 
	  t.user_id user_id,
    g.id g_id,
    g.title g_title,
    g.description g_description,
    g.due_date g_due_date,
    g.status g_status,
    g.group_id g_group_id,
    g.publish g_publish,
    g.popularity g_popularity,
    g.purpose_id p_id,
    g.category g_category,
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
    t.origin_id t_origin_id,
    t.origin_date t_origin_date,
    r.frequency r_frequency,
    r.end_date r_end_date
    FROM task t
    LEFT JOIN repeated_task r ON t.id = r.task_id
    LEFT JOIN milestone m ON t.milestone_id = m.id
    LEFT JOIN goal g ON m.goal_id = g.id
    LEFT JOIN purpose p on g.purpose_id = p.id    
    WHERE (t.user_id=? or g.user_id=?)  
    AND
    ((t.due_date BETWEEN ? AND ?) 
    OR (t.origin_date BETWEEN ? AND ?) 
    OR (m.due_date  BETWEEN ? AND ?) 
    OR (g.due_date  BETWEEN ? AND ?)
    OR (t.repeat = 1 AND t.due_date < ? AND r.end_date >= ?))
    ORDER BY t_due_date, m_due_date, g_due_date ;  
  `, queryConditions) 
  console.log("[event model] result: ", result)
  return result
}

module.exports = {
  getEventsByDateRange
}