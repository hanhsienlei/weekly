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
  console.log("[event controller]: ", userId);
  const targetDate = req.params.date;
  if (!userId) {
    return res.status(400).send({ message: "user id is required." });
  } else {
    const targetDateObject = getDateObjectFromYMD(targetDate); //get date object with local timezone
    const dayMilliSecond = 60 * 60 * 24 * 1000;
    //取今天~週日（左邊欄（日）重複則不顯示） (跟日月年不同邏輯，有重疊是正常)
    const dateEndWeek = targetDateObject.getDay()
      ? getSundayByDate(targetDateObject)
      : targetDateObject;
    //今天~月底 （左邊欄（日週）重複則不顯示）
    const dateEndMonth = getMonthEndByDate(targetDateObject);
    //今天~年底（左邊欄（日月週）重複則不顯示）
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
    
    //取資料：今天到年底，如果周剛好跨年，則到週日
    //loop 分配到日週月年的object
    const dataEndDate =
      dateEndYear > dateEndWeek
        ? getDateYMD(dateEndYear)
        : getDateYMD(dateEndWeek);
    const result = await Events.getEventsByDateRange(
      userId,
      targetDate,
      dataEndDate
    );
    // console.log("controller: ", result);

    
    if (!result.length) {
      return res.status(200).send(data);
    } else {
      const records = { goalIds: [], milestoneIds: [], taskIds: [] };
      const repeatedTaskIds = [];
      const loopConditions = [
        { range: "date", dateStart: targetDate, dateEnd: targetDate },
        { range: "week", dateStart: targetDate, dateEnd: getDateYMD(dateEndWeek) },
        { range: "month", dateStart: targetDate, dateEnd: getDateYMD(dateEndMonth) },
        { range: "year", dateStart: targetDate, dateEnd: getDateYMD(dateEndYear) },
      ];
      //先做所有事件
      result.forEach((row) => {
        //javascript會自動將時區加入到date string再做成ISO string(UTC), 例如2021-10-25會變成2021-10-24T16:00:00.000Z
        //要自己轉回local time zone 的 date string (YYYY-MM-DD)
        const g_due_date = row.g_due_date ? getDateYMD(row.g_due_date) : null;
        const m_due_date = row.m_due_date ? getDateYMD(row.m_due_date) : null;
        const t_due_date = row.t_due_date ? getDateYMD(row.t_due_date) : null;
        const r_end_date = row.r_end_date ? getDateYMD(row.r_end_date) : null;
        for (let i = 0; i < 4; i++) {
          const range = loopConditions[i].range;
          const dateStart = loopConditions[i].dateStart;
          const dateEnd = loopConditions[i].dateEnd;
          //console.log(range, dateStart, dateEnd)
          if (
            row.g_status !== -1 &&
            g_due_date >= dateStart &&
            g_due_date <= dateEnd &&
            !records.goalIds.includes(row.g_id)
          ) {
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
            data[range].goals.push(newGoal);
            console.log("goal!")
          }

          if (
            row.m_status !== -1 &&
            m_due_date >= dateStart &&
            m_due_date <= dateEnd &&
            !records.milestoneIds.includes(row.m_id)
          ) {
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
            data[range].milestones.push(newMilestone);
            console.log("milestone!")
          }

          if (
            t_due_date >= dateStart &&
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
              data[range].tasks.push(newTask);
              console.log("task!")
            }
            if (row.t_origin_id) {
              repeatedTaskIds.push(row.t_origin_id);
            }
          }
        }

        // console.log("repeatedTaskIds", repeatedTaskIds);
        // console.log("records:", records);
      });

      //render完真tasks後才render repeated tasks
    //repeated tasks only for date container
    result.forEach((row) => {
      const g_due_date = row.g_due_date ? getDateYMD(row.g_due_date) : null;
      const m_due_date = row.m_due_date ? getDateYMD(row.m_due_date) : null;
      const t_due_date = row.t_due_date ? getDateYMD(row.t_due_date) : null;
      const r_end_date = row.r_end_date ? getDateYMD(row.r_end_date) : null;
      function addNewRepeatingTask() {
        const { t_id, t_title, t_description, r_frequency, m_id, g_id } = row;
        const newTask = {
          t_id: null,
          t_title,
          t_description,
          t_due_date: targetDate,
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

        data.date.tasks.push(newTask);
        repeatedTaskIds.push(t_id);
        console.log("[repeat] newTask: ", newTask);
        console.log("repeated task added!!!!t_origin_id: ", t_id);
      }

      const isRepeatedTaskRecorded = repeatedTaskIds.includes(row.t_id);
      const isTaskListed = records.taskIds.includes(row.t_id);
      const isInDateRange = t_due_date < targetDate && r_end_date >= targetDate;
      console.log(t_due_date, targetDate, "...", r_end_date, targetDate);
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
    }

    
    return res.status(200).send(data);
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



module.exports = {
  getEventsByDate,
};
