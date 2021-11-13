const deleteGoalAndChildren = (goalId) => {
  const accessToken = localStorage.getItem("access_token");
  fetch(`/api/goal?goal_id=${goalId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.error) {
        //something went wrong
        Swal.fire({
          title: "Something went wrong.",
          text: "Please try again",
          icon: "error",
          showCancelButton: false,
        });
        return;
      }
      if (data.affectedRows > 0) {
        //all deleted
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          showConfirmButton: false,
        });
        const currentDate =
          document.querySelector(".date-value").dataset.dueDate;
        renderEvents(currentDate);
      } else {
        //nothing changed
        Swal.fire({
          icon: "warning",
          title: "Seems like this goal has already be gone.",
          showConfirmButton: false,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
const deleteMilestoneAndChildren = (milestoneId) => {
  const accessToken = localStorage.getItem("access_token");
  fetch(`/api/milestone?milestone_id=${milestoneId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.error) {
        //something went wrong
        Swal.fire({
          title: "Something went wrong.",
          text: "Please try again",
          icon: "error",
          showCancelButton: false,
        });
        return;
      }
      if (data.affectedRows > 0) {
        //all deleted
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          showConfirmButton: false,
        });
        const currentDate =
          document.querySelector(".date-value").dataset.dueDate;
        renderEvents(currentDate);
      } else {
        //nothing changed
        Swal.fire({
          icon: "warning",
          title: "Seems like this milestone has already be gone.",
          showConfirmButton: false,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

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
              task.t_parent.join(">"),
              repeated_frequency,
              task.r_end_date,
              task.m_id,
              task.m_due_date,
              task.g_id,
              task.g_due_date,
              task.t_origin_id,
              task.t_origin_date
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
              milestone.m_parent.join(">"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date,
              null,
              null
            );
          }
        });
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
              goal.g_parent.join(">"),
              null,
              null,
              null,
              null,
              goal.g_id,
              null,
              null,
              null
            );
          }
        });
      }

      if (data.week.tasks) {
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
                task.t_parent.join(">"),
                repeated_frequency,
                task.r_end_date,
                task.m_id,
                task.m_due_date,
                task.g_id,
                task.g_due_date,
                task.t_origin_id,
                task.t_origin_date
              );
            }
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
              milestone.m_parent.join(">"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date,
              null,
              null
            );
          }
        });
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
              goal.g_parent.join(">"),
              null,
              null,
              null,
              null,
              goal.g_id,
              null,
              null,
              null
            );
          }
        });
      }

      if (data.month.tasks) {
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
                task.t_parent.join(">"),
                repeated_frequency,
                task.r_end_date,
                task.m_id,
                task.m_due_date,
                task.g_id,
                task.g_due_date,
                task.t_origin_id,
                task.t_origin_date
              );
            }
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
              milestone.m_parent.join(">"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date,
              null,
              null
            );
          }
        });
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
              goal.g_parent.join(">"),
              null,
              null,
              null,
              null,
              goal.g_id,
              null,
              null,
              null
            );
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
              goal.g_parent.join(">"),
              null,
              null,
              null,
              null,
              goal.g_id,
              null,
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
              milestone.m_parent.join(">"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date,
              null,
              null
            );
          }
        });
        data.year.tasks.forEach((task) => {
          if (task.t_status > -1) {
            const repeated_frequency = task.t_repeat ? task.r_frequency : 0;
            if (task.t_id) {
              createEventComponent(
                "year",
                "task",
                task.t_id,
                task.t_title,
                task.t_status,
                task.t_due_date,
                task.t_description,
                task.t_parent.join(">"),
                repeated_frequency,
                task.r_end_date,
                task.m_id,
                task.m_due_date,
                task.g_id,
                task.g_due_date,
                task.t_origin_id,
                task.t_origin_date
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
  const dueDateUnix = Math.ceil(new Date(dueDate + "T23:59:59"));
  const body = {};
  body[`${eventType}_title`] = title;
  body[`${eventType}_due_date`] = dueDate;
  body[`${eventType}_due_date_unix`] = dueDateUnix;

  // if (!title) {
  //   return alert(`Please name the ${eventType} before adding!`);
  // }
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
          null,
          null,
          null,
          null,
          null,
          eventId,
          null,
          null
        );
      }

      input.value = "";
    })
    .catch((err) => {
      console.log(err);
    });
};

