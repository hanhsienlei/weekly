const assert = require("chai").assert;
const { getWeekNumberByDate } = require("../utils/date_converter");

describe("getWeekNumberByDate", () => {
  it("An ordinary date", () => {
    let date = new Date(2021, 10, 26);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2021);
    assert.equal(result.weekNumber, 47);
  });
  it("1/1 one week 52", () => {
    let date = new Date(2022, 0, 1);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2021);
    assert.equal(result.weekNumber, 52);
  });
  it("12/31 on week 1", () => {
    let date = new Date(2024, 11, 31);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2025);
    assert.equal(result.weekNumber, 1);
  });

  it("12/27 sunday on week 52", () => {
    let date = new Date(2009, 11, 27);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2009);
    assert.equal(result.weekNumber, 52);
  });
  it("12/28 monday on week 53", () => {
    let date = new Date(2009, 11, 28);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2009);
    assert.equal(result.weekNumber, 53);
  });
  it("12/31 on week 53", () => {
    let date = new Date(2026, 11, 31);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2026);
    assert.equal(result.weekNumber, 53);
  });
  it("1/1 on week 53", () => {
    let date = new Date(2027, 0, 1);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2026);
    assert.equal(result.weekNumber, 53);
  });
  it("1/3 sunday on week 53", () => {
    let date = new Date(2010, 0, 3);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2009);
    assert.equal(result.weekNumber, 53);
  });
  it("1/4 monday on week 1", () => {
    let date = new Date(2010, 0, 4);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2010);
    assert.equal(result.weekNumber, 01);
  });
  it("A monday", () => {
    let date = new Date(2021, 11, 13);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2021);
    assert.equal(result.weekNumber, 50);
  });
  it("A sunday", () => {
    let date = new Date(2021, 11, 12);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2021);
    assert.equal(result.weekNumber, 49);
  });
  it("A tuesday", () => {
    let date = new Date(2010, 0, 12);
    let result = getWeekNumberByDate(date);
    assert.equal(result.year, 2010);
    assert.equal(result.weekNumber, 2);
  });
});
