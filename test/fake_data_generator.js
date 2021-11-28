require("dotenv").config();
const { NODE_ENV } = process.env;
const bcrypt = require("bcrypt");
const {
  users,
  goals,
  milestones,
  tasks,
  repeatedTasks,
} = require("./fake_data");
const { pool } = require("../server/models/config_mysql");
const salt = parseInt(process.env.BCRYPT_SALT);

const _createFakeUsers = async (conn) => {
  const encrypted_users = users.map((user) => {
    const encrypted_user = {
      provider: user.provider,
      role_id: user.role_id,
      email: user.email,
      password: user.password ? bcrypt.hashSync(user.password, salt) : null,
      name: user.name,
      birthday: user.birthday,
      access_token: user.access_token,
      access_expired: user.access_expired,
      login_at: user.login_at,
    };
    return encrypted_user;
  });
  return await conn.query(
    "INSERT INTO user (provider, role_id, email, password, name, birthday, access_token, access_expired, login_at) VALUES ?",
    [encrypted_users.map((x) => Object.values(x))]
  );
};

const _createFakeGoals = async (conn) => {
  return await conn.query("INSERT INTO goal SET ?", goals);
};

const _createFakeMilestones = async (conn) => {
  return await conn.query("INSERT INTO milestone SET ?", milestones);
};

const _createFakeTasks = async (conn) => {
  return await conn.query("INSERT INTO task SET ?", tasks);
};

const _createFakeRepeatedTasks = async (conn) => {
  return await conn.query("INSERT INTO repeated_task SET ?", repeatedTasks);
};

const createFakeData = async () => {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  const conn = await pool.getConnection();
  await conn.query("START TRANSACTION");
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
  await _createFakeUsers(conn);
  await _createFakeGoals(conn);
  await _createFakeMilestones(conn);
  await _createFakeTasks(conn);
  await _createFakeRepeatedTasks(conn);
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
  await conn.query("COMMIT");
  await conn.release();
};

const truncateFakeData = async () => {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  const tables = ["user", "goal", "milestone", "task", "repeated_task"];

  const truncateTable = async (table) => {
    const conn = await pool.getConnection();
    await conn.query("START TRANSACTION");
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
    await conn.query(`TRUNCATE TABLE ${table}`);
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
    await conn.query("COMMIT");
    await conn.release();
    return;
  };

  for (let table of tables) {
    await truncateTable(table);
  }

  return;
};

const closeConnection = async () => {
  return await pool.end();
};

const main = async () => {
  await truncateFakeData();
  await createFakeData();
  await closeConnection();
};

// execute when called directly.
if (require.main === module) {
  main();
}

module.exports = {
  createFakeData,
  truncateFakeData,
  closeConnection,
};
