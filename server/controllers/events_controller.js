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
const { getGoalsAndMilestonesByUser } = require("../models/goal_model");

const getEventsByDate = async (req, res) => {
  //做完登入登出後要換成token驗證取userId
  const userId = Number(req.query.user_id);
  const targetDate = req.params.date;
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
    const targetDateObject = getDateObjectFromYMD(targetDate); //get date object with local timezone
    const dayMilliSecond = 60 * 60 * 24 * 1000;
    //取明天~週日 (target date 為週日則 target date)
    const dateStartWeek = targetDateObject.getDay()
      ? new Date(targetDateObject.valueOf() + dayMilliSecond)
      : targetDateObject;
    const dateEndWeek = targetDateObject.getDay()
      ? getSundayByDate(targetDateObject)
      : targetDateObject;
    //取下週一~月底 
    const dateStartMonth = new Date(dateEndWeek.valueOf() + dayMilliSecond);
    const dateEndMonth = getMonthEndByDate(targetDateObject);
    //取下月初~年底
    const dateStartYear = new Date(dateEndMonth.valueOf() + dayMilliSecond);

    const dateEndYear = new Date(targetDate.split("-")[0], 11, 31);

    //重複事件有bug......
    data.year = await getEventsByDateRange(
      userId,
      getDateYMD(dateStartYear),
      getDateYMD(dateEndYear)
    );
    data.year.value = targetDate.split("-")[0];
    data.year.start_date = getDateYMD(dateStartYear);
    data.year.due_date = getDateYMD(dateEndYear);
      data.month = await getEventsByDateRange(
        userId,
        getDateYMD(dateStartMonth),
        getDateYMD(dateEndMonth)
      );
      
    data.month.value = targetDateObject.toLocaleString("default", {
      month: "long"});
    data.month.start_date = getDateYMD(dateStartMonth);
    data.month.due_date = getDateYMD(dateEndMonth);

      data.week = await getEventsByDateRange(
        userId,
        getDateYMD(dateStartWeek),
        getDateYMD(dateEndWeek)
      );
  
    

    data.week.value = getWeekNumberByDate(targetDateObject).weekNumber;
    data.week.start_date = getDateYMD(dateStartWeek);
    data.week.due_date = getDateYMD(dateEndWeek);

    data.date = await getEventsByDateRange(userId, targetDate, targetDate);

    const weekdayName = targetDateObject.toLocaleString("default", {
      weekday: "long",
    });

    data.date.value = targetDate.split("-")[1] + "-" + targetDate.split("-")[2];
    data.date.week_day = weekdayName;
    data.date.due_date = targetDate;

    //按鈕資料
    data.buttons_date = getButtonsDate(targetDateObject);
    data.milestone_list = await getMilestoneList(userId);

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
      const r_end_date = row.r_end_date ? getDateYMD(row.r_end_date) : null;
      function addTask(IsCloneOfTask) {
        const {
          t_id,
          t_title,
          t_description,
          t_status,
          r_frequency,
          t_repeat,
          g_id,
        } = row;
        const newTask = {
          t_id,
          t_title,
          t_description,
          t_due_date,
          t_status,
          t_parent: [row.p_title, row.g_title, row.m_title],
          t_repeat,
          r_frequency,
          r_end_date,
          m_due_date,
          g_id,
        };
        console.log("newTask: ", newTask);
        if (IsCloneOfTask) {
          newTask.t_id = null;
          newTask.t_due_date = dateEnd;
          console.log("repeated task added!!!!t_id: ", t_id);
        }
        data.tasks.push(newTask);
      }
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
        if (!records.milestoneIds.includes(row.m_id)){
          records.milestoneIds.push(row.m_id);
          const { m_id, m_title, m_description, m_status, g_id } = row;
          const newMilestone = {
            m_id,
            m_title,
            m_description,
            m_due_date,
            m_status,
            m_parent: [row.p_title, row.g_title],
            g_id,
            g_due_date
          };
          data.milestones.push(newMilestone);
        }
      }
      if (t_due_date >= dateStart && t_due_date <= dateEnd) {
        if (!records.taskIds.includes(row.t_id)) {
          records.taskIds.push(row.t_id);
          addTask(0);
        }
      }
      if (row.t_repeat == 1 && !records.taskIds.includes(row.t_id)) {
        if (row.r_frequency == 1) {
          console.log("r_f =1!!!");
          records.taskIds.push(row.t_id);
          addTask(1);
        }
        if (row.r_frequency == 7) {
          let dateInit = row.t_due_date;
          while (dateInit <= getDateObjectFromYMD(dateEnd)) {
            console.log("looping for weekly tasks!!");
            let dateNew = new Date(
              dateInit.valueOf() + 60 * 60 * 24 * 1000 * 7
            );
            if (getDateYMD(dateNew) == dateEnd) {
              records.taskIds.push(row.t_id);
              addTask(1);
              break;
            }
            dateInit = dateNew;
          }
        }
        if (row.r_frequency == 30) {
          let dateInit = row.t_due_date;
          while (dateInit <= getDateObjectFromYMD(dateEnd)) {
            let dateNew = getNextMonthThisDay(row.t_end_date);
            if (getDateYMD(dateNew) == dateEnd) {
              records.taskIds.push(row.t_id);
              addTask(1);
              break;
            }
            dateInit = dateNew;
          }
        }
      }
      console.log("records:", records);
    });
    return data;
  }
};

const getButtonsDate = (dateObject) => {
  console.log("date from getButtonsDate(): ", dateObject);
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
  data.month_before = getDateYMD(new Date(getPreviousMonthThisDay(dateObject)));
  data.month_after = getDateYMD(new Date(getNextMonthThisDay(dateObject)));
  data.year_before = getDateYMD(new Date(getPreviousYearThisDay(dateObject)));
  data.year_after = getDateYMD(new Date(getNextYearThisDay(dateObject)));
  return data;
};

const getMilestoneList = async (userId) => {
  const result = await getGoalsAndMilestonesByUser(userId);
};

module.exports = {
  getEventsByDate,
};
