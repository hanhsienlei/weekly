//return YYYY-MM-DD
const getDateYMD = (dateObject) => {
  const year = dateObject.getFullYear().toString();
  const month = (dateObject.getMonth() + 1).toString();
  const date = dateObject.getDate().toString();
  return `${year}-${month}-${date}`;
};

//return date object
const getDateObjectFromYMD = (YMD) => {
  const year = YMD.split("-")[0]
  let monthIndex = YMD.split("-")[1] -1 
  const date = YMD.split("-")[2]
  return new Date( year, monthIndex, date)
}

//return date object
const getSundayByDate = (dateObject) => {
  //Returns the day of the week (Sunday - Saturday : 0 - 6) for the specified date according to local time.
  const day = dateObject.getDay();
  //The number of milliseconds between 1 January 1970 00:00:00 UTC and the given date.
  const dateValue = dateObject.valueOf();
  const SundayValue = day
    ? dateValue + (7 - day) * (60 * 60 * 24 * 1000)
    : dateValue;
  const sunday = new Date(SundayValue);
  return sunday
};

//return {year: YYYY, weekNumber: WW}
const getWeekNumberByDate = (dateObject) => {
  // ISO 8601:
  // 1/4一定是w01(有第一個週四)，1/1,2,3可能是去年的w52 or w53
  // 12/28一定是w52 or w53 （有最後一個週四），12/29,30,31可能是明年的w01
  const jan01 = new Date(dateObject.getFullYear(), 0, 1);
  const jan01DaysFromMonday = (jan01.getDay() + 6) % 7;
  const dec31 = new Date(dateObject.getFullYear(), 11, 31);
  const daysFromJan01 =
    (dateObject.valueOf() - jan01.valueOf()) / (60 * 60 * 24 * 1000);
  let year = 0;
  let weekNumber = 0;
  //step 1. 依1/1校正得週數
  if (jan01.getDay() > 4 || jan01.getDay() === 0) {
    //1/1是去年最後一週
    weekNumber = Math.ceil((daysFromJan01 + jan01DaysFromMonday) / 7) - 1;
    year = dateObject.getFullYear();
  } else {
    //1/1是今年第一週
    weekNumber = Math.ceil((daysFromJan01 + jan01DaysFromMonday) / 7);
    year = dateObject.getFullYear();
  }
  //step 2. 修正第0週跟第53週
  if (weekNumber === 0) {
    //週數為0的話，找去年最後一週是52還是53
    weekNumber = getWeekCountByYear(dateObject.getFullYear() - 1);
    year = dateObject.getFullYear() - 1;
  } else if (weekNumber === 53 && dec31.getDay() >= 1 && dec31.getDay() <= 3) {
    //週數為53的話，決定週數是w53還是明年的w01
    //12/31是週一二三的話，w53應是下一年w01
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
    //1/1是去年最後一週
    weekCount = Math.ceil((dayCount + jan01DaysFromMonday) / 7) - 1;
  } else {
    //1/1是此年第一週
    weekCount = Math.ceil((dayCount + jan01DaysFromMonday) / 7);
  }
  //週數為53的且12/31是週一二三的話，w53應是下一年w01
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
    dateObject.setDate(31);
    return dateObject;
  } else {
    const NextMonth01 = new Date(year, monthIndex + 1, 01);
    const monthEndDate = new Date(NextMonth01.valueOf() - 60 * 60 * 24 * 1000);
    return monthEndDate;
  }
};

//return date object
const getNextMonthThisDay = (dateObject) => {
  const year = dateObject.getFullYear()
  const monthIndex = dateObject.getMonth()
  const date = dateObject.getDate()
  const monthLengthList = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ]
  
  //1. 先月 +1 
  let monthIndexNew = monthIndex + 1
  let yearNew = 0
  let dateNew = 0
  if (monthIndexNew > 11){
    //跨年的話，變明年1月
    monthIndexNew = 0
    yearNew = year + 1
  } else {
    yearNew = year
  }
  //2. 校正日：31日不存在的話改成當月最後一日，2月有29號的話，改成29
  if ( date > monthLengthList[monthIndexNew] ){
    dateNew = monthLengthList[monthIndexNew]
    const feb29 = new Date(yearNew, 1, 29)
    if (monthIndexNew == 1 && dateNew == 29 && feb29.getDate() != 29){
      dateNew = 28
    }
  } else {
    dateNew = date
  }
  return new Date(yearNew, monthIndexNew, dateNew)
}
//return date object
const getPreviousMonthThisDay = (dateObject) => {
  const year = dateObject.getFullYear()
  const monthIndex = dateObject.getMonth()
  const date = dateObject.getDate()
  const monthLengthList = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ]
  
  //1. 先月 -1 
  let monthIndexNew = monthIndex - 1
  let yearNew = 0
  let dateNew = 0
  if (monthIndexNew < 0){
    //跨年的話，變去年12月
    monthIndexNew = 11
    yearNew = year - 1
  } else {
    yearNew = year
  }
  //2. 校正日：31日不存在的話改成當月最後一日，2月有29號的話，改成29
  if ( date > monthLengthList[monthIndexNew] ){
    dateNew = monthLengthList[monthIndexNew]
    const feb29 = new Date(yearNew, 1, 29)
    if (monthIndexNew == 1 && dateNew == 29 && feb29.getDate() != 29){
      dateNew = 28
    }
  } else {
    dateNew = date
  }
  return new Date(yearNew, monthIndexNew, dateNew)
}

//return date object
const getNextYearThisDay = (dateObject) => {
  const year = dateObject.getFullYear()
  const monthIndex = dateObject.getMonth()
  const date = dateObject.getDate()
  
  //1. 先年 + 1 
  let monthIndexNew = monthIndex
  let yearNew = year + 1
  let dateNew = date
  
  //2. 校正2/29
  const feb29 = new Date(yearNew, 1, 29)
  if (monthIndexNew == 1 && dateNew == 29 && feb29.getDate() != 29){
    dateNew = 28
  }
  return new Date(yearNew, monthIndexNew, dateNew)
}

//return date object
const getPreviousYearThisDay = (dateObject) => {
  const year = dateObject.getFullYear()
  const monthIndex = dateObject.getMonth()
  const date = dateObject.getDate()
  
  //1. 先年 -1 
  let monthIndexNew = monthIndex
  let yearNew = year - 1
  let dateNew = date
  
  //2. 校正2/29
  const feb29 = new Date(yearNew, 1, 29)
  if (monthIndexNew == 1 && dateNew == 29 && feb29.getDate() != 29){
    dateNew = 28
  }
  return new Date(yearNew, monthIndexNew, dateNew)
}

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
  getPreviousYearThisDay
};
