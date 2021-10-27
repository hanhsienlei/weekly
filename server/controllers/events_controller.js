const Events = require("../models/events_model");
const {
  getDateYMD,
  getSundayByDate,
  getWeekNumberByDate,
  getMonthEndByDate,
  getDateObjectFromYMD,
  getNextMonthThisDay,
  getPreviousMonthThisDay,
  getNextYearThisDay,
  getPreviousYearThisDay,
} = require("../../utils/date_converter");

const getEventsByDate = async (req, res) => {
  //做完登入登出後要換成token驗證取userId
  const userId = Number(req.body.user_id);
  const date = req.params.date;
  const data = {
    user_id: userId,
    date: {},
    week: {},
    month: {},
    year: {},
    milestone_list: [],
    buttons_date: {},
  };
  if (!userId) {
    return res.status(400).send({ message: "user id is required." });
  } else {
    const dateObject = getDateObjectFromYMD(date); //get date object with local timezone
    const dayMilliSecond = 60 * 60 * 24 * 1000;
    //取明天~週日
    const dateStartWeek = new Date(dateObject.valueOf() + dayMilliSecond);
    const dateEndWeek = getSundayByDate(dateObject);
    //取下週一~月底
    const dateStartMonth = new Date(dateEndWeek.valueOf() + dayMilliSecond);
    const dateEndMonth = getMonthEndByDate(dateObject);
    //取下月初~年底
    const dateStartYear = new Date(dateEndMonth.valueOf() + dayMilliSecond);
    const dateEndYear = new Date(date.split("-")[0], 11, 31);
    data.date = await getEventsByDateRange(userId, date, date);
    data.date.value = date.slice(-5);
    data.week = await getEventsByDateRange(
      userId,
      getDateYMD(dateStartWeek),
      getDateYMD(dateEndWeek)
    );
    data.week.value = getWeekNumberByDate(dateObject).weekNumber;
    data.month = await getEventsByDateRange(
      userId,
      getDateYMD(dateStartMonth),
      getDateYMD(dateEndMonth)
    );
    data.month.value = date.slice(-5, -3);
    data.year = await getEventsByDateRange(
      userId,
      getDateYMD(dateStartYear),
      getDateYMD(dateEndYear)
    );
    data.year.value = date.slice(0, 4);
    data.buttons_date = getButtonsDate(dateObject);
    return res.status(200).send(data);
  }
};

const getEventsByDateRange = async (userId, dateStart, dateEnd) => {
  const result = await Events.getEventsByDateRange(userId, dateStart, dateEnd);
  if (!result.length) {
    return { message: "no event within this date range" };
  } else {
    const data = {
      goals: [],
      milestones: [],
      tasks: [],
    };
    const records = { goalIds: [], milestoneIds: [], taskIds: [] };
    result.forEach((row) => {
      //javascript會自動將時區加入到date string再做成ISO string(UTC), 例如2021-10-25會變成2021-10-24T16:00:00.000Z
      //要自己轉回local time zone 的 date string (YYYY-MM-DD)
      const g_due_date = row.g_due_date ? getDateYMD(row.g_due_date) : null;
      const m_due_date = row.m_due_date ? getDateYMD(row.m_due_date) : null;
      const t_due_date = row.t_due_date ? getDateYMD(row.t_due_date) : null;
      if (g_due_date >= dateStart && g_due_date <= dateEnd) {
        if (!records.goalIds.includes(row.g_id)) {
          records.goalIds.push(row.g_id);
          const { g_id, g_title, g_description, g_status } = row;
          const newGoal = {
            g_id,
            g_title,
            g_description,
            g_due_date,
            g_status,
            g_parent: [row.p_title],
          };
          data.goals.push(newGoal);
        }
      }
      if (m_due_date >= dateStart && m_due_date <= dateEnd) {
        if (!records.milestoneIds.includes(row.m_id)) {
          records.milestoneIds.push(row.m_id);
          const { m_id, m_title, m_description, m_status } = row;
          const newMilestone = {
            m_id,
            m_title,
            m_description,
            m_due_date,
            m_status,
            m_parent: [row.p_title, row.g_title],
          };
          data.milestones.push(newMilestone);
        }
      }
      if (t_due_date >= dateStart && t_due_date <= dateEnd) {
        if (!records.taskIds.includes(row.t_id)) {
          records.taskIds.push(row.t_id);
          const { t_id, t_title, t_description, t_status } = row;
          const newTask = {
            t_id,
            t_title,
            t_description,
            t_due_date,
            t_status,
            t_parent: [row.p_title, row.g_title, row.m_title],
          };
          data.tasks.push(newTask);
        }
      }
      console.log("records:", records);
    });
    return data;
  }
};

const getButtonsDate = (dateObject) => {
  const dayMilliSecond = 60 * 60 * 24 * 1000;
  const data = {};
  data.date_before = getDateYMD(
    new Date(dateObject.valueOf() - dayMilliSecond)
  );
  data.date_after = getDateYMD(new Date(dateObject.valueOf() + dayMilliSecond));
  data.week_before = getDateYMD(
    new Date(dateObject.valueOf() - dayMilliSecond * 7)
  );
  data.week_after = getDateYMD(
    new Date(dateObject.valueOf() + dayMilliSecond * 7)
  );
  data.month_before = getDateYMD(new Date(getNextMonthThisDay(dateObject)));
  data.month_after = getDateYMD(new Date(getPreviousMonthThisDay(dateObject)));
  data.year_before = getDateYMD(new Date(getNextYearThisDay(dateObject)));
  data.year_after = getDateYMD(new Date(getPreviousYearThisDay(dateObject)));
  return data;
};

module.exports = {
  getEventsByDate,
};
