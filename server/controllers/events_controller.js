//Date from database is converted to ISO string(UTC) based on local time zone by javascript
//eg., 2021-10-25 would become 2021-10-24T16:00:00.000Z
//So make sure to convert it back to date string (YYYY-MM-DD) based on local time zone

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

const REPEAT_FREQUENCY = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
};

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
    buttonsDate: getButtonsDate(targetDateObject),
    date: {
      startDate: targetDate,
      dueDate: targetDate,
      value: targetDate.split("-")[1] + "-" + targetDate.split("-")[2],
      weekDay: targetDateObject.toLocaleString("default", {
        weekday: "long",
      }),
      tasks: [],
      milestones: [],
      goals: [],
    },
    week: {
      startDate: targetDate,
      dueDate: getDateYMD(dateEndWeek),
      value: getWeekNumberByDate(targetDateObject).weekNumber,
      tasks: [],
      milestones: [],
      goals: [],
    },
    month: {
      startDate: targetDate,
      dueDate: getDateYMD(dateEndMonth),
      value: targetDateObject.toLocaleString("default", {
        month: "long",
      }),
      tasks: [],
      milestones: [],
      goals: [],
    },
    year: {
      startDate: targetDate,
      dueDate: getDateYMD(dateEndYear),
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
      events.forEach((row) => {
        const goalDueDate = row.g_due_date ? getDateYMD(row.g_due_date) : null;
        const milestoneDueDate = row.m_due_date
          ? getDateYMD(row.m_due_date)
          : null;
        const taskDueDate = row.t_due_date ? getDateYMD(row.t_due_date) : null;
        const repeatEndDate = row.r_end_date
          ? getDateYMD(row.r_end_date)
          : null;
        const taskOriginDate = row.t_origin_date
          ? getDateYMD(row.t_origin_date)
          : null;
        for (let i = 0; i < 4; i++) {
          const range = loopConditions[i].range;
          const dateEnd = loopConditions[i].dateEnd;
          if (
            row.g_id &&
            row.g_status !== -1 &&
            goalDueDate >= targetDate &&
            goalDueDate <= dateEnd &&
            !records.goalIds.includes(row.g_id)
          ) {
            records.goalIds.push(row.g_id);
            const { g_id, g_title, g_description, g_status, g_category } = row;
            const newGoal = {
              goalId: g_id,
              goalTitle: g_title,
              goalDescription: g_description,
              goalDueDate,
              goalStatus: g_status,
              goalCategory: g_category,
            };
            data[range].goals.push(newGoal);
          }

          if (
            row.m_id &&
            row.m_status !== -1 &&
            milestoneDueDate >= targetDate &&
            milestoneDueDate <= dateEnd &&
            !records.milestoneIds.includes(row.m_id)
          ) {
            records.milestoneIds.push(row.m_id);
            const { m_id, m_title, m_description, m_status, g_id, g_category } =
              row;
            const newMilestone = {
              milestoneId: m_id,
              milestoneTitle: m_title,
              milestoneDescription: m_description,
              milestoneDueDate,
              milestoneStatus: m_status,
              milestoneParent: [row.g_title],
              goalId: g_id,
              goalDueDate,
              goalCategory: g_category,
            };
            data[range].milestones.push(newMilestone);
          }

          if (
            taskDueDate >= targetDate &&
            taskDueDate <= dateEnd &&
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
              const milestoneId = row.m_id ? row.m_id : null;
              const goalId = row.g_id ? row.g_id : null;
              const goalCategory = row.g_category ? row.g_category : null;

              const newTask = {
                taskId: t_id,
                taskTitle: t_title,
                taskDescription: t_description,
                taskDueDate,
                taskStatus: t_status,
                taskRepeat: t_repeat,
                taskOriginId: t_origin_id,
                repeatFrequency: r_frequency,
                repeatEndDate,
                milestoneId,
                milestoneDueDate,
                goalId,
                goalDueDate,
                goalCategory,
              };
              newTask.taskParent = row.m_id ? [row.g_title, row.m_title] : null;

              if (row.t_origin_id) {
                newTask.taskOriginDate = taskOriginDate;
              }
              data[range].tasks.push(newTask);
            }
          }
          if (taskOriginDate >= targetDate && taskOriginDate <= dateEnd) {
            repeatedTaskIds.push(row.t_origin_id);
          }
        }
      });

      //render repeated task only for date container
      events.forEach((row) => {
        const goalDueDate = row.g_due_date ? getDateYMD(row.g_due_date) : null;
        const milestoneDueDate = row.m_due_date
          ? getDateYMD(row.m_due_date)
          : null;
        const taskDueDate = row.t_due_date ? getDateYMD(row.t_due_date) : null;
        const repeatEndDate = row.r_end_date
          ? getDateYMD(row.r_end_date)
          : null;
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
            taskId: null,
            taskTitle: t_title,
            taskDescription: t_description,
            taskDueDate: targetDate,
            taskStatus: 0,
            taskParent: [row.g_title, row.m_title],
            taskOriginId: t_id,
            taskOriginDate: targetDate,
            repeatFrequency: r_frequency,
            repeatEndDate,
            milestoneId: m_id,
            milestoneDueDate,
            goalId: g_id,
            goalDueDate,
            goalCategory: g_category,
          };

          data.date.tasks.push(newTask);
          repeatedTaskIds.push(row.t_id);
        }

        const isRepeatedTaskRecorded = repeatedTaskIds.includes(row.t_id);
        const isTaskListed = records.taskIds.includes(row.t_id);
        const isInDateRange =
          taskDueDate < targetDate && repeatEndDate >= targetDate;

        if (
          row.t_status != -1 &&
          row.t_repeat == 1 &&
          !isTaskListed &&
          !isRepeatedTaskRecorded &&
          isInDateRange
        ) {
          switch (row.r_frequency) {
            case REPEAT_FREQUENCY.DAILY:
              addNewRepeatingTask();
              break;

            case REPEAT_FREQUENCY.WEEKLY:
              const dateStartRepeat = new Date(taskDueDate);
              const dateRepeat = new Date(targetDate);
              const isWeekly = dateStartRepeat.getDay() === dateRepeat.getDay();
              if (isWeekly) addNewRepeatingTask();
              break;

            case REPEAT_FREQUENCY.MONTHLY:
              let dateInit = taskDueDate;
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
  data.dateBefore = getDateYMD(new Date(dateObject.valueOf() - dayMilliSecond));
  data.dateAfter = getDateYMD(new Date(dateObject.valueOf() + dayMilliSecond));
  data.weekBefore = getDateYMD(
    new Date(dateObject.valueOf() - dayMilliSecond * 7)
  );
  data.weekAfter = getDateYMD(
    new Date(dateObject.valueOf() + dayMilliSecond * 7)
  );
  data.monthBefore = getDateYMD(new Date(getPreviousMonthThisDay(dateObject)));
  data.monthAfter = getDateYMD(new Date(getNextMonthThisDay(dateObject)));
  data.yearBefore = getDateYMD(new Date(getPreviousYearThisDay(dateObject)));
  data.yearAfter = getDateYMD(new Date(getNextYearThisDay(dateObject)));
  return data;
};

module.exports = {
  getEventsByDate,
};
