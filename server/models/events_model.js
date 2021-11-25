const { pool } = require("./config_mysql");

const getGoalEventsByDateRange = async (userId, dateStart, dateEnd) => {
  const queryConditions = [
    userId,
    dateStart,
    dateEnd,
    dateStart,
    dateEnd,
    dateStart,
    dateEnd,
    dateStart,
    dateEnd,
    dateStart,
    dateStart,
  ];
  const [result] = await pool.query(
    `
    SELECT 
	  g.user_id user_id,
    g.id g_id,
    g.title g_title,
    g.description g_description,
    g.due_date g_due_date,
    g.status g_status,
    g.category g_category,
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
    LEFT JOIN milestone m ON g.id = m.goal_id
    LEFT JOIN task t ON m.id = t.milestone_id
    LEFT JOIN repeated_task r ON t.id = r.task_id
    WHERE (g.user_id=?)  
    AND
    ((t.due_date BETWEEN ? AND ?) 
    OR (t.origin_date BETWEEN ? AND ?) 
    OR (m.due_date  BETWEEN ? AND ?) 
    OR (g.due_date  BETWEEN ? AND ?)
    OR (t.repeat = 1 AND t.due_date < ? AND r.end_date >= ?))
    ORDER BY t_due_date, m_due_date, g_due_date ;  
  `,
    queryConditions
  );
  return result;
};

const getIndependentTasksByDateRange = async (userId, dateStart, dateEnd) => {
  const queryConditions = [
    userId,
    dateStart,
    dateEnd,
    dateStart,
    dateEnd,
    dateStart,
    dateStart,
  ];
  const [result] = await pool.query(
    `
    SELECT 
	  t.user_id user_id,
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
    WHERE (t.user_id=?)  
    AND
    ((t.due_date BETWEEN ? AND ?) 
    OR (t.origin_date BETWEEN ? AND ?) 
    OR (t.repeat = 1 AND t.due_date < ? AND r.end_date >= ?))
    ORDER BY t_due_date;  
  `,
    queryConditions
  );
  return result;
};

module.exports = {
  getGoalEventsByDateRange,
  getIndependentTasksByDateRange,
};
