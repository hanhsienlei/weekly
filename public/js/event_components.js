const REPEAT_FREQUENCY = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
};

const deleteGoalAndChildren = (goalId) => {
  Swal.fire({
    title: "Are you sure?",
    text: "All the milestones and tasks will be gone too.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#fa8181",
    cancelButtonColor: "#636363",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      const accessToken = localStorage.getItem("access_token");
      fetch(`/api/goal?goal_id=${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            Swal.fire({
              title: "Something went wrong.",
              text: "Please try again",
              icon: "error",
              showCancelButton: false,
            });
            return;
          }
          if (data.affectedRows > 0) {
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

            if (window.location.pathname.includes("review")) {
              initializePage();
            }
          } else {
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
    }
  });
};

const deleteMilestoneAndChildren = (milestoneId) => {
  Swal.fire({
    title: "Are you sure?",
    text: "All the tasks will be gone too.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#fa8181",
    cancelButtonColor: "#636363",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      const accessToken = localStorage.getItem("access_token");
      fetch(`/api/milestone?milestone_id=${milestoneId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            Swal.fire({
              title: "Something went wrong.",
              text: "Please try again",
              icon: "error",
              showCancelButton: false,
            });
            return;
          }
          if (data.affectedRows > 0) {
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
            const goalModal = document.querySelector("#modal-goal");
            const parent = goalModal.querySelector(".milestones-container");
            const currentContainer = goalModal.querySelector(
              `.milestone-outer-container-${milestoneId}`
            );
            if (currentContainer) {
              parent.removeChild(currentContainer);
            }
          } else {
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
    }
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
  taskRepeatFrequency = 0,
  taskRepeatEndDate = null,
  milestoneId = null,
  milestoneDueDate = null,
  goalId = null,
  goalDueDate = null,
  goalCategory = 0,
  taskOriginId = null,
  taskOriginDate = null
) => {
  const accessToken = localStorage.getItem("access_token");
  let parentContainer = document.querySelector(
    `.${timeScale}-events-container`
  );
  const eventOuterContainer = document.createElement("div");
  const eventHeaderContainer = document.createElement("div");
  const eventInfoContainer = document.createElement("div");
  const eventLabelContainer = document.createElement("div");
  const eventLabel = document.createElement("span");
  const eventLabelDate = document.createElement("span");
  const editButton = document.createElement("span");
  const eventTitleContainer = document.createElement("div");
  const checkBoxContainer = document.createElement("div");

  const checkBox = document.createElement("input");
  const eventTitleContentContainer = document.createElement("div");
  const eventTitle = document.createElement("input");
  const eventParentsContainer = document.createElement("div");
  const eventGoalCategoryIcon = document.createElement("span");
  const eventParents = document.createElement("span");
  const eventParentsIcon = document.createElement("span");
  const eventEditor = document.createElement("div");
  const eventDueDateContainer = document.createElement("div");
  const eventDueDateLabel = document.createElement("span");
  const eventDueDate = document.createElement("input");
  const eventDescriptionContainer = document.createElement("div");
  const eventDescriptionLabel = document.createElement("span");
  const eventDescription = document.createElement("textarea");
  const taskRepeatSelectorContainer =
    eventType === "task"
      ? createTaskRepeatSelector(
          id,
          taskRepeatFrequency,
          taskRepeatEndDate,
          dueDate,
          milestoneDueDate,
          eventDueDate,
          taskOriginId
        )
      : null;
  const taskRepeatSelector = taskRepeatSelectorContainer
    ? taskRepeatSelectorContainer.querySelector("select")
    : null;
  const taskRepeatEndDateSelector = taskRepeatSelectorContainer
    ? taskRepeatSelectorContainer.querySelector("input")
    : null;

  const eventFooterContainer = document.createElement("div");
  const eventSaveButton = document.createElement("button");
  const taskDeleteButton =
    eventType === "task"
      ? createDeleteTaskButton(
          id,
          taskOriginId,
          taskOriginDate,
          title,
          taskRepeatFrequency,
          parentContainer,
          eventOuterContainer
        )
      : null;
  const stopRepeatButton =
    taskOriginId && !id
      ? createStopTodayButton(
          taskOriginId,
          dueDate
        )
      : null;
  const goalDeleteButton =
    eventType === "goal" ? createDeleteGoalButton(id) : null;
  const milestoneDeleteButton =
    eventType === "milestone" ? createDeleteMilestoneButton(id, goalId) : null;

  const saveEvent = (relocateEvent) => {
    if (!eventTitle.value.trim()) {
      Swal.fire({
        title: `${eventType} title cannot be empty`,
        icon: "warning",
        showCancelButton: false,
      }).then(() => {
        eventTitle.value = title;
      });
    } else {
      const body = {};
      body[`${eventType}Id`] = id;
      body[`${eventType}Title`] = eventTitle.value.trim();
      body[`${eventType}Description`] = eventDescription.value;
      body[`${eventType}Status`] = checkBox.hasAttribute("checked") ? 1 : 0;
      body[`${eventType}DueDate`] = eventDueDate.value;
      body.taskOriginId = taskOriginId;
      body.taskOriginDate = taskOriginDate;

      if (taskRepeatSelector) {
        const taskRepeatFrequency =
          taskRepeatSelector.options[taskRepeatSelector.selectedIndex].value;
        const taskRepeat = taskRepeatFrequency != 0 ? 1 : 0;
        const taskRepeatEndDate = taskRepeatEndDateSelector.value;
        body.taskRepeat = taskRepeat;
        body.taskRepeatFrequency = taskRepeatFrequency;
        body.taskRepeatEndDate = taskRepeatEndDate;

        if (taskRepeat && taskRepeatEndDate < eventDueDate.value) {
          Swal.fire({
            title: "Invalid repeat rule",
            text: "Repeat end date should be later than starting date. ",
            icon: "error",
            showCancelButton: false,
          });
          return;
        }
      }

      let apiEndpoint = "";
      if (!id && taskOriginId) {
        apiEndpoint = `/api/repeated-task/new`;
      } else if (taskOriginId) {
        apiEndpoint = `/api/repeated-task/saved`;
      } else {
        apiEndpoint = `/api/${eventType}`;
      }

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
          if (data.error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: data.error,
            });
            eventDueDate.value = dueDate;
            eventLabelDate.textContent = dueDate;
            return;
          }
          const alertText = taskOriginId
            ? "Update successfully. The rest of the repeating tasks remain the same."
            : "Update successfully";
          Swal.fire({
            icon: "success",
            title: "All good!",
            text: alertText,
            showConfirmButton: false,
          });
          if (window.location.pathname.includes("horizon")) {
            const currentDate =
              document.querySelector(".date-value").dataset.dueDate;
            renderEvents(currentDate);
          }

          const newEventDueDate = new Date(eventDueDate.value);
          if (!window.location.pathname.includes("horizon") || !relocateEvent) {
            return;
          } else {
            const eventContainers =
              document.querySelectorAll(".events-container");
            const containerDueDates = [];
            eventContainers.forEach((c) =>
              containerDueDates.push(c.dataset.dueDate)
            );

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
    }
  };

  eventOuterContainer.classList.add(
    `${eventType}-outer-container`,
    "event-outer-container",
    "card",
    "col-12",
    "mb-2"
  );
  eventOuterContainer.setAttribute("id", `${eventType}-${id}`);
  eventOuterContainer.setAttribute("data-milestone-id", milestoneId);
  eventOuterContainer.setAttribute("data-milestone-due-date", milestoneDueDate);
  eventOuterContainer.setAttribute("data-goal-id", goalId);
  eventOuterContainer.setAttribute("data-goal-due-date", goalDueDate);
  if (taskOriginId) {
    eventOuterContainer.setAttribute("data-origin-id", taskOriginId);
  }
  eventOuterContainer.setAttribute("data-goal-due-date", goalDueDate);
  eventOuterContainer.classList.add("event-info-container", "col-10");
  eventHeaderContainer.classList.add(
    "event-header-container",
    "row",
    "mt-1",
    "mb-3"
  );
  eventLabelContainer.classList.add("event-label-container", "mb-1", "col-12");
  eventLabel.classList.add(
    "event-label",
    `${eventType}-label`,
    "badge",
    "rounded-pill"
  );
  eventLabel.textContent = eventType;
  eventLabelDate.classList.add(
    "event-label",
    "event-label-date",
    "badge",
    "rounded-pill"
  );
  eventLabelDate.textContent = dueDate;
  editButton.classList.add("edit-button", "material-icons", "align-middle");
  editButton.setAttribute("data-bs-toggle", "tooltip");
  editButton.setAttribute("data-bs-placement", "top");
  editButton.setAttribute("title", `Edit`);
  editButton.setAttribute("data-bs-toggle", "collapse");
  editButton.setAttribute("data-bs-target", `#editor-${eventType}-${id}`);
  editButton.textContent = "mode_edit";
  eventTitleContainer.classList.add("event-title-container", "mb-1", "d-flex");
  checkBoxContainer.classList.add("check-box-container", "col-1");

  checkBox.classList.add("form-check-input");
  checkBox.type = "checkbox";
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
    const relocateEvent = timeScale.includes("milestone") ? 0 : 1;

    saveEvent(relocateEvent);
  });
  eventTitleContentContainer.classList.add(
    "event-title-content-container",
    "w-100"
  );
  eventTitle.classList.add("event-title", "off-focus", "w-100", "d-block");
  eventTitle.type = "text";
  eventTitle.setAttribute("placeholder", `${eventType} name`);
  eventTitle.value = title;
  eventTitle.addEventListener("focus", (e) => {
    eventTitle.classList.remove("off-focus");
  });
  eventTitle.addEventListener("blur", (e) => {
    eventTitle.classList.add("off-focus");
  });
  eventTitle.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      saveEvent();
    }
  });

  eventParentsContainer.classList.add("event-parents-container");
  eventGoalCategoryIcon.classList.add(
    "material-icons",
    "align-middle",
    "event-goal-category-icon"
  );
  eventParents.classList.add("event-parents", "mt-1", "mb-2", "align-middle");
  eventParentsIcon.classList.add(
    "material-icons",
    "align-middle",
    "event-parents-icon"
  );
  eventParentsIcon.setAttribute("data-bs-toggle", "tooltip");
  eventParentsIcon.setAttribute("data-bs-placement", "top");
  eventParentsIcon.setAttribute("title", "Check out goal");
  eventParentsIcon.setAttribute("data-bs-toggle", "modal");
  eventParentsIcon.setAttribute("data-bs-target", "#modal-goal");
  eventParentsIcon.setAttribute("onclick", `renderGoalEditor(${goalId})`);
  if (parents != "．") {
    eventParents.textContent = parents ? parents : null;
    eventGoalCategoryIcon.textContent = categoryMaterialIcons[goalCategory];
    eventParentsIcon.textContent = "zoom_in";
  }

  if (parents == null) {
    eventParents.textContent = null;
    eventParentsIcon.textContent = null;
  }

  if (eventType === "goal") {
    eventParents.textContent = "check out goal";
    eventGoalCategoryIcon.textContent = categoryMaterialIcons[goalCategory];
    eventParentsIcon.textContent = "zoom_in";
  }

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
  eventDueDateLabel.textContent = `${eventType} due date`;
  eventDueDate.classList.add(
    "event-due-date",
    `due-date-${eventType}-${id}`,
    "form-control"
  );
  eventDueDate.type = "date";
  eventDueDate.value = dueDate;
  switch (eventType) {
    case "milestone":
      eventDueDate.setAttribute("max", goalDueDate);
      break;
    case "goal":
      eventDueDate.setAttribute("max", milestoneDueDate);
      break;
  }

  if (taskOriginDate) {
    eventDueDate.setAttribute("data-origin-date", taskOriginDate);
  }

  eventDueDate.addEventListener("change", (e) => {
    eventLabelDate.textContent = eventDueDate.value;
  });

  eventDescriptionContainer.classList.add(
    "event-description-container",
    "row",
    "mb-3"
  );
  eventDescriptionLabel.textContent = `${eventType} description`;
  eventDescription.classList.add(
    "event-description",
    `event-description-${eventType}-${id}`,
    "off-focus",
    "form-control"
  );
  eventDescription.setAttribute(
    "placeholder",
    `Description of the ${eventType}`
  );
  eventDescription.value = description;
  eventDescription.addEventListener("focus", (e) => {
    eventDescription.classList.remove("off-focus");
  });
  eventDescription.addEventListener("blur", (e) => {
    eventDescription.classList.add("off-focus");
  });

  eventDueDate.addEventListener("change", () => {
    if (taskRepeatSelector) {
      taskRepeatEndDateSelector.min = eventDueDate.value;
      if (taskRepeatEndDateSelector.value < eventDueDate.value) {
        taskRepeatEndDateSelector.value = eventDueDate.value;
      }
    }
  });

  eventFooterContainer.classList.add("event-footer-container", "row", "mb-3");
  eventSaveButton.textContent = "save";
  eventSaveButton.classList.add(
    "col-6",
    "btn",
    "btn-outline-success",
    "save-button",
    `save-button-${eventType}-${id}`
  );
  eventSaveButton.setAttribute("type", "button");
  eventSaveButton.setAttribute("data-bs-toggle", "collapse");

  eventSaveButton.setAttribute("data-bs-target", `#editor-${eventType}-${id}`);
  const saveAndRelocateEvent = () => {
    const relocateEvent = timeScale.includes("milestone") ? 0 : 1;
    saveEvent(relocateEvent);
  };

  eventSaveButton.addEventListener("click", saveAndRelocateEvent);

  eventFooterContainer.append(eventSaveButton);

  if (eventType === "task") {
    eventFooterContainer.append(taskDeleteButton);
  }

  if (eventType === "goal") {
    eventFooterContainer.append(goalDeleteButton);
  }
  if (eventType === "milestone") {
    eventFooterContainer.append(milestoneDeleteButton);
  }
  if (stopRepeatButton) {
    eventFooterContainer.append(stopRepeatButton);
  }

  eventDescriptionContainer.append(eventDescriptionLabel, eventDescription);
  eventDueDateContainer.append(eventDueDateLabel, eventDueDate);
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
  eventLabelContainer.append(eventLabel, eventLabelDate, editButton);
  if (eventType === "task") {
    eventTitleContainer.append(checkBoxContainer);
  }
  eventTitleContainer.append(eventTitleContentContainer);
  if (taskRepeatFrequency > 0 || taskOriginId) {
    const repeatIcon = document.createElement("span");
    repeatIcon.classList.add(
      "material-icons",
      "icon-task-repeat",
      "align-middle"
    );
    repeatIcon.textContent = "event_repeat";
    repeatIcon.setAttribute("data-bs-toggle", "tooltip");
    repeatIcon.setAttribute("data-bs-placement", "top");
    repeatIcon.setAttribute("title", "Reoccurring task");
    eventLabelDate.after(repeatIcon);
  }
  if (eventParents.textContent) {
    eventParentsContainer.append(
      eventGoalCategoryIcon,
      eventParents,
      eventParentsIcon
    );
  }

  eventInfoContainer.append(
    eventLabelContainer,
    eventTitleContainer,
    eventParentsContainer
  );

  eventHeaderContainer.append(eventInfoContainer);
  eventOuterContainer.append(eventHeaderContainer, eventEditor);
  parentContainer.appendChild(eventOuterContainer);
};

