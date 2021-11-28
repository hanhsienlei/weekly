const express = require("express");
const app = express();
require("dotenv").config();
const { PORT } = process.env;
const ejs = require("ejs");

app.set("view engine", "ejs");
app.set("views", "./public/views");
app.engine("ejs", ejs.renderFile);
app.use(express.static(__dirname + "/public"))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/", require("./server/routes/pages_route"))
app.use("/api",[
  require("./server/routes/api/goal_route"),
  require("./server/routes/api/milestone_route"),
  require("./server/routes/api/task_route"),
  require("./server/routes/api/events_route"),
  require("./server/routes/api/repeated_task_route"),
  require("./server/routes/api/life_route"),
  require("./server/routes/api/user_route")
])

// Page not found
app.use(function(req, res, next) {
    res.status(404).render("not_found");
});

//error handler
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});


module.exports = app