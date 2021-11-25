const renderEvents = async (date) => {
  const accessToken = localStorage.getItem("access_token");
  fetch(`/api/events/${date}`, {
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      //titles and buttons to empty events containers
      const containers = ["date", "week", "month", "year"];
      containers.forEach((container) => {
        const title = document.querySelector(`.${container}-value`);
        const beforeButton = document.querySelector(`.${container}-before`);
        const afterButton = document.querySelector(`.${container}-after`);
        const beforeKey = `${container}Before`;
        const afterKey = `${container}After`;
        const dateBefore = data.buttonsDate[beforeKey];
        const dateAfter = data.buttonsDate[afterKey];
        const subTitle = document.querySelector(`.${container}-sub-title`);
        const eventsContainer = document.querySelector(
          `.${container}-events-container`
        );

        title.setAttribute("data-due-date", data[container].dueDate);

        title.textContent = data[container].value;
        beforeButton.setAttribute("onclick", `renderEvents('${dateBefore}')`);
        afterButton.setAttribute("onclick", `renderEvents('${dateAfter}')`);
        if (container === "date") {
          subTitle.textContent = data[container].weekDay;
        } else {
          const startDate = data[container].startDate
            ? data[container].startDate.split("-")[1] +
              "-" +
              data[container].startDate.split("-")[2]
            : null;
          const endDate = data[container].dueDate
            ? data[container].dueDate.split("-")[1] +
              "-" +
              data[container].dueDate.split("-")[2]
            : null;
          subTitle.textContent = startDate + " ~ " + endDate;
        }

        eventsContainer.setAttribute("data-due-date", data[container].dueDate);
        eventsContainer.setAttribute(
          "data-start-date",
          data[container].startDate
        );
        eventsContainer.innerHTML = "";
        if (container === "week") {
          title.textContent = "Week " + data[container].value;
        }
      });

      //add events
      if (data.date.tasks) {
        data.date.goals.forEach((goal) => {
          if (goal.goalStatus > -1) {
            createEventComponent(
              "date",
              "goal",
              goal.goalId,
              goal.goalTitle,
              goal.goalStatus,
              goal.goalDueDate,
              goal.goalDescription,
              null,
              null,
              null,
              null,
              null,
              goal.goalId,
              null,
              goal.goalCategory,
              null,
              null
            );
          }
        });
        data.date.milestones.forEach((milestone) => {
          if (milestone.milestoneStatus > -1) {
            createEventComponent(
              "date",
              "milestone",
              milestone.milestoneId,
              milestone.milestoneTitle,
              milestone.milestoneStatus,
              milestone.milestoneDueDate,
              milestone.milestoneDescription,
              milestone.milestoneParent.join("．"),
              null,
              null,
              null,
              null,
              milestone.goalId,
              milestone.goalDueDate,
              milestone.goalCategory,
              null,
              null
            );
          }
        });
        data.date.tasks.forEach((task) => {
          let repeatedFrequency = task.taskRepeat ? task.repeatFrequency : 0;
          const taskParents = task.taskParent
            ? task.taskParent.join("．")
            : null;
          if (!task.taskId) {
            repeatedFrequency = task.repeatFrequency;
          }

          if (task.taskStatus > -1) {
            createEventComponent(
              "date",
              "task",
              task.taskId,
              task.taskTitle,
              task.taskStatus,
              task.taskDueDate,
              task.taskDescription,
              taskParents,
              repeatedFrequency,
              task.repeatEndDate,
              task.milestoneId,
              task.milestoneDueDate,
              task.goalId,
              task.goalDueDate,
              task.goalCategory,
              task.taskOriginId,
              task.taskOriginDate
            );
          }
        });
      }

      if (data.week.tasks) {
        data.week.goals.forEach((goal) => {
          if (goal.goalStatus > -1) {
            createEventComponent(
              "week",
              "goal",
              goal.goalId,
              goal.goalTitle,
              goal.goalStatus,
              goal.goalDueDate,
              goal.goalDescription,
              null,
              null,
              null,
              null,
              null,
              goal.goalId,
              null,
              goal.goalCategory,
              null,
              null
            );
          }
        });
        data.week.milestones.forEach((milestone) => {
          if (milestone.milestoneStatus > -1) {
            createEventComponent(
              "week",
              "milestone",
              milestone.milestoneId,
              milestone.milestoneTitle,
              milestone.milestoneStatus,
              milestone.milestoneDueDate,
              milestone.milestoneDescription,
              milestone.milestoneParent.join("．"),
              null,
              null,
              null,
              null,
              milestone.goalId,
              milestone.goalDueDate,
              milestone.goalCategory,
              null,
              null
            );
          }
        });
        data.week.tasks.forEach((task) => {
          if (task.taskStatus > -1) {
            const repeatedFrequency = task.taskRepeat
              ? task.repeatfrequency
              : 0;
            const taskParents = task.taskParent
              ? task.taskParent.join("．")
              : null;
            if (task.taskId) {
              createEventComponent(
                "week",
                "task",
                task.taskId,
                task.taskTitle,
                task.taskStatus,
                task.taskDueDate,
                task.taskDescription,
                taskParents,
                repeatedFrequency,
                task.repeatEndDate,
                task.milestoneId,
                task.milestoneDueDate,
                task.goalId,
                task.goalDueDate,
                task.goalCategory,
                task.taskOriginId,
                task.taskOriginDate
              );
            }
          }
        });
      }

      if (data.month.tasks) {
        data.month.goals.forEach((goal) => {
          if (goal.goalStatus > -1) {
            createEventComponent(
              "month",
              "goal",
              goal.goalId,
              goal.goalTitle,
              goal.goalStatus,
              goal.goalDueDate,
              goal.goalDescription,
              null,
              null,
              null,
              null,
              null,
              goal.goalId,
              null,
              goal.goalCategory,
              null,
              null
            );
          }
        });
        data.month.milestones.forEach((milestone) => {
          if (milestone.milestoneStatus > -1) {
            createEventComponent(
              "month",
              "milestone",
              milestone.milestoneId,
              milestone.milestoneTitle,
              milestone.milestoneStatus,
              milestone.milestoneDueDate,
              milestone.milestoneDescription,
              milestone.milestoneParent.join("．"),
              null,
              null,
              null,
              null,
              milestone.goalId,
              milestone.goalDueDate,
              milestone.goalCategory,
              null,
              null
            );
          }
        });
        data.month.tasks.forEach((task) => {
          if (task.taskStatus > -1) {
            const repeatedFrequency = task.taskRepeat
              ? task.repeatfrequency
              : 0;
            const taskParents = task.taskParent
              ? task.taskParent.join("．")
              : null;
            if (task.taskId) {
              createEventComponent(
                "month",
                "task",
                task.taskId,
                task.taskTitle,
                task.taskStatus,
                task.taskDueDate,
                task.taskDescription,
                taskParents,
                repeatedFrequency,
                task.repeatEndDate,
                task.milestoneId,
                task.milestoneDueDate,
                task.goalId,
                task.goalDueDate,
                task.goalCategory,
                task.taskOriginId,
                task.taskOriginDate
              );
            }
          }
        });
      }

      if (data.year.tasks) {
        data.year.goals.forEach((goal) => {
          if (goal.goalStatus > -1) {
            createEventComponent(
              "year",
              "goal",
              goal.goalId,
              goal.goalTitle,
              goal.goalStatus,
              goal.goalDueDate,
              goal.goalDescription,
              null,
              null,
              null,
              null,
              null,
              goal.goalId,
              null,
              goal.goalCategory,
              null,
              null
            );
          }
        });
        data.year.milestones.forEach((milestone) => {
          if (milestone.milestoneStatus > -1) {
            createEventComponent(
              "year",
              "milestone",
              milestone.milestoneId,
              milestone.milestoneTitle,
              milestone.milestoneStatus,
              milestone.milestoneDueDate,
              milestone.milestoneDescription,
              milestone.milestoneParent.join("．"),
              null,
              null,
              null,
              null,
              milestone.goalId,
              milestone.goalDueDate,
              milestone.goalCategory,
              null,
              null
            );
          }
        });
        data.year.tasks.forEach((task) => {
          if (task.taskStatus > -1) {
            const repeatedFrequency = task.taskRepeat
              ? task.repeatFrequency
              : 0;
            const taskParents = task.taskParent
              ? task.taskParent.join("．")
              : null;
            if (task.taskId) {
              createEventComponent(
                "year",
                "task",
                task.taskId,
                task.taskTitle,
                task.taskStatus,
                task.taskDueDate,
                task.taskDescription,
                taskParents,
                repeatedFrequency,
                task.repeatEndDate,
                task.milestoneId,
                task.milestoneDueDate,
                task.goalId,
                task.goalDueDate,
                task.goalCategory,
                task.taskOriginId,
                task.taskOriginDate
              );
            }
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const addNewEvent = (timeScale, eventType) => {
  const accessToken = localStorage.getItem("access_token");
  const input = document.querySelector(`.${timeScale}-new-${eventType}-title`);
  const title = input.value.trim();
  const dueDate = document.querySelector(`.${timeScale}-value`).dataset.dueDate;
  const body = {};
  body[`${eventType}Title`] = title;
  body[`${eventType}DueDate`] = dueDate;

  if (!title) {
    Swal.fire({
      icon: "warning",
      title: `Please name the ${eventType} before adding!`,
    });
    return;
  }
  fetch(`/api/${eventType}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        Swal.fire({
          icon: "warning",
          title: data.error,
          showConfirmButton: false,
        });
      } else {
        const eventContainer = document.querySelector(
          `.${timeScale}-events-container`
        );
        const eventId = data.taskId || data.goalId;

        if (data.taskId) {
          //沒有goal button
          createEventComponent(
            timeScale,
            eventType,
            eventId,
            title,
            null,
            dueDate,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          );
        } else {
          //有goal button
          createEventComponent(
            timeScale,
            eventType,
            eventId,
            title,
            null,
            dueDate,
            null,
            "goal",
            null,
            null,
            null,
            null,
            eventId,
            dueDate,
            0,
            null,
            null
          );
        }
        eventContainer.scrollTop = eventContainer.scrollHeight;
        input.value = "";
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const createViewGoalButton = (goalId) => {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-outline-primary", "edit-goal-button");
  button.setAttribute("type", "button");
  button.setAttribute("data-bs-toggle", "modal");
  button.setAttribute("data-bs-target", "#modal-goal");
  button.setAttribute("onclick", `renderGoalEditor(${goalId})`);
  button.textContent = "view goal";
  return button;
};

const createDeleteGoalButton = (goalId) => {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  // button.setAttribute("data-bs-toggle", "modal");
  // button.setAttribute("data-bs-target", "#deleteGoalModal");
  button.classList.add("btn", "btn-outline-danger", "col-6");
  button.textContent = "delete";

  button.addEventListener("click", (e) => {
    deleteGoalAndChildren(goalId);
  });

  return button;
};

const createDeleteMilestoneButton = (milestoneId, goalId) => {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  // button.setAttribute("data-bs-toggle", "modal");
  // button.setAttribute("data-bs-target", "#deleteMilestoneModal");
  button.classList.add("btn", "btn-outline-danger", "col-6");
  button.textContent = "delete";

  button.addEventListener("click", (e) => {
    deleteMilestoneAndChildren(milestoneId);
  });
  return button;
};

const createStopTodayButton = (
  originId,
  dueDate
) => {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.classList.add("btn", "btn-outline-warning");
  button.textContent = "stop repeating today";

  button.addEventListener("click", (e) => {
    const apiEndpoint = `/api/repeated-task/stop?task_origin_id=${originId}&task_repeat_end_date=${dueDate}`;
    fetch(apiEndpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {

        if (data.error) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.error,
          });
          return;
        }
        Swal.fire({
          icon: "success",
          title: "All good",
          text: "this task will no longer repeat. Other older or edited tasks from this series remain the same.",
          showConfirmButton: false,
        });
        const currentDate =
          document.querySelector(".date-value").dataset.dueDate;
        renderEvents(currentDate);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  return button;
};

const renderEventsToday = () => {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString();
  const month2Digit = month.length === 1 ? `0${month}` : month;
  const date = today.getDate().toString();
  const date2Digit = date.length === 1 ? `0${date}` : date;
  const todayYMD = `${year}-${month2Digit}-${date2Digit}`;
  renderEvents(todayYMD);
};

//triggered whenever page is opened
getUser();
document.onload = renderEventsToday();

$("#modal-goal").on("hidden.bs.modal", () => {
  // console.log("listen!");
  const currentDate = document.querySelector(".date-value").dataset.dueDate;
  renderEvents(currentDate);
});

document
  .querySelector(".date-new-task-title")
  .addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      document.querySelector(".date-add-new-task").click();
    }
  });

document
  .querySelector(".week-new-task-title")
  .addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      document.querySelector(".week-add-new-task").click();
    }
  });

document
  .querySelector(".month-new-task-title")
  .addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      document.querySelector(".month-add-new-task").click();
    }
  });

document
  .querySelector(".year-new-goal-title")
  .addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      document.querySelector(".year-add-new-goal").click();
    }
  });