const createEventComponent = (
  timeScale,
  eventType,
  id,
  title,
  status,
  dueDate,
  description,
  parents,
  task_repeat_frequency = 0,
  task_repeat_end_date = null,
  milestone_id = null,
  milestone_due_date = null,
  goal_id = null,
  goal_due_date = null,
  task_origin_id = null,
  task_origin_date = null
) => {
  // console.log(
  //   timeScale,
  //   eventType,
  //   id,
  //   title,
  //   status,
  //   dueDate,
  //   description,
  //   parents,
  //   task_repeat_frequency,
  //   task_repeat_end_date,
  //   milestone_id,
  //   milestone_due_date,
  //   goal_id,
  //   goal_due_date,
  //   task_origin_id,
  //   task_origin_date
  // );
  const accessToken = localStorage.getItem("access_token");
  //如果移動要改parentContainer所以用let
  let parentContainer = document.querySelector(
    `.${timeScale}-events-container`
  );
  const eventOuterContainer = document.createElement("div");
  //const eventToggle = document.createElement("a")
  const eventHeaderContainer = document.createElement("div");
  const eventInfoContainer = document.createElement("div");
  const EventTitleContainer = document.createElement("div");
  const checkBoxContainer = document.createElement("div");

  const checkBox = document.createElement("input");
  const eventTitleContentContainer = document.createElement("div");
  const eventTitle = document.createElement("span");

  const eventInfoButtonContainer = document.createElement("div");
  const editButton = document.createElement("button");
  const eventParents = document.createElement("h6");

  const eventEditor = document.createElement("div");
  const eventDueDateContainer = document.createElement("div");
  const eventDueDate = document.createElement("input");
  const eventDescriptionContainer = document.createElement("div");
  const eventDescription = document.createElement("p");
  const taskRepeatSelectorContainer =
    eventType === "task"
      ? createTaskRepeatSelector(
          id,
          task_repeat_frequency,
          task_repeat_end_date,
          dueDate,
          milestone_due_date,
          eventDueDate,
          task_origin_id
        )
      : null;
  const taskRepeatSelector = taskRepeatSelectorContainer
    ? taskRepeatSelectorContainer.querySelector("select")
    : null;
  const taskRepeatEndDate = taskRepeatSelectorContainer
    ? taskRepeatSelectorContainer.querySelector("input")
    : null;

  const eventFooterContainer = document.createElement("div");
  const eventSaveButton = document.createElement("button");
  const taskDeleteButton = createDeleteTaskButton(
    id,
    task_origin_id,
    task_origin_date,
    title,
    task_repeat_frequency,
    parentContainer,
    eventOuterContainer
  );
  const stopRepeatButton =
    task_origin_id && !id
      ? createStopTodayButton(
          parentContainer,
          eventOuterContainer,
          task_origin_id,
          dueDate
        )
      : null;
  const goalDeleteButton =
    eventType === "goal" ? createDeleteGoalButton(id) : null;
  const milestoneDeleteButton =
    eventType === "milestone" ? createDeleteMilestoneButton(id, goal_id) : null;

  const saveEvent = () => {
    const body = {};
    body[`${eventType}_id`] = id;
    body[`${eventType}_title`] = eventTitle.textContent;
    body[`${eventType}_description`] = eventDescription.textContent;
    body[`${eventType}_status`] = checkBox.hasAttribute("checked") ? 1 : 0;
    body[`${eventType}_due_date`] = eventDueDate.value;
    body[`${eventType}_due_date_unix`] = Math.ceil(
      new Date(eventDueDate.value + "T23:59:59")
    );
    body.task_origin_id = task_origin_id;
    body.task_origin_date = task_origin_date;

    if (taskRepeatSelector) {
      const task_r_frequency =
        taskRepeatSelector.options[taskRepeatSelector.selectedIndex].value;
      const task_repeat = task_r_frequency != 0 ? 1 : 0;
      const task_r_end_date = taskRepeatEndDate.value;
      body.task_repeat = task_repeat;
      body.task_r_frequency = task_r_frequency;
      body.task_r_end_date = task_r_end_date;
      //task due date > repeat end date的話，error
      if (task_repeat && task_r_end_date < eventDueDate.value) {
        Swal.fire({
          title: "Invalid repeat rule",
          text: "Repeat end date should be later than starting date. ",
          icon: "error",
          showCancelButton: false,
        });
        return;
      }
    }

    console.log("body: ", body);

    let apiEndpoint = "";
    if (!id && task_origin_id) {
      apiEndpoint = `/api/repeated-task/new`;
    } else if (task_origin_id) {
      apiEndpoint = `/api/repeated-task/saved`;
    } else {
      apiEndpoint = `/api/${eventType}`;
    }
    console.log("body: ", body);
    console.log("apiEndpoint: ", apiEndpoint);
    fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("return from save: ", data);
        if (data.error) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.error,
          });
          return;
        }
        const alertText = task_origin_id
          ? "Update successfully. The rest of the repeating tasks remain the same."
          : "Update successfully";
        Swal.fire({
          icon: "success",
          title: "All good!",
          text: alertText,
        });
        const currentDate =
          document.querySelector(".date-value").dataset.dueDate;
        renderEvents(currentDate);

        const newEventDueDate = new Date(eventDueDate.value);
        const eventContainers = document.querySelectorAll(".events-container");
        const containerDueDates = [];
        eventContainers.forEach((c) =>
          containerDueDates.push(c.dataset.dueDate)
        );
        console.log(newEventDueDate, containerDueDates);

        const relocateEvent = (index) => {
          if (parentContainer === eventContainers[index]) return;
          parentContainer.removeChild(eventOuterContainer);
          eventContainers[index].appendChild(eventOuterContainer);
          parentContainer = eventContainers[index];
        };
        if (eventDueDate.value === containerDueDates[0]) {
          relocateEvent(0);
        } else if (
          newEventDueDate > new Date(containerDueDates[0]) &&
          newEventDueDate <= new Date(containerDueDates[1])
        ) {
          relocateEvent(1);
        } else if (
          newEventDueDate > new Date(containerDueDates[0]) &&
          newEventDueDate <= new Date(containerDueDates[2])
        ) {
          relocateEvent(2);
        } else if (
          newEventDueDate > new Date(containerDueDates[0]) &&
          newEventDueDate <= new Date(containerDueDates[3])
        ) {
          relocateEvent(3);
        } else if (
          newEventDueDate < new Date(containerDueDates[0]) ||
          newEventDueDate > new Date(containerDueDates[3])
        ) {
          parentContainer.removeChild(eventOuterContainer);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  eventOuterContainer.classList.add(
    `${eventType}-outer-container`,
    "event-outer-container",
    "card",
    "col-12",
    "mb-2"
  );
  eventOuterContainer.setAttribute("id", `${eventType}-${id}`);
  eventOuterContainer.setAttribute("data-milestone-id", milestone_id);
  eventOuterContainer.setAttribute(
    "data-milestone-due-date",
    milestone_due_date
  );
  eventOuterContainer.setAttribute("data-goal-id", goal_id);
  eventOuterContainer.setAttribute("data-goal-due-date", goal_due_date);
  if (task_origin_id) {
    eventOuterContainer.setAttribute("data-origin-id", task_origin_id);
  }
  eventOuterContainer.setAttribute("data-goal-due-date", goal_due_date);
  eventOuterContainer.classList.add("event-info-container", "col-10");
  eventHeaderContainer.classList.add("event-header-container", "row", "mb-3");

  EventTitleContainer.classList.add("event-title-container", "my-2", "d-flex");
  checkBoxContainer.classList.add("check-box-container", "col-1");

  checkBox.classList.add("form-check-input");
  checkBox.setAttribute("type", "checkbox");
  if (status) {
    checkBox.setAttribute("checked", "true");
  }
  checkBox.addEventListener("click", (e) => {
    const isChecked = checkBox.hasAttribute("checked");
    if (isChecked) {
      checkBox.removeAttribute("checked");
    } else {
      checkBox.setAttribute("checked", "true");
    }
    saveEvent();
  });
  eventTitleContentContainer.classList.add(
    "event-title-content-container",
    "col-9"
  );
  eventTitle.classList.add("event-title");
  eventTitle.setAttribute("contenteditable", "true");
  eventTitle.textContent = title;

  eventParents.classList.add("event-parents", "mt-1", "mb-2", "text-muted");

  if (parents != ">>") {
    eventParents.setAttribute("data-bs-toggle", "modal");
    eventParents.setAttribute("data-bs-target", "#modal-goal");
    eventParents.setAttribute("onclick", `renderGoalEditor(${goal_id})`);
    eventParents.textContent = parents + " 🔍";
  }
  if (eventType === "goal") {
    eventParents.setAttribute("data-bs-toggle", "modal");
    eventParents.setAttribute("data-bs-target", "#modal-goal");
    eventParents.setAttribute("onclick", `renderGoalEditor(${id})`);
    eventParents.textContent = ">check goal 🔍";
  }
  if (parents == null) {
    eventParents.textContent = null;
  }

  eventInfoButtonContainer.classList.add(
    "event-info-button-container",
    "col-2"
  );
  editButton.classList.add(
    "btn",
    "btn-sm",
    "btn-outline-secondary",
    "edit-button"
  );
  editButton.setAttribute("type", "button");
  editButton.setAttribute("data-bs-toggle", "collapse");
  editButton.setAttribute("data-bs-target", `#editor-${eventType}-${id}`);
  //editButton.setAttribute("style", "opacity: 0");
  editButton.textContent = "✍";
  eventEditor.classList.add("event-editor", "col", "collapse", "px-2");
  if (!title) {
    eventEditor.classList.remove("collapse");
  }
  eventEditor.setAttribute("id", `editor-${eventType}-${id}`);
  eventDueDateContainer.classList.add(
    "event-due-date-container",
    "row",
    "mb-3"
  );
  eventDueDate.classList.add("event-due-date", `due-date-${eventType}-${id}`);
  eventDueDate.setAttribute("type", "date");
  eventDueDate.value = dueDate;
  switch (eventType) {
    case "milestone":
      eventDueDate.setAttribute("max", goal_due_date);
      break;
    case "goal":
      eventDueDate.setAttribute("max", milestone_due_date);
      break;
  }

  if (task_origin_date) {
    eventDueDate.setAttribute("data-origin-date", task_origin_date);
  }
  eventDescriptionContainer.classList.add(
    "event-description-container",
    "row",
    "mb-3"
  );
  eventDescription.classList.add(
    "event-description",
    `event-description-${eventType}-${id}`,
    "border"
  );

  eventDueDate.addEventListener("change", () => {
    if (taskRepeatSelector) {
      taskRepeatEndDate.min = eventDueDate.value;
      if (taskRepeatEndDate.value < eventDueDate.value) {
        taskRepeatEndDate.value = eventDueDate.value;
      }
    }
  });

  eventDescription.setAttribute("contenteditable", "true");

  eventDescription.textContent = description
    ? description
    : `Description of this ${eventType}...`;

  // eventOuterContainer.addEventListener("input", () => {
  //   const repeatedOriginChangeNote = eventOuterContainer.querySelector(
  //     ".origin-change-note"
  //   );
  //   const isRepeated = taskRepeatSelector
  //     ? Number(taskRepeatSelector.value) > 0
  //     : 0;

  //   if (
  //     !task_origin_id &&
  //     taskRepeatSelector &&
  //     isRepeated &&
  //     !repeatedOriginChangeNote
  //   ) {
  //     console.log("ready to add the nooottteee");
  //     const NewRepeatedOriginChangeNote = document.createElement("div");
  //     NewRepeatedOriginChangeNote.classList.add(
  //       "origin-change-note",
  //       "row",
  //       "mb-3"
  //     );
  //     NewRepeatedOriginChangeNote.textContent =
  //       "Changes on task contents only apply to future reoccurring tasks";
  //     eventDescriptionContainer.after(NewRepeatedOriginChangeNote);
  //   }
  // });
  eventFooterContainer.classList.add("event-footer-container", "row", "mb-3");
  eventSaveButton.textContent = "save";
  eventSaveButton.classList.add(
    "col-12",
    "btn",
    "btn-outline-secondary",
    "save-button",
    `save-button-${eventType}-${id}`
  );
  eventSaveButton.setAttribute("type", "button");
  eventSaveButton.setAttribute("data-bs-toggle", "collapse");

  eventSaveButton.setAttribute("data-bs-target", `#editor-${eventType}-${id}`);
  eventSaveButton.addEventListener("click", saveEvent);

  eventFooterContainer.append(eventSaveButton);
  if (stopRepeatButton) {
    eventFooterContainer.append(stopRepeatButton);
  }
  if (eventType === "task") {
    eventFooterContainer.append(taskDeleteButton);
  }

  if (eventType === "goal") {
    eventFooterContainer.append(goalDeleteButton);
  }
  if (eventType === "milestone") {
    eventFooterContainer.append(milestoneDeleteButton);
  }

  eventDescriptionContainer.appendChild(eventDescription);
  eventDueDateContainer.appendChild(eventDueDate);
  eventEditor.append(
    eventDueDateContainer,
    eventDescriptionContainer,
    eventFooterContainer
  );
  if (eventType === "task") {
    eventDescriptionContainer.after(taskRepeatSelectorContainer);
  }

  checkBoxContainer.appendChild(checkBox);
  eventTitleContentContainer.appendChild(eventTitle);
  EventTitleContainer.append(
    checkBoxContainer,
    eventTitleContentContainer,
    eventInfoButtonContainer
  );
  if (task_repeat_frequency > 0 || task_origin_id) {
    console.log(id, task_repeat_frequency, task_origin_id);
    const repeatIcon = document.createElement("span");
    repeatIcon.textContent = " ⟳";
    eventTitle.after(repeatIcon);
  }
  eventInfoButtonContainer.appendChild(editButton);

  eventInfoContainer.append(EventTitleContainer, eventParents);
  eventHeaderContainer.append(eventInfoContainer);
  eventOuterContainer.append(eventHeaderContainer, eventEditor);
  parentContainer.appendChild(eventOuterContainer);
};

