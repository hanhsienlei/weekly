const express = require("express");
const app = express();
const ejs = require("ejs");

//set view engine
app.set("view engine", "ejs");
app.set("views", "./public/views");
app.engine("ejs", ejs.renderFile);

//Front-end public assets
app.use(express.static(__dirname + "/public"))

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//routes

app.get("/life", (req, res) => {
  res.render("life");
});

app.get("/horizon", (req, res) => {
  res.render("horizon");
});
app.get("/dashboard/goal", (req, res) => {
  res.render("dashboard_goal");
});

app.get("/library", (req, res) => {
  res.render("goal_library");
});

//api routes
app.use("/api",[
  require("./server/routes/api/goal_route"),
  require("./server/routes/api/milestone_route"),
  require("./server/routes/api/task_route"),
  require("./server/routes/api/events_route")
]
  
)

//error handler
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(500).send('Internal Server Error');
});

app.listen(3000, () => {
  console.log("server running on port 3000");
});
