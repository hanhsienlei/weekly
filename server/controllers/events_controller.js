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
  const userId = req.user.id;
  console.log("[event controller]: ", userId)
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
      month: "long",
    });
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
    data.date.start_date = targetDate;

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
    const repeatedTaskIds = [];
    result.forEach((row) => {
      //javascript會自動將時區加入到date string再做成ISO string(UTC), 例如2021-10-25會變成2021-10-24T16:00:00.000Z
      //要自己轉回local time zone 的 date string (YYYY-MM-DD)
      const g_due_date = row.g_due_date ? getDateYMD(row.g_due_date) : null;
      const m_due_date = row.m_due_date ? getDateYMD(row.m_due_date) : null;
      const t_due_date = row.t_due_date ? getDateYMD(row.t_due_date) : null;
      const r_end_date = row.r_end_date ? getDateYMD(row.r_end_date) : null;

      if (
        row.g_status !== -1 &&
        g_due_date >= dateStart &&
        g_due_date <= dateEnd
      ) {
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
      if (
        row.m_status !== -1 &&
        m_due_date >= dateStart &&
        m_due_date <= dateEnd
      ) {
        if (!records.milestoneIds.includes(row.m_id)) {
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
            g_due_date,
          };
          data.milestones.push(newMilestone);
        }
      }
      if (t_due_date >= dateStart && t_due_date <= dateEnd) {
        if (row.t_status !== -1 && !records.taskIds.includes(row.t_id)) {
          records.taskIds.push(row.t_id);
          const {
            t_id,
            t_title,
            t_description,
            t_status,
            r_frequency,
            t_repeat,
            t_origin_id,
            m_id,
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
            t_origin_id,
            r_frequency,
            r_end_date,
            m_id,
            m_due_date,
            g_id,
            g_due_date,
          };
          data.tasks.push(newTask);
        } 
        if (row.t_origin_id) {
          repeatedTaskIds.push(row.t_origin_id);
        }
      }
      console.log("repeatedTaskIds", repeatedTaskIds);
      console.log("records:", records);
    });

    //render完真tasks後才render repeated tasks
    //repeated tasks only for date container
    result.forEach((row) => {
      const g_due_date = row.g_due_date ? getDateYMD(row.g_due_date) : null;
      const m_due_date = row.m_due_date ? getDateYMD(row.m_due_date) : null;
      const t_due_date = row.t_due_date ? getDateYMD(row.t_due_date) : null;
      const r_end_date = row.r_end_date ? getDateYMD(row.r_end_date) : null;
      function addNewRepeatingTask() {
        const {
          t_id,
          t_title,
          t_description,
          r_frequency,
          m_id,
          g_id,
        } = row;
        const newTask = {
          t_id: null,
          t_title,
          t_description,
          t_due_date: dateEnd,
          t_status: 0,
          t_parent: [row.p_title, row.g_title, row.m_title],
          t_origin_id: t_id,
          r_frequency,
          r_end_date,
          m_id,
          m_due_date,
          g_id,
          g_due_date,
        };

        data.tasks.push(newTask);
        repeatedTaskIds.push(t_id)
        console.log("[repeat] newTask: ", newTask);
        console.log("repeated task added!!!!t_origin_id: ", t_id);
      }

      const isRepeatedTaskRecorded = repeatedTaskIds.includes(row.t_id);
      const isTaskListed = records.taskIds.includes(row.t_id);
      const isInDateRange = t_due_date < dateStart && r_end_date >= dateEnd;
      console.log(t_due_date, dateStart, "...", r_end_date, dateEnd);
      //console.log(row.t_id, "isRepeatedTaskRecorded, isTaskListed, isInDateRange: ", isRepeatedTaskRecorded, isTaskListed, isInDateRange)
      //console.log(row.t_repeat == 1 && !isTaskListed && !isRepeatedTaskRecorded && isInDateRange)
      if (
        row.t_status != -1 &&
        row.t_repeat == 1 &&
        !isTaskListed &&
        !isRepeatedTaskRecorded &&
        isInDateRange
      ) {
        //console.log("repeatedTaskIds: ", repeatedTaskIds);
        //console.log(row.t_id, "...", row.r_frequency)
        switch (row.r_frequency) {
          case 1:
            console.log("r_f =1!!!");
            addNewRepeatingTask();
            break;
          case 7:
            const dateStartRepeatValue = new Date(t_due_date).valueOf();
            const dateEndValue = new Date(dateEnd).valueOf();
            const sevenDaysInMilliSecond = 60 * 60 * 24 * 1000 * 7;
            const isWeekly =
              (dateEndValue - dateStartRepeatValue) % sevenDaysInMilliSecond ===
              0;
            //console.log(dateStartRepeatValue, dateEndValue, sevenDaysInMilliSecond, isWeekly)
            if (isWeekly) {
              addNewRepeatingTask();
            }
            break;
          case 30:
            let dateInit = t_due_date;
            while (dateInit <= dateEnd) {
              let dateNew = getDateYMD(getNextMonthThisDay(new Date(dateInit)));
              //console.log("month: ", dateNew, dateEnd, dateNew == dateEnd)
              if (dateNew == dateEnd) {
                addNewRepeatingTask();
                break;
              }
              dateInit = dateNew;
            }
        }
      }
    });
    console.log(data)
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
