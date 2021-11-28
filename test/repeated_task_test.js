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

describe("Repeated tasks", async () => {
  before(async () => {
    const res = await requester.post("/api/user/signin").send(user);
    accessToken = res.body.data.accessToken;
  });

  it("Save new repeated tasks", async () => {
    const body = {
      taskOriginId: 1,
      taskTitle: "test save new repeated task ",
      taskDescription: "",
      taskDueDate: "2022-11-03",
      taskOriginDate: "2022-11-03",
      status: 0,
    };
    const res = await requester
      .post("/api/repeated-task/new")
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(body);

    expect(res.statusCode).to.equal(200);
  });

  it("Save new repeated tasks with existing origin date", async () => {
    const body = {
      taskOriginId: 1,
      taskTitle: "test save new repeated task ",
      taskDescription: "",
      taskDueDate: "2022-11-01",
      taskOriginDate: "2022-11-01",
      status: 0,
    };
    const res = await requester
      .post("/api/repeated-task/new")
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(body);

    expect(res.statusCode).to.equal(400);
  });

  it("Delete new repeated tasks", async () => {
    const res = await requester
      .delete("/api/repeated-task/new?task_origin_id=1&task_origin_date=2022-11-04")
      .set({ Authorization: `Bearer ${accessToken}` })
      

    expect(res.statusCode).to.equal(200);
  });

  it("Update saved repeated tasks with invalid due date", async () => {
    const body = {
      taskId:3,
      taskTitle: "test update saved repeated task ",
      taskDescription: "",
      taskDueDate: "2022-12-03",
      status: 0,
    };
    const res = await requester
      .post("/api/repeated-task/saved")
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(body);

    expect(res.statusCode).to.equal(400);
  });

  it("Update tasks with invalid repeat end date", async () => {
    const body = {
      taskId: 4,
      taskTitle: "test save new repeated task ",
      taskDescription: "",
      taskDueDate: "2022-11-03",
      taskRepeat: 1,
      taskRepeatFrequency: 1,
      taskRepeatEndDate: "2022-12-31",
      status: 0,
    };
    const res = await requester
      .post("/api/task")
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(body);

    expect(res.statusCode).to.equal(400);
  });
});
