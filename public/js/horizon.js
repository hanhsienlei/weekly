const deleteGoalAndChildren = (goalId) => {
  fetch(`/api/goal?goal_id=${goalId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((err) => {
      console.log(err);
    });
};
const deleteMilestoneAndChildren = (milestoneId) => {
  fetch(`/api/milestone?milestone_id=${milestoneId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((err) => {
      console.log(err);
    });
};

const renderEvents = async (date) => {
  fetch(`/api/events/${date}?user_id=1`)
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
          const repeated_frequency = task.t_repeat ? task.r_frequency : 0;
          console.log(task.t_id, repeated_frequency, task.r_end_date);
          if (task.t_status > -1) {
            createEventComponent(
              "date",
              "task",
              task.t_id,
              task.t_title,
              task.t_status,
              task.t_due_date,
              task.t_description,
              task.t_parent.join("·"),
              repeated_frequency,
              task.r_end_date,
              task.m_id,
              task.m_due_date,
              task.g_id,
              task.g_due_date
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
              milestone.m_parent.join("·"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date
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
              goal.g_parent.join("·"),
              null,
              null,
              null,
              null,
              goal.g_id
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
                task.t_parent.join("·"),
                repeated_frequency,
                task.r_end_date,
                task.m_id,
                task.m_due_date,
                task.g_id
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
              milestone.m_parent.join("·"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date
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
              goal.g_parent.join("·"),
              null,
              null,
              null,
              null,
              goal.g_id
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
                task.t_parent.join("·"),
                repeated_frequency,
                task.r_end_date,
                task.m_id,
                task.m_due_date,
                task.g_id
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
              milestone.m_parent.join("·"),
              null,
              null,
              null,
              null,
              milestone.g_id,
              milestone.g_due_date
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
              goal.g_parent.join("·"),
              null,
              null,
              null,
              null,
              goal.g_id
            );
          }
        });
      }
      if (data.year.tasks) {
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
                task.t_parent.join("·"),
                repeated_frequency,
                task.r_end_date,
                task.m_id,
                task.m_due_date,
                task.g_id
              );
            }
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
              milestone.m_parent.join("·"),
              null,
              null,
              null,
              null,
              milestone.g_id
            );
          }
        });
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
              goal.g_parent.join("·"),
              null,
              null,
              null,
              null,
              goal.g_id
            );
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const addNewEvent = (timeScale, eventType) => {
  const input = document.querySelector(`.${timeScale}-new-${eventType}-title`);
  const title = input.value.trim();
  const dueDate = document.querySelector(`.${timeScale}-value`).dataset.dueDate;
  const dueDateUnix = Math.ceil(new Date(dueDate + "T23:59:59"));
  const body = {
    user_id: 1,
  };
  body[`${eventType}_title`] = title;
  body[`${eventType}_due_date`] = dueDate;
  body[`${eventType}_due_date_unix`] = dueDateUnix;

  if (!title) {
    return alert(`Please name the ${eventType} before adding!`);
  }
  fetch(`/api/${eventType}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
          eventId
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
  goal_due_date = null
) => {
  //如果移動要改parentContainer所以用let
  let parentContainer = document.querySelector(
    `.${timeScale}-events-container`
  );
  const eventOuterContainer = document.createElement("div");
  //const eventToggle = document.createElement("a")
  const eventHeaderContainer = document.createElement("div");
  const eventInfoContainer = document.createElement("div");
  const tagsContainer = document.createElement("div");
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
          eventDueDate
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
  const eventCancelButton = document.createElement("button");
  const goalDeleteButton =
    eventType === "goal" ? createDeleteGoalButton(id) : null;
  const milestoneDeleteButton =
    eventType === "milestone" ? createDeleteMilestoneButton(id, goal_id) : null;
  const goalEditorButton = goal_id ? createViewGoalButton(goal_id) : null;

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
  eventHeaderContainer.classList.add("event-header-container", "row", "mb-3");
  eventOuterContainer.classList.add("event-info-container", "col-10");
  tagsContainer.classList.add("tags-container");
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
    const isCheckedNew = checkBox.hasAttribute("checked");

    const body = {};
    body.user_id = 1;
    body[`${eventType}_id`] = id;
    body[`${eventType}_title`] = eventTitle.textContent;
    body[`${eventType}_description`] = eventDescription.textContent;
    body[`${eventType}_status`] = isCheckedNew ? 1 : 0;
    body[`${eventType}_due_date`] =
      eventDueDate.value.length == 10 ? eventDueDate.value : null;
    body[`${eventType}_due_date_unix`] = Math.ceil(
      new Date(eventDueDate.value + "T23:59:59")
    );
    if (!id && eventType === "task") {
      body.task_milestone_id = milestone_id;
    }
    console.log("[checkbox] body: ", body);
    fetch(`/api/${eventType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  eventTitleContentContainer.classList.add(
    "event-title-content-container",
    "col-9"
  );
  eventTitle.classList.add("event-title");
  eventTitle.setAttribute("contenteditable", "true");
  eventTitle.textContent = title;
  eventParents.classList.add("event-parents", "mt-1", "mb-2", "text-muted");
  eventParents.textContent = parents != "··" ? parents : null;
  eventInfoButtonContainer.classList.add(
    "event-info-button-container",
    "col-2"
  );
  editButton.classList.add("btn", "btn-light", "edit-button");
  editButton.setAttribute("type", "button");
  editButton.setAttribute("data-bs-toggle", "collapse");
  editButton.setAttribute("data-bs-target", `#editor-${eventType}-${id}`);
  editButton.textContent = "✍";
  eventEditor.classList.add("event-editor", "row", "collapse");
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
  eventDescriptionContainer.classList.add(
    "event-description-container",
    "row",
    "mb-3"
  );
  eventDescription.classList.add(
    "event-description",
    `event-description-${eventType}-${id}`
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

  eventFooterContainer.classList.add("event-footer-container", "row", "mb-3");
  eventSaveButton.textContent = "save";
  eventSaveButton.classList.add(
    "col-4",
    "btn",
    "btn-light",
    "save-button",
    `save-button-${eventType}-${id}`
  );
  eventSaveButton.setAttribute("type", "button");
  eventSaveButton.setAttribute("data-bs-toggle", "collapse");
  eventSaveButton.setAttribute("data-bs-target", `#editor-${eventType}-${id}`);
  eventSaveButton.addEventListener("click", (e) => {
    const body = {};
    body.user_id = 1;
    body[`${eventType}_id`] = id;
    body[`${eventType}_title`] = eventTitle.textContent;
    body[`${eventType}_description`] = eventDescription.textContent;
    body[`${eventType}_status`] = checkBox.hasAttribute("checked") ? 1 : 0;
    body[`${eventType}_due_date`] = eventDueDate.value;
    body[`${eventType}_due_date_unix`] = Math.ceil(
      new Date(eventDueDate.value + "T23:59:59")
    );
    if (!id && eventType === "task") {
      body.task_milestone_id = milestone_id;
    }

    if (taskRepeatSelector) {
      const task_r_frequency =
        taskRepeatSelector.options[taskRepeatSelector.selectedIndex].value;
      const task_repeat = task_r_frequency != 0 ? 1 : 0;
      const task_r_end_date = taskRepeatEndDate.value || taskRepeatEndDate.max;
      body.task_repeat = task_repeat;
      body.task_r_frequency = task_r_frequency;
      //task due date > repeat end date的話，repeat end date設為task due date
      if (task_r_end_date < eventDueDate.value) {
        body.task_r_end_date = eventDueDate.value;
        body.task_r_end_date_unix = Math.ceil(
          new Date(eventDueDate.value + "T23:59:59")
        );
      }
      console.log("task repeat date set to new task due date by system!");
      body.task_r_end_date = task_r_end_date || "2100-01-01";
      body.task_r_end_date_unix = Math.ceil(
        new Date(task_r_end_date + "T23:59:59")
      );
    }
    console.log("body: ", body);
    fetch(`/api/${eventType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const currentContainerDueDate = parentContainer.dataset.dueDate;
        const currentContainerStartDate = parentContainer.dataset.startDate;
        const eventContainers = document.querySelectorAll(".events-container");
        if (
          eventDueDate.value < currentContainerStartDate &&
          eventDueDate.value > currentContainerDueDate
        ) {
          parentContainer.removeChild(eventOuterContainer);
        }
        for (let i = 0; i < eventContainers.length; i++) {
          const containerDueDate = eventContainers[i].dataset.dueDate;
          const containerStartDate = eventContainers[i].dataset.startDate;
          const isTargetContainer =
            eventDueDate.value <= containerDueDate &&
            eventDueDate.value >= containerStartDate;
          const isCurrentContainer = parentContainer === eventContainers[i];
          if (isTargetContainer && !isCurrentContainer) {
            eventContainers[i].appendChild(eventOuterContainer);
            parentContainer = eventContainers[i];
            console.log("event appended to  ", eventContainers[i]);
            return;
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
  eventCancelButton.textContent = "x";
  eventCancelButton.classList.add("col-4", "btn", "btn-light", "cancel-button");
  eventCancelButton.setAttribute("type", "button");
  eventCancelButton.setAttribute("data-bs-toggle", "collapse");
  eventCancelButton.setAttribute(
    "data-bs-target",
    `#editor-${eventType}-${id}`
  );
  eventCancelButton.addEventListener("click", (e) => {
    if (eventType === "task") {
      fetch(`/api/${eventType}?${eventType}_id=${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          parentContainer.removeChild(eventOuterContainer);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log(eventType);
    }

    editButton.setAttribute("data-bs-toggle", "collapse");
  });

  eventFooterContainer.append(eventSaveButton, eventCancelButton);
  if (eventType === "goal") {
    eventFooterContainer.append(goalDeleteButton);
  }
  if (eventType === "milestone") {
    eventFooterContainer.append(milestoneDeleteButton);
  }
  if (goal_id) {
    eventFooterContainer.append(goalEditorButton);
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
  eventInfoButtonContainer.appendChild(editButton);
  eventInfoContainer.append(tagsContainer, EventTitleContainer, eventParents);
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
  task_due_date_element
) => {
  const container = document.createElement("div");
  container.classList.add(
    `task-repeat-container-${task_id}`,
    "task-repeat-container",
    "row",
    "mb-3"
  );
  if (!task_id) {
    switch (task_repeat_frequency) {
      case 0:
        container.textContent = "Repeat message shouldn't exist";
        break;
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
    const repeatEndDateContainer = document.createElement("div");
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

    repeatEndDateContainer.classList.add(
      "repeat-end-date-container",
      "row",
      "mb-3"
    );
    repeatEndDateDescription.textContent = "Repeat until...";
    repeatEndDate.classList.add("event-due-date");
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
    repeatEndDateContainer.append(repeatEndDateDescription, repeatEndDate);
    container.append(selector, repeatEndDateContainer);
  }

  return container;
};
const createViewGoalButton = (goal_id) => {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-info", "edit-goal-button");
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
  button.classList.add("btn", "btn-light");
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
  button.classList.add("btn", "btn-light");
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

//還沒做完
const createTagComponent = () => {
  const tag = document.createElement("span");
  tag.classList.add("tag", "badge", "rounded-pill");
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
