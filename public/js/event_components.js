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

        if (window.location.pathname.includes("horizon")) {
          const currentDate =
            document.querySelector(".date-value").dataset.dueDate;
          renderEvents(currentDate);
        }
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
  console.log("delete milestone : ", milestoneId);
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
        if (window.location.pathname.includes("horizon")) {
          const currentDate =
            document.querySelector(".date-value").dataset.dueDate;
          renderEvents(currentDate);
        }
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
  const eventHeaderContainer = document.createElement("div");
  const eventInfoContainer = document.createElement("div");
  const EventTitleContainer = document.createElement("div");
  const checkBoxContainer = document.createElement("div");

  const checkBox = document.createElement("input");
  const eventTitleContentContainer = document.createElement("div");
  const eventTitle = document.createElement("input");

  const eventInfoButtonContainer = document.createElement("div");
  const editButton = document.createElement("button");
  const eventParents = document.createElement("h6");

  const eventEditor = document.createElement("div");
  const eventDueDateContainer = document.createElement("div");
  const eventDueDate = document.createElement("input");
  const eventDescriptionContainer = document.createElement("div");
  const eventDescription = document.createElement("textarea");
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
  const taskDeleteButton = eventType === "task" ? createDeleteTaskButton(
    id,
    task_origin_id,
    task_origin_date,
    title,
    task_repeat_frequency,
    parentContainer,
    eventOuterContainer
  ): null
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
    body[`${eventType}_title`] = eventTitle.value;
    body[`${eventType}_description`] = eventDescription.value;
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
      console.log(body)
      if(!task_r_end_date){

      }else if (task_repeat && task_r_end_date < eventDueDate.value) {
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
        if (window.location.pathname.includes("horizon")) {
          const currentDate =
            document.querySelector(".date-value").dataset.dueDate;
          renderEvents(currentDate);
        }

        const newEventDueDate = new Date(eventDueDate.value);
        if (!window.location.pathname.includes("horizon")) {
          return
        }else {
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
  eventTitle.classList.add("event-title", "off-focus");
  eventTitle.setAttribute("type", "text");
  eventTitle.setAttribute("placeholder", `${eventType} name`);
  eventTitle.value = title;
  eventTitle.addEventListener("focus", e => {
    console.log("click")
  eventTitle.classList.remove("off-focus")
  })
  eventTitle.addEventListener("blur", e => {
  eventTitle.classList.add("off-focus");
  })


  eventParents.classList.add("event-parents", "mt-1", "mb-2", "text-muted");

  if (parents != ">>") {
    eventParents.setAttribute("data-bs-toggle", "modal");
    eventParents.setAttribute("data-bs-target", "#modal-goal");
    eventParents.setAttribute("onclick", `renderGoalEditor(${goal_id})`);
    eventParents.textContent = parents + " 🔍";
  }
  if (eventType === "goal") {
    console.log("add check goalll for goallll")
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
    "off-focus"
  );
  eventDescription.setAttribute("placeholder", `Description of the ${eventType}`)
  eventDescription.value = description
  eventDescription.addEventListener("focus", e => {
    console.log("click")
  eventDescription.classList.remove("off-focus")
  })
  eventDescription.addEventListener("blur", e => {
  eventDescription.classList.add("off-focus");
  })

  eventDueDate.addEventListener("change", () => {
    if (taskRepeatSelector) {
      taskRepeatEndDate.min = eventDueDate.value;
      if (taskRepeatEndDate.value < eventDueDate.value) {
        taskRepeatEndDate.value = eventDueDate.value;
      }
    }
  });

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
  if(eventType === "task"){
    EventTitleContainer.append(
    checkBoxContainer,
  );
  }
  EventTitleContainer.append(
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