const createTaskRepeatSelector = (
  taskId,
  taskRepeatFrequency,
  taskRepeatEndDate,
  minDate,
  maxDate,
  taskDueDateElement,
  taskOriginId
) => {
  const container = document.createElement("div");
  container.classList.add(
    `task-repeat-container-${taskId}`,
    "task-repeat-container",
    "row",
    "mb-3"
  );
  if (taskOriginId) {
    switch (taskRepeatFrequency) {
      case REPEAT_FREQUENCY.DAILY:
        container.textContent = `Repeated daily until ${taskRepeatEndDate}`;
        break;
      case REPEAT_FREQUENCY.WEEKLY:
        container.textContent = `Repeated weekly until ${taskRepeatEndDate}`;
        break;
      case REPEAT_FREQUENCY.MONTHLY:
        container.textContent = `Repeated monthly until ${taskRepeatEndDate}`;
        break;
    }
  } else {
    const repeatDescription = document.createElement("span");
    const selector = document.createElement("select");
    const optionNoRepeat = document.createElement("option");
    const optionEveryday = document.createElement("option");
    const optionOnceAWeek = document.createElement("option");
    const optionOnceAMonth = document.createElement("option");
    const repeatEndDateDescription = document.createElement("span");
    const repeatEndDate = document.createElement("input");
    repeatDescription.classList.add("repeat-description");
    repeatDescription.textContent = "Repeat";
    selector.classList.add(
      "task-repeat-selector",
      "form-control",
      "form-selector",
      "mb-1"
    );
    optionNoRepeat.setAttribute("value", 0);
    optionNoRepeat.textContent = "No repeat";
    optionNoRepeat.setAttribute("selected", "true");
    optionEveryday.setAttribute("value", REPEAT_FREQUENCY.DAILY);
    optionEveryday.textContent = "Everyday";
    optionOnceAWeek.setAttribute("value", REPEAT_FREQUENCY.WEEKLY);
    optionOnceAWeek.textContent = "Once a week";
    optionOnceAMonth.setAttribute("value", REPEAT_FREQUENCY.MONTHLY);
    optionOnceAMonth.textContent = "Once a month";
    repeatEndDateDescription.classList.add("repeat-end-date-description");
    repeatEndDateDescription.textContent = "Until...";
    repeatEndDate.classList.add("event-due-date", "col", "form-control");
    repeatEndDate.type = "date";
    if (!taskRepeatFrequency) {
      repeatEndDate.setAttribute("disabled", "true");
    }
    repeatEndDate.value = taskRepeatEndDate;
    repeatEndDate.setAttribute("min", minDate);
    repeatEndDate.setAttribute("max", maxDate);
    selector.addEventListener("change", (e) => {
      if (selector.value == 0) {
        repeatEndDate.setAttribute("disabled", "true");
      } else {
        repeatEndDate.removeAttribute("disabled");
        repeatEndDate.setAttribute("min", taskDueDateElement.value);
      }
    });
    switch (taskRepeatFrequency) {
      case 0:
        optionNoRepeat.setAttribute("selected", "true");
        repeatEndDate.setAttribute("disabled", "true");
        repeatEndDate.value = null;
        break;
      case REPEAT_FREQUENCY.DAILY:
        optionEveryday.setAttribute("selected", "true");
        break;
      case REPEAT_FREQUENCY.WEEKLY:
        optionOnceAWeek.setAttribute("selected", "true");
        break;
      case REPEAT_FREQUENCY.MONTHLY:
        optionOnceAMonth.setAttribute("selected", "true");
        break;
    }
    selector.append(
      optionNoRepeat,
      optionEveryday,
      optionOnceAWeek,
      optionOnceAMonth
    );

    container.append(
      repeatDescription,
      selector,
      repeatEndDateDescription,
      repeatEndDate
    );
  }

  return container;
};

const createDeleteTaskButton = (
  id,
  taskOriginId,
  taskOriginDate,
  title,
  taskRepeatFrequency,
  parentContainer,
  eventOuterContainer
) => {
  const button = document.createElement("button");
  button.textContent = "delete";
  button.classList.add(
    "col-6",
    "btn",
    "ｘ",
    "delete-task-button",
    "btn-outline-danger"
  );
  button.setAttribute("type", "button");
  button.setAttribute("data-bs-toggle", "collapse");
  button.setAttribute("data-bs-target", `#editor-task-${id}`);
  if (taskRepeatFrequency > 0) {
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
      confirmButtonColor: "#fa8181",
      cancelButtonColor: "#636363",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        let apiEndpoint = "";
        if (!id && taskOriginId) {
          apiEndpoint = `/api/repeated-task/new?task_origin_id=${taskOriginId}&task_origin_date=${taskOriginDate}`;
        } else if (taskOriginId) {
          apiEndpoint = `/api/repeated-task/saved?task_id=${id}`;
        } else {
          apiEndpoint = `/api/task?task_id=${id}`;
        }
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
              parentContainer.removeChild(eventOuterContainer);
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
