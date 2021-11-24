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
  const userId = req.user.id;
  const targetDate = req.params.date;
  const targetDateObject = getDateObjectFromYMD(targetDate); //get date object with local timezone
  const dateEndWeek = targetDateObject.getDay()
    ? getSundayByDate(targetDateObject)
    : targetDateObject;
  const dateEndMonth = getMonthEndByDate(targetDateObject);
  const dateEndYear = new Date(targetDate.split("-")[0], 11, 31);
  const data = {
    buttons_date: getButtonsDate(targetDateObject),
    date: {
      start_date: targetDate,
      due_date: targetDate,
      value: targetDate.split("-")[1] + "-" + targetDate.split("-")[2],
      week_day: targetDateObject.toLocaleString("default", {
        weekday: "long",
      }),
      tasks: [],
      milestones: [],
      goals: [],
    },
    week: {
      start_date: targetDate,
      due_date: getDateYMD(dateEndWeek),
      value: getWeekNumberByDate(targetDateObject).weekNumber,
      tasks: [],
      milestones: [],
      goals: [],
    },
    month: {
      start_date: targetDate,
      due_date: getDateYMD(dateEndMonth),
      value: targetDateObject.toLocaleString("default", {
        month: "long",
      }),
      tasks: [],
      milestones: [],
      goals: [],
    },
    year: {
      start_date: targetDate,
      due_date: getDateYMD(dateEndYear),
      value: targetDate.split("-")[0],
      tasks: [],
      milestones: [],
      goals: [],
    },
  };
  const dataEndDate =
    dateEndYear > dateEndWeek
      ? getDateYMD(dateEndYear)
      : getDateYMD(dateEndWeek);
  const goalEvents = await Events.getGoalEventsByDateRange(
    userId,
    targetDate,
    dataEndDate
  );
  const IndependentTasks = await Events.getIndependentTasksByDateRange(
    userId,
    targetDate,
    dataEndDate
  );
  const records = { goalIds: [], milestoneIds: [], taskIds: [] };
  const repeatedTaskIds = [];
  const loopConditions = [
    { range: "date", dateEnd: targetDate },
    {
      range: "week",
      dateEnd: getDateYMD(dateEndWeek),
    },
    {
      range: "month",
      dateEnd: getDateYMD(dateEndMonth),
    },
    {
      range: "year",
      dateEnd: getDateYMD(dateEndYear),
    },
  ];

  const assignEvents = (events) => {
    if (!events.length) {
      return;
    } else {
      //先做所有事件
      events.forEach((row) => {
        //javascript會自動將時區加入到date string再做成ISO string(UTC), 例如2021-10-25會變成2021-10-24T16:00:00.000Z
        //要自己轉回local time zone 的 date string (YYYY-MM-DD)
        const g_due_date = row.g_due_date ? getDateYMD(row.g_due_date) : null;
        const m_due_date = row.m_due_date ? getDateYMD(row.m_due_date) : null;
        const t_due_date = row.t_due_date ? getDateYMD(row.t_due_date) : null;
        const r_end_date = row.r_end_date ? getDateYMD(row.r_end_date) : null;
        const t_origin_date = row.t_origin_date
          ? getDateYMD(row.t_origin_date)
          : null;
        for (let i = 0; i < 4; i++) {
          const range = loopConditions[i].range;
          const dateEnd = loopConditions[i].dateEnd;
          if (
            row.g_id &&
            row.g_status !== -1 &&
            g_due_date >= targetDate &&
            g_due_date <= dateEnd &&
            !records.goalIds.includes(row.g_id)
          ) {
            records.goalIds.push(row.g_id);
            const { g_id, g_title, g_description, g_status, g_category } = row;
            const newGoal = {
              g_id,
              g_title,
              g_description,
              g_due_date,
              g_status,
              g_category,
            };
            data[range].goals.push(newGoal);
          }

          if (
            row.m_id &&
            row.m_status !== -1 &&
            m_due_date >= targetDate &&
            m_due_date <= dateEnd &&
            !records.milestoneIds.includes(row.m_id)
          ) {
            records.milestoneIds.push(row.m_id);
            const { m_id, m_title, m_description, m_status, g_id, g_category } =
              row;
            const newMilestone = {
              m_id,
              m_title,
              m_description,
              m_due_date,
              m_status,
              m_parent: [row.g_title],
              g_id,
              g_due_date,
              g_category,
            };
            data[range].milestones.push(newMilestone);
          }

          if (
            t_due_date >= targetDate &&
            t_due_date <= dateEnd &&
            !records.taskIds.includes(row.t_id)
          ) {
            if (row.t_status !== -1) {
              records.taskIds.push(row.t_id);
              const {
                t_id,
                t_title,
                t_description,
                t_status,
                r_frequency,
                t_repeat,
                t_origin_id,
              } = row;
              const m_id = row.m_id ? row.m_id : null;
              const g_id = row.g_id ? row.g_id : null;
              const g_category = row.g_category ? row.g_category : null;

              const newTask = {
                t_id,
                t_title,
                t_description,
                t_due_date,
                t_status,
                t_repeat,
                t_origin_id,
                r_frequency,
                r_end_date,
                m_id,
                m_due_date,
                g_id,
                g_due_date,
                g_category,
              };

              if(row.m_id){
                newTask.t_parent = [row.g_title, row.m_title]
              }
              if (row.t_origin_id) {
                newTask.t_origin_date = t_origin_date;
              }
              data[range].tasks.push(newTask);
            }
          }
          if (t_origin_date >= targetDate && t_origin_date <= dateEnd) {
            repeatedTaskIds.push(row.t_origin_id);
          }
        }
      });

      //repeated tasks only for date container
      events.forEach((row) => {
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
            g_category,
          } = row;
          const newTask = {
            t_id: null,
            t_title,
            t_description,
            t_due_date: targetDate,
            t_status: 0,
            t_parent: [row.g_title, row.m_title],
            t_origin_id: t_id,
            t_origin_date: targetDate,
            r_frequency,
            r_end_date,
            m_id,
            m_due_date,
            g_id,
            g_due_date,
            g_category,
          };

          data.date.tasks.push(newTask);
          repeatedTaskIds.push(t_id);
        }

        const isRepeatedTaskRecorded = repeatedTaskIds.includes(row.t_id);
        const isTaskListed = records.taskIds.includes(row.t_id);
        const isInDateRange =
          t_due_date < targetDate && r_end_date >= targetDate;

        if (
          row.t_status != -1 &&
          row.t_repeat == 1 &&
          !isTaskListed &&
          !isRepeatedTaskRecorded &&
          isInDateRange
        ) {
          const repeatFrequency = {
            daily: 1,
            weekly: 7,
            monthly: 30,
          };
          switch (row.r_frequency) {
            case repeatFrequency.daily:
              addNewRepeatingTask();
              break;
            case repeatFrequency.weekly:
              const dateStartRepeatValue = new Date(t_due_date).valueOf();
              const dateEndValue = new Date(targetDate).valueOf();
              const sevenDaysInMilliSecond = 60 * 60 * 24 * 1000 * 7;
              const isWeekly =
                (dateEndValue - dateStartRepeatValue) %
                  sevenDaysInMilliSecond ===
                0;
              if (isWeekly) {
                addNewRepeatingTask();
              }
              break;
            case repeatFrequency.monthly:
              let dateInit = t_due_date;
              while (dateInit <= targetDate) {
                let dateNew = getDateYMD(
                  getNextMonthThisDay(new Date(dateInit))
                );
                if (dateNew == targetDate) {
                  addNewRepeatingTask();
                  break;
                }
                dateInit = dateNew;
              }
          }
        }
      });
    }
  };
  assignEvents(goalEvents);
  assignEvents(IndependentTasks);
  return res.status(200).send(data);
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
  data.month_before = getDateYMD(new Date(getPreviousMonthThisDay(dateObject)));
  data.month_after = getDateYMD(new Date(getNextMonthThisDay(dateObject)));
  data.year_before = getDateYMD(new Date(getPreviousYearThisDay(dateObject)));
  data.year_after = getDateYMD(new Date(getNextYearThisDay(dateObject)));
  return data;
};

module.exports = {
  getEventsByDate,
};