const createTaskRepeatSelector = (
  task_id,
  task_repeat_frequency,
  task_repeat_end_date,
  min_date,
  max_date,
  task_due_date_element,
  task_origin_id
) => {
  const container = document.createElement("div");
  container.classList.add(
    `task-repeat-container-${task_id}`,
    "task-repeat-container",
    "row",
    "mb-3"
  );
  if (task_origin_id) {
    switch (task_repeat_frequency) {
      // case 0:
      //   container.textContent = "Repeated task";
      //   break;
      case 1:
        container.textContent = `Repeated daily until ${task_repeat_end_date}`;
        break;
      case 7:
        container.textContent = `Repeated weekly until ${task_repeat_end_date}`;
        break;
      case 30:
        container.textContent = `Repeated monthly until ${task_repeat_end_date}`;
        break;
    }
  } else {
    const selector = document.createElement("select");
    const optionNoRepeat = document.createElement("option");
    const optionEveryday = document.createElement("option");
    const optionOnceAWeek = document.createElement("option");
    const optionOnceAMonth = document.createElement("option");
    const repeatEndDateDescription = document.createElement("span");
    const repeatEndDate = document.createElement("input");
    selector.classList.add("task-repeat-selector", "form-selector", "mb-3");
    optionNoRepeat.setAttribute("value", 0);
    optionNoRepeat.textContent = "No repeat";
    optionNoRepeat.setAttribute("selected", "true");
    optionEveryday.setAttribute("value", 1);
    optionEveryday.textContent = "Everyday";
    optionOnceAWeek.setAttribute("value", 7);
    optionOnceAWeek.textContent = "Once a week";
    optionOnceAMonth.setAttribute("value", 30);
    optionOnceAMonth.textContent = "Once a month";
    repeatEndDateDescription.textContent = "Repeat until...";
    repeatEndDate.classList.add("event-due-date", "col");
    repeatEndDate.setAttribute("type", "date");
    if (!task_repeat_frequency) {
      repeatEndDate.setAttribute("disabled", "true");
    }
    repeatEndDate.value = task_repeat_end_date;
    repeatEndDate.setAttribute("min", min_date);
    repeatEndDate.setAttribute("max", max_date);
    selector.addEventListener("change", (e) => {
      if (selector.value == 0) {
        repeatEndDate.setAttribute("disabled", "true");
      } else {
        repeatEndDate.removeAttribute("disabled");
        repeatEndDate.setAttribute("min", task_due_date_element.value);
      }
    });
    switch (task_repeat_frequency) {
      case 0:
        optionNoRepeat.setAttribute("selected", "true");
        repeatEndDate.setAttribute("disabled", "true");
        repeatEndDate.value = null;
        break;
      case 1:
        optionEveryday.setAttribute("selected", "true");
        break;
      case 7:
        optionOnceAWeek.setAttribute("selected", "true");
        break;
      case 30:
        optionOnceAMonth.setAttribute("selected", "true");
        break;
    }
    selector.append(
      optionNoRepeat,
      optionEveryday,
      optionOnceAWeek,
      optionOnceAMonth
    );

    container.append(selector, repeatEndDateDescription, repeatEndDate);
  }

  return container;
};

