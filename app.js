const express = require("express");
const app = express();
const ejs = require("ejs");

//set view engine
app.set("view engine", "ejs");
app.set("views", "./public/views");
app.engine("ejs", ejs.renderFile);

//public assets
app.use(express.static(__dirname + "/public"))

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//routes

app.get("/life", (req, res) => {
  res.render("life");
});

app.listen(3000, () => {
  console.log("server running on port 3000");
});
