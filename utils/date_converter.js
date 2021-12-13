const monthLengthList = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

//return YYYY-MM-DD in local timezone
const getDateYMD = (dateObject) => {
  const year = dateObject.getFullYear().toString();
  const month = (dateObject.getMonth() + 1).toString();
  const month2Digit = month.length === 1 ? `0${month}` : month;
  const date = dateObject.getDate().toString();
  const date2Digit = date.length === 1 ? `0${date}` : date;
  return `${year}-${month2Digit}-${date2Digit}`;
};

//return date object in local timezone
const getDateObjectFromYMD = (YMD) => {
  const year = Number(YMD.split("-")[0]);
  let monthIndex = Number(YMD.split("-")[1]) - 1;
  const date = Number(YMD.split("-")[2]);
  return new Date(year, monthIndex, date);
};

//return date object
const getSundayByDate = (dateObject) => {
  const day = dateObject.getDay();
  const dateValue = dateObject.valueOf();
  const SundayValue = day
    ? dateValue + (7 - day) * (60 * 60 * 24 * 1000)
    : dateValue;
  const sunday = new Date(SundayValue);
  return sunday;
};

//return {year: YYYY, weekNumber: WW}
const getWeekNumberByDate = (dateObject) => {
  // week number guideline: ISO 8601
  const jan01 = new Date(dateObject.getFullYear(), 0, 1);
  //step 1. get week day offset of Jan01
  const jan01DaysFromMonday = (jan01.getDay() + 6) % 7;
  const dec31 = new Date(dateObject.getFullYear(), 11, 31);
  const DaysOfYear =
    Math.round(
      (dateObject.valueOf() - jan01.valueOf()) / (60 * 60 * 24 * 1000)
    ) + 1;
  let year = dateObject.getFullYear();
  //step 2. get week number
  let weekNumber = Math.ceil((DaysOfYear + jan01DaysFromMonday) / 7);
  //step 3. correct week number based on Jan01 weekday
  if (jan01.getDay() > 4 || jan01.getDay() === 0) {
    weekNumber = weekNumber - 1;
  }
  //step 4. correct week 0 and week 53
  if (weekNumber === 0) {
    weekNumber = getWeekCountByYear(dateObject.getFullYear() - 1);
    year = dateObject.getFullYear() - 1;
  } else if (weekNumber === 53 && dec31.getDay() >= 1 && dec31.getDay() <= 3) {
    weekNumber = 1;
    year = dateObject.getFullYear() + 1;
  }
  return { year, weekNumber };
};

//return number
const getWeekCountByYear = (year) => {
  const jan01 = new Date(year, 0, 1);
  const jan01DaysFromMonday = (jan01.getDay() + 6) % 7;
  const dec31 = new Date(year, 11, 31);
  const dayCount = (dec31.valueOf() - jan01.valueOf()) / (60 * 60 * 24 * 1000);
  let weekCount = 0;
  if (jan01.getDay() > 4 || jan01.getDay() === 0) {
    weekCount = Math.ceil((dayCount + jan01DaysFromMonday) / 7) - 1;
  } else {
    weekCount = Math.ceil((dayCount + jan01DaysFromMonday) / 7);
  }
  if ((weekCount === 53) & (dec31.getDay() >= 1) && dec31.getDay() <= 3) {
    weekCount = 52;
  }
  return weekCount;
};

//return date object
const getMonthEndByDate = (dateObject) => {
  const monthIndex = dateObject.getMonth();
  const year = dateObject.getFullYear();
  if (monthIndex === 11) {
    const YearEnd = new Date(year, 11, 31);
    return YearEnd;
  } else {
    const NextMonth01 = new Date(year, monthIndex + 1, 01);
    const monthEndDate = new Date(NextMonth01.valueOf() - 60 * 60 * 24 * 1000);
    return monthEndDate;
  }
};

//return date object
const getNextMonthThisDay = (dateObject) => {
  const year = dateObject.getFullYear();
  const monthIndex = dateObject.getMonth();
  const date = dateObject.getDate();
  let monthIndexNew = monthIndex + 1;
  let yearNew = 0;
  let dateNew = 0;
  if (monthIndexNew > 11) {
    monthIndexNew = 0;
    yearNew = year + 1;
  } else {
    yearNew = year;
  }
  if (date > monthLengthList[monthIndexNew]) {
    dateNew = monthLengthList[monthIndexNew];
    const feb29 = new Date(yearNew, 1, 29);
    if (monthIndexNew == 1 && dateNew == 29 && feb29.getDate() != 29) {
      dateNew = 28;
    }
  } else {
    dateNew = date;
  }
  return new Date(yearNew, monthIndexNew, dateNew);
};

//return date object
const getPreviousMonthThisDay = (dateObject) => {
  const year = dateObject.getFullYear();
  const monthIndex = dateObject.getMonth();
  const date = dateObject.getDate();
  let monthIndexNew = monthIndex - 1;
  let yearNew = 0;
  let dateNew = 0;
  if (monthIndexNew < 0) {
    monthIndexNew = 11;
    yearNew = year - 1;
  } else {
    yearNew = year;
  }
  if (date > monthLengthList[monthIndexNew]) {
    dateNew = monthLengthList[monthIndexNew];
    const feb29 = new Date(yearNew, 1, 29);
    if (monthIndexNew == 1 && dateNew == 29 && feb29.getDate() != 29) {
      dateNew = 28;
    }
  } else {
    dateNew = date;
  }
  return new Date(yearNew, monthIndexNew, dateNew);
};

//return date object
const getNextYearThisDay = (dateObject) => {
  const year = dateObject.getFullYear();
  const monthIndex = dateObject.getMonth();
  const date = dateObject.getDate();
  let monthIndexNew = monthIndex;
  let yearNew = year + 1;
  let dateNew = date;
  const feb29 = new Date(yearNew, 1, 29);
  if (monthIndexNew == 1 && dateNew == 29 && feb29.getDate() != 29) {
    dateNew = 28;
  }
  return new Date(yearNew, monthIndexNew, dateNew);
};

//return date object
const getPreviousYearThisDay = (dateObject) => {
  const year = dateObject.getFullYear();
  const monthIndex = dateObject.getMonth();
  const date = dateObject.getDate();
  let monthIndexNew = monthIndex;
  let yearNew = year - 1;
  let dateNew = date;
  const feb29 = new Date(yearNew, 1, 29);
  if (monthIndexNew == 1 && dateNew == 29 && feb29.getDate() != 29) {
    dateNew = 28;
  }
  return new Date(yearNew, monthIndexNew, dateNew);
};

//return date object
const getUserByeDay = (birthdayObject) => {
  const userByeYear = birthdayObject.getFullYear() + 80;
  const userByeMonthIndex = birthdayObject.getMonth();
  const userByeDate = birthdayObject.getDate();
  const userByeDay = new Date(userByeYear, userByeMonthIndex, userByeDate);
  return userByeDay;
};

module.exports = {
  getDateYMD,
  getSundayByDate,
  getWeekNumberByDate,
  getWeekCountByYear,
  getMonthEndByDate,
  getDateObjectFromYMD,
  getNextMonthThisDay,
  getPreviousMonthThisDay,
  getNextYearThisDay,
  getPreviousYearThisDay,
  getUserByeDay,
};
