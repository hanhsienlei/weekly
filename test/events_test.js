require("dotenv");
const { expect, requester } = require("./set_up");
const { users } = require("./fake_data");

const user1 = users[0];
const user = {
  provider: user1.provider,
  email: user1.email,
  password: user1.password,
};
let accessToken;
const getEventIds = (events) => {
  const results = { tasks: [], milestones: [], goals: [] };
  if (events.tasks.length > 0) {
    events.tasks.forEach((task) => {
      results.tasks.push(task.taskId);
    });
  }

  if (events.milestones.length > 0) {
    events.milestones.forEach((milestone) => {
      results.milestones.push(milestone.milestoneId);
    });
  }

  if (events.goals.length > 0) {
    events.goals.forEach((goal) => {
      results.goals.push(goal.goalId);
    });
  }

  return results;
};

describe("Events", async () => {
  before(async () => {
    const res = await requester.post("/api/user/signin").send(user);
    accessToken = res.body.data.accessToken;
  });

  it("Show all events on 2022/10/31 for dates and events", async () => {
    const res = await requester
      .get("/api/events/2022-10-31")
      .set({ Authorization: `Bearer ${accessToken}` });
    const data = res.body;

    const dateEventIds = getEventIds(data.date);
    const weekEventIds = getEventIds(data.week);
    const monthEventIds = getEventIds(data.month);
    const yearEventIds = getEventIds(data.year);

    const buttonsDateExpected = {
      dateBefore: "2022-10-30",
      dateAfter: "2022-11-01",
      weekBefore: "2022-10-24",
      weekAfter: "2022-11-07",
      monthBefore: "2022-09-30",
      monthAfter: "2022-11-30",
      yearBefore: "2021-10-31",
      yearAfter: "2023-10-31",
    };

    const dateEventIdsExpected = {
      tasks: [1, 2, 4, 5],
      milestones: [],
      goals: [],
    };

    const weekEventIdsExpected = { tasks: [3], milestones: [], goals: [] };
    const monthEventIdsExpected = { tasks: [], milestones: [], goals: [] };
    const yearEventIdsExpected = {
      tasks: [],
      milestones: [1, 2, 4, 5],
      goals: [1, 2],
    };

    expect(data.buttonsDate).to.deep.equalInAnyOrder(buttonsDateExpected);
    expect(dateEventIds).to.deep.equalInAnyOrder(dateEventIdsExpected);
    expect(weekEventIds).to.deep.equalInAnyOrder(weekEventIdsExpected);
    expect(monthEventIds).to.deep.equalInAnyOrder(monthEventIdsExpected);
    expect(yearEventIds).to.deep.equalInAnyOrder(yearEventIdsExpected);
  });
  it("Show all events on 2022/11/01 for repeated tasks", async () => {
    const res = await requester
      .get("/api/events/2022-11-01")
      .set({ Authorization: `Bearer ${accessToken}` });
    const data = res.body;

    const dateEventIds = getEventIds(data.date);
    const weekEventIds = getEventIds(data.week);
    const monthEventIds = getEventIds(data.month);
    const yearEventIds = getEventIds(data.year);

    const dateEventIdsExpected = {
      tasks: [],
      milestones: [],
      goals: [],
    };

    const weekEventIdsExpected = { tasks: [3], milestones: [], goals: [] };
    const monthEventIdsExpected = { tasks: [], milestones: [1, 2, 4, 5], goals: [] };
    const yearEventIdsExpected = {
      tasks: [],
      milestones: [],
      goals: [1, 2],
    };

    expect(dateEventIds).to.deep.equalInAnyOrder(dateEventIdsExpected);
    expect(weekEventIds).to.deep.equalInAnyOrder(weekEventIdsExpected);
    expect(monthEventIds).to.deep.equalInAnyOrder(monthEventIdsExpected);
    expect(yearEventIds).to.deep.equalInAnyOrder(yearEventIdsExpected);
  });
  it("Show all events on 2022/11/02 for rescheduled repeated tasks", async () => {
    const res = await requester
      .get("/api/events/2022-11-02")
      .set({ Authorization: `Bearer ${accessToken}` });
    const data = res.body;

    const dateEventIds = getEventIds(data.date);
    const weekEventIds = getEventIds(data.week);
    const monthEventIds = getEventIds(data.month);
    const yearEventIds = getEventIds(data.year);

    const dateEventIdsExpected = {
      tasks: [3, null],
      milestones: [],
      goals: [],
    };

    const weekEventIdsExpected = { tasks: [], milestones: [], goals: [] };
    const monthEventIdsExpected = { tasks: [], milestones: [1, 2, 4, 5], goals: [] };
    const yearEventIdsExpected = {
      tasks: [],
      milestones: [],
      goals: [1, 2],
    };

    expect(dateEventIds).to.deep.equalInAnyOrder(dateEventIdsExpected);
    expect(weekEventIds).to.deep.equalInAnyOrder(weekEventIdsExpected);
    expect(monthEventIds).to.deep.equalInAnyOrder(monthEventIdsExpected);
    expect(yearEventIds).to.deep.equalInAnyOrder(yearEventIdsExpected);
  });
});