//打開modal 用的
const createViewGoalButton = (goal_id) => {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-outline-secondary", "edit-goal-button");
  button.setAttribute("type", "button");
  button.setAttribute("data-bs-toggle", "modal");
  button.setAttribute("data-bs-target", "#modal-goal");
  button.setAttribute("onclick", `renderGoalEditor(${goal_id})`);
  button.textContent = "view goal";
  return button;
};

//刪除按鈕們
const createDeleteTaskButton = (
  id,
  task_origin_id,
  task_origin_date,
  title,
  task_repeat_frequency,
  parentContainer,
  eventOuterContainer
) => {
  const button = document.createElement("button");
  button.textContent = "delete";
  button.classList.add(
    "col-12",
    "btn",
    "btn-outline-secondary",
    "delete-task-button"
  );
  button.setAttribute("type", "button");
  button.setAttribute("data-bs-toggle", "collapse");
  button.setAttribute("data-bs-target", `#editor-task-${id}`);
  if (task_repeat_frequency > 0) {
    button.setAttribute("data-bs-toggle", "tooltip");
    button.setAttribute("data-bs-placement", "top");
    button.setAttribute(
      "title",
      "Will delete the future reoccurring tasks too."
    );
  }
  button.addEventListener("click", (e) => {
    Swal.fire({
      title: "Are you sure?",
      text: `"${title}" will be gone for good.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        let apiEndpoint = "";
        if (!id && task_origin_id) {
          apiEndpoint = `/api/repeated-task/new?task_origin_id=${task_origin_id}&task_origin_date=${task_origin_date}`;
        } else if (task_origin_id) {
          apiEndpoint = `/api/repeated-task/saved?task_id=${id}`;
        } else {
          apiEndpoint = `/api/task?task_id=${id}`;
        }
        console.log("apiEndpoint: ", apiEndpoint);
        fetch(apiEndpoint, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((response) => {
            if (response.status === 200) {
              Swal.fire({
                icon: "success",
                title: "Deleted!",
                showConfirmButton: false,
              });
              //parentContainer.removeChild(eventOuterContainer);
              const currentDate =
                document.querySelector(".date-value").dataset.dueDate;
              renderEvents(currentDate);
            } else {
              Swal.fire({
                icon: "error",
                title: "Something went wrong...",
                showConfirmButton: false,
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  });

  return button;
};

const createDeleteGoalButton = (goalId) => {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("data-bs-toggle", "modal");
  button.setAttribute("data-bs-target", "#deleteGoalModal");
  button.classList.add("btn", "btn-outline-secondary");
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
  button.classList.add("btn", "btn-outline-secondary");
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
  button.classList.add("btn", "btn-outline-secondary");
  button.textContent = "stop today";

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

document.onload = renderEventsToday();
