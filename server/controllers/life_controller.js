const Goal = require("../models/goal_model");
const {
  getDateYMD,
  getWeekNumberByDate,
  getUserByeDay
} = require("../../utils/date_converter");

const getGoalsLife = async (req, res) => {
  const userId = req.user.id;
  const userBirthday = new Date(req.user.birthday);
  const userByeDay = getUserByeDay(userBirthday);
  const getWeekForLife = (dateObject) => {
    const weekNumber = getWeekNumberByDate(dateObject).weekNumber;
    if (weekNumber === 53) {
      weekNumber = 52;
    }
    return weekNumber;
  };
  const result = await Goal.getGoalsByUser(userId);
  const data = {
    birthday: {
      date: getDateYMD(userBirthday),
      year: userBirthday.getFullYear(),
      week: getWeekForLife(userBirthday),
    },
    today: {
      date: getDateYMD(new Date()),
      year: new Date().getFullYear(),
      week: getWeekForLife(new Date()),
    },
    byeDay: {
      date: getDateYMD(userByeDay),
      year: userByeDay.getFullYear(),
      week: getWeekForLife(userByeDay),
    },
    goals: [],
    userName: req.user.name
  };
  result.forEach((row) => {
    const dateObject = new Date(row.g_due_date);
    const goal = {
      id: row.g_id,
      title: row.g_title,
      date: getDateYMD(dateObject),
      year: dateObject.getFullYear(),
      week: getWeekForLife(dateObject),
    };
    data.goals.push(goal);
  });
  return res.status(200).send(data);
};

module.exports = {
  getGoalsLife,
};
