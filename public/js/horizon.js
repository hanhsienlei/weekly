const renderEvents = async (date) => {
  const accessToken = localStorage.getItem("access_token");
  fetch(`/api/events/${date}`, {
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      //titles and buttons
      //empty events container
      const containers = ["date", "week", "month", "year"];
      containers.forEach((container) => {
        const title = document.querySelector(`.${container}-value`);
        const beforeButton = document.querySelector(`.${container}-before`);
        const afterButton = document.querySelector(`.${container}-after`);
        const beforeKey = `${container}_before`;
        const afterKey = `${container}_after`;
        const dateBefore = data.buttons_date[beforeKey];
        const dateAfter = data.buttons_date[afterKey];
        const subTitle = document.querySelector(`.${container}-sub-title`);
        const eventsContainer = document.querySelector(
          `.${container}-events-container`
        );

        title.setAttribute("data-due-date", data[container].due_date);

        title.textContent = data[container].value;
        beforeButton.setAttribute("onclick", `renderEvents('${dateBefore}')`);
        afterButton.setAttribute("onclick", `renderEvents('${dateAfter}')`);
        if (container === "date") {
          subTitle.textContent = data[container].week_day;
        } else {
          const startDate = data[container].start_date
            ? data[container].start_date.split("-")[1] +
              "-" +
              data[container].start_date.split("-")[2]
            : null;
          const endDate = data[container].due_date
            ? data[container].due_date.split("-")[1] +
              "-" +
              data[container].due_date.split("-")[2]
            : null;
          subTitle.textContent = startDate + " ~ " + endDate;
        }
        // eventsContainer.classList.add(
        //   `events-container-${data[container].due_date}`
        // );
        eventsContainer.setAttribute("data-due-date", data[container].due_date);
        eventsContainer.setAttribute(
          "data-start-date",
          data[container].start_date
        );
        eventsContainer.innerHTML = "";
        if (container === "week") {
          title.textContent = "Week " + data[container].value;
        }
      });
      //events
      if (data.date.tasks) {
        data.date.goals.forEach((goal) => {
          if (goal.g_status > -1) {
            createEventComponent(
              "date",
              "goal",
              goal.g_id,
              goal.g_title,
              goal.g_status,
              goal.g_due_date,
              goal.g_description,
              goal.g_parent.join("．"),
              null,
              null,
              null,
              null,
              goal.g_id,
              null,
              goal.g_category,
              null,
              null
            );
          }
        });
        data.date.milestones.forEach((milestone) => {
          if (milestone.m_status > -1) {
            createEventComponent(
              "date",
              "milestone",
              milestone.m_id,
              milestone.m_title,
              milestone.m_status,
              milestone.m_due_date,
              milestone.m_description,
              milestone.m_parent.join("．"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date,
              milestone.g_category,
              null,
              null
            );
          }
        });
        data.date.tasks.forEach((task) => {
          let repeated_frequency = task.t_repeat ? task.r_frequency : 0;
          if (!task.t_id) {
            repeated_frequency = task.r_frequency;
          }
          console.log(
            "render event: task.t_id, repeated_frequency, task.r_end_date, ",
            task.t_id,
            repeated_frequency,
            task.r_end_date
          );
          if (task.t_status > -1) {
            createEventComponent(
              "date",
              "task",
              task.t_id,
              task.t_title,
              task.t_status,
              task.t_due_date,
              task.t_description,
              task.t_parent.join("．"),
              repeated_frequency,
              task.r_end_date,
              task.m_id,
              task.m_due_date,
              task.g_id,
              task.g_due_date,
              task.g_category,
              task.t_origin_id,
              task.t_origin_date
            );
          }
        });
      }

      if (data.week.tasks) {
        data.week.goals.forEach((goal) => {
          if (goal.g_status > -1) {
            createEventComponent(
              "week",
              "goal",
              goal.g_id,
              goal.g_title,
              goal.g_status,
              goal.g_due_date,
              goal.g_description,
              goal.g_parent.join("．"),
              null,
              null,
              null,
              null,
              goal.g_id,
              null,
              goal.g_category,
              null,
              null
            );
          }
        });
        data.week.milestones.forEach((milestone) => {
          if (milestone.m_status > -1) {
            createEventComponent(
              "week",
              "milestone",
              milestone.m_id,
              milestone.m_title,
              milestone.m_status,
              milestone.m_due_date,
              milestone.m_description,
              milestone.m_parent.join("．"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date,
              milestone.g_category,
              null,
              null
            );
          }
        });
        data.week.tasks.forEach((task) => {
          if (task.t_status > -1) {
            const repeated_frequency = task.t_repeat ? task.r_frequency : 0;
            if (task.t_id) {
              createEventComponent(
                "week",
                "task",
                task.t_id,
                task.t_title,
                task.t_status,
                task.t_due_date,
                task.t_description,
                task.t_parent.join("．"),
                repeated_frequency,
                task.r_end_date,
                task.m_id,
                task.m_due_date,
                task.g_id,
                task.g_due_date,
                task.g_category,
                task.t_origin_id,
                task.t_origin_date
              );
            }
          }
        });
      }

      if (data.month.tasks) {
        data.month.goals.forEach((goal) => {
          if (goal.g_status > -1) {
            createEventComponent(
              "month",
              "goal",
              goal.g_id,
              goal.g_title,
              goal.g_status,
              goal.g_due_date,
              goal.g_description,
              goal.g_parent.join("．"),
              null,
              null,
              null,
              null,
              goal.g_id,
              null,
              goal.g_category,
              null,
              null
            );
          }
        });
        data.month.milestones.forEach((milestone) => {
          if (milestone.m_status > -1) {
            createEventComponent(
              "month",
              "milestone",
              milestone.m_id,
              milestone.m_title,
              milestone.m_status,
              milestone.m_due_date,
              milestone.m_description,
              milestone.m_parent.join("．"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date,
              milestone.g_category,
              null,
              null
            );
          }
        });
        data.month.tasks.forEach((task) => {
          if (task.t_status > -1) {
            const repeated_frequency = task.t_repeat ? task.r_frequency : 0;
            if (task.t_id) {
              createEventComponent(
                "month",
                "task",
                task.t_id,
                task.t_title,
                task.t_status,
                task.t_due_date,
                task.t_description,
                task.t_parent.join("．"),
                repeated_frequency,
                task.r_end_date,
                task.m_id,
                task.m_due_date,
                task.g_id,
                task.g_due_date,
                task.g_category,
                task.t_origin_id,
                task.t_origin_date
              );
            }
          }
        });
      }
      if (data.year.tasks) {
        data.year.goals.forEach((goal) => {
          if (goal.g_status > -1) {
            createEventComponent(
              "year",
              "goal",
              goal.g_id,
              goal.g_title,
              goal.g_status,
              goal.g_due_date,
              goal.g_description,
              goal.g_parent.join("．"),
              null,
              null,
              null,
              null,
              goal.g_id,
              null,
              goal.g_category,
              null,
              null
            );
          }
        });
        data.year.milestones.forEach((milestone) => {
          if (milestone.m_status > -1) {
            createEventComponent(
              "year",
              "milestone",
              milestone.m_id,
              milestone.m_title,
              milestone.m_status,
              milestone.m_due_date,
              milestone.m_description,
              milestone.m_parent.join("．"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date,
              milestone.g_category,
              null,
              null
            );
          }
        });
        // data.year.tasks.forEach((task) => {
        //   if (task.t_status > -1) {
        //     const repeated_frequency = task.t_repeat ? task.r_frequency : 0;
        //     if (task.t_id) {
        //       createEventComponent(
        //         "year",
        //         "task",
        //         task.t_id,
        //         task.t_title,
        //         task.t_status,
        //         task.t_due_date,
        //         task.t_description,
        //         task.t_parent.join(">"),
        //         repeated_frequency,
        //         task.r_end_date,
        //         task.m_id,
        //         task.m_due_date,
        //         task.g_id,
        //         task.g_due_date,
        //         task.t_origin_id,
        //         task.t_origin_date
        //       );
        //     }
        //   }
        // });
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
  const dueDateUnix = Math.ceil(new Date(dueDate + "T23:59:59"));
  const body = {};
  body[`${eventType}_title`] = title;
  body[`${eventType}_due_date`] = dueDate;
  body[`${eventType}_due_date_unix`] = dueDateUnix;

  if (!title) {
    Swal.fire({
      icon: "warning",
      title: `Please name the ${eventType} before adding!`,
    });
    return;
  }
  console.log("body: ", body);
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
      console.log("restuls: ", data);
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
        const eventId = data.task_id || data.goal_id;

        if (data.task_id) {
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

//打開modal 用的
const createViewGoalButton = (goal_id) => {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-outline-primary", "edit-goal-button");
  button.setAttribute("type", "button");
  button.setAttribute("data-bs-toggle", "modal");
  button.setAttribute("data-bs-target", "#modal-goal");
  button.setAttribute("onclick", `renderGoalEditor(${goal_id})`);
  button.textContent = "view goal";
  return button;
};

const createDeleteGoalButton = (goalId) => {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("data-bs-toggle", "modal");
  button.setAttribute("data-bs-target", "#deleteGoalModal");
  button.classList.add("btn", "btn-outline-danger", "col-6");
  button.textContent = "delete";

  button.addEventListener("click", (e) => {
    const deleteGoalModal = document.querySelector("#deleteGoalModal");
    const modalFooter = deleteGoalModal.querySelector(".modal-footer");
    const deleteGoalButton = deleteGoalModal.querySelector(
      ".delete-goal-button"
    );
    deleteGoalButton.setAttribute(
      "onclick",
      `deleteGoalAndChildren(${goalId})`
    );
    const oldViewGoalButton = modalFooter.querySelector(".edit-goal-button");
    console.log("oldViewGoalButton: ", oldViewGoalButton);
    if (oldViewGoalButton) {
      oldViewGoalButton.setAttribute("onclick", `renderGoalEditor(${goalId})`);
    } else {
      const viewGoalButton = createViewGoalButton(goalId);
      viewGoalButton.setAttribute("data-bs-dismiss", "modal");
      modalFooter.appendChild(viewGoalButton);
    }
  });

  return button;
};

const createDeleteMilestoneButton = (milestoneId, goalId) => {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("data-bs-toggle", "modal");
  button.setAttribute("data-bs-target", "#deleteMilestoneModal");
  button.classList.add("btn", "btn-outline-danger", "col-6");
  button.textContent = "delete";

  button.addEventListener("click", (e) => {
    const deleteMilestoneModal = document.querySelector(
      "#deleteMilestoneModal"
    );
    const modalFooter = deleteMilestoneModal.querySelector(".modal-footer");
    const deleteMilestoneButton = deleteMilestoneModal.querySelector(
      ".delete-milestone-button"
    );
    deleteMilestoneButton.setAttribute(
      "onclick",
      `deleteMilestoneAndChildren(${milestoneId})`
    );
    const oldViewGoalButton = modalFooter.querySelector(".edit-goal-button");
    console.log("oldViewGoalButton: ", oldViewGoalButton);
    if (oldViewGoalButton) {
      oldViewGoalButton.setAttribute("onclick", `renderGoalEditor(${goalId})`);
    } else {
      const viewGoalButton = createViewGoalButton(goalId);
      viewGoalButton.setAttribute("data-bs-dismiss", "modal");
      modalFooter.appendChild(viewGoalButton);
    }
  });
  return button;
};

const createStopTodayButton = (
  parentContainer,
  eventOuterContainer,
  originId,
  dueDate
) => {
  console.log("STOP BUTTON arguments ", parentContainer, originId, dueDate);
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.classList.add("btn", "btn-outline-warning");
  button.textContent = "stop repeating today";

  button.addEventListener("click", (e) => {
    const apiEndpoint = `/api/repeated-task/stop?task_origin_id=${originId}&task_r_end_date=${dueDate}`;
    console.log("apiEndpoint: ", apiEndpoint);
    fetch(apiEndpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("return from stop: ", data);

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
        });
        //parentContainer.removeChild(eventOuterContainer);
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
  console.log("listen!");
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
