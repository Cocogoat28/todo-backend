// index.js 
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  
  "mongodb+srv://cocogoat_28:W1oUA8O0hvkovBDc@cluster0.wxeddfi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);


const taskSchema = {
  name: {
    type: String,
    required: true
  }
};

const Task = mongoose.model("Task", taskSchema);

app.set("view engine", "ejs");

// GET route
app.get("/", async (req, res) => {
  try {
    let today = new Date();
    let options = { weekday: "long", day: "numeric", month: "long" };
    let day = today.toLocaleDateString("en-US", options);

    const foundTasks = await Task.find({});
    res.render("index", { today: day, tasks: foundTasks });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST route for adding task
app.post("/", async (req, res) => {
  const taskName = req.body.newTask;
  if (taskName) {
    const task = new Task({ name: taskName });
    try {
      await task.save();
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).send("Could not save task");
    }
  } else {
    res.redirect("/");
  }
});

// POST route for deleting task
app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  try {
    await Task.findByIdAndDelete(checkedItemId);
    console.log("Successfully deleted checked item.");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not delete task");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running at port 3000");
});