
//for goal editor
function saveGoal(goalId) {
  const modal = document.querySelector(`#modal-goal`);
  const goalTitle = modal.querySelector(".goal-title").textContent.trim();
  const goalDescription = modal.querySelector(".goal-description").value;
  const goalDueDate = modal.querySelector(".goal-due-date").value;
  const goalDueDateUnix = Math.ceil(new Date(goalDueDate + "T23:59:59"));
  //const select = goalModal.querySelector(".purpose-selector");
  //const option = select.options[select.selectedIndex];
  //const goalPurposeId = option.value;

  const body = {
    goal_id: goalId,
    goal_title: goalTitle,
    goal_due_date: goalDueDate,
    goal_due_date_unix: goalDueDateUnix,
    goal_description: goalDescription,
    //goal_purpose_id: goalPurposeId,
  };
  fetch("/api/goal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((err) => {
      console.log(err);
    });
}
//for goal editor
function saveMilestone(milestoneId, goalId) {
  const milestone = document.querySelector(`#milestone-details-${milestoneId}`);
  const milestoneTitle = milestone.querySelector("h5").textContent.trim();
  const milestoneDescription = milestone.querySelector("textarea").value;
  const milestoneDueDate = milestone.querySelector(".milestone-due-date").value;
  const milestoneDueDateUnix = Math.ceil(
    new Date(milestoneDueDate + "T23:59:59")
  );

  const body = {
    milestone_id: milestoneId,
    milestone_title: milestoneTitle,
    milestone_description: milestoneDescription,
    milestone_due_date: milestoneDueDate,
    milestone_due_date_unix: milestoneDueDateUnix,
    milestone_goal_id: goalId,
  };
  console.log(body);
  fetch("/api/milestone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((err) => {
      console.log(err);
    });
}
//for goal editor
function updateTask(taskId, MilestoneId) {
  const task = document.querySelector(`#task-details-${taskId}`);
  const taskTitle = task.querySelector("h6").textContent.trim();
  const taskDescription = task.querySelector("textarea").value;
  const taskDueDate = task.querySelector(".task-due-date").value;
  const taskDueDateUnix = Math.ceil(new Date(taskDueDate + "T23:59:59"));
  const body = {
    task_id: taskId,
    task_title: taskTitle,
    task_description: taskDescription,
    task_due_date: taskDueDate,
    task_due_date_unix: taskDueDateUnix,
    task_milestone_id: MilestoneId,
  };
  console.log(body);
  fetch("/api/task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((err) => {
      console.log(err);
    });
}

//for goal editor
function createMilestone() {
  const milestoneTitle = document.querySelector(".new-milestone-title").value;
  const milestoneDueDate = document.querySelector(".new-milestone-due-date");
  const milestoneDueDateUnix = Math.ceil(
    new Date(milestoneDueDate + "T23:59:59")
  );
  const milestoneGoalId = document.querySelector(".modal").dataset.goalId;
  const body = {
    milestone_title: milestoneTitle,
    milestone_due_date: milestoneDueDate,
    milestone_due_date_unix: milestoneDueDateUnix,
    milestone_goal_id: milestoneGoalId
  };

  fetch("/api/milestone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((err) => {
      console.log(err);
    });
}

//for goal editor
function getGoalWithPlan(goalId) {
  fetch(`/api/goal/plan?goal_id=${goalId}`)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((err) => {
      console.log(err);
    });
}

