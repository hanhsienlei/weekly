const renderGoalEditor = (goalId) => {
  fetch(`/api/goal/plan?goal_id=${goalId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const modal = document.querySelector("#modal-goal");
      const goalTitle = modal.querySelector(".goal-title");
      const goalDueDate = modal.querySelector(".goal-due-date");
      const goalDescription = modal.querySelector(".goal-description");
      //const purposeSelector = modal.querySelector(".purpose-selector");
      const goalSaveButton = modal.querySelector(".save-goal-button");
      const newMilestoneTitle = modal.querySelector(".new-milestone-title");
      const newMilestoneButton = modal.querySelector(".new-milestone-button");
      const saveGoal = () => {
        const body = {
          goal_id: goalId,
          goal_title: goalTitle.textContent.trim(),
          goal_due_date:
            goalDueDate.value.length == 10 ? goalDueDate.value : null,
          goal_due_date_unix: Math.ceil(
            new Date(goalDueDate.value + "T23:59:59")
          ),
          goal_description: goalDescription.textContent.trim(),
          //goal_purpose_id: goalPurposeId,
        };
        fetch("/api/goal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((err) => {
            console.log(err);
          });
      };
      const addNewMilestone = (e) => {
        const newTitle = newMilestoneTitle.value.trim();
        if (!newTitle) {
          return alert("Please name the milestone fore adding ");
        }
        const body = {
          milestone_title: newTitle,
          milestone_goal_id: goalId,
        };
        console.log(body);
        fetch("/api/milestone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
          .then((response) => response.json())
          .then((data) => {
            const milestoneId = data.milestone_id;
            console.log("newMilestoneButton: milestoneId: ", milestoneId);
            createMilestoneContainer(milestoneId, newTitle);
            newMilestoneTitle.value = "";
          })
          .catch((err) => {
            console.log(err);
          });
      };

      modal.dataset.goalId = goalId;
      goalTitle.textContent = data.g_title? data.g_title : "Goal title...";
      goalDueDate.value = data.g_due_date;
      goalDescription.textContent = data.g_description
        ? data.g_description
        : "Description of this goal......";
      goalSaveButton.addEventListener("click", saveGoal);
      newMilestoneButton.addEventListener("click", addNewMilestone);
      modal.addEventListener("hidden.bs.modal", () => {
        modal.querySelector(".milestones-container").innerHTML = "";
        goalSaveButton.removeEventListener("click", saveGoal);
        newMilestoneButton.removeEventListener("click", addNewMilestone);
      });
      if (data.milestones && data.milestones.length > 0) {
        data.milestones.forEach((milestone) => {
          const milestoneId = milestone.m_id;
          const milestoneDueDate = milestone.m_deu_date;
          createMilestoneContainer(
            milestoneId,
            milestone.m_title,
            milestone.m_due_date,
            milestone.m_description
          );
          if (milestone.tasks) {
            milestone.tasks.forEach((task) => {
              createTaskComponent(
                milestoneId,
                task.t_id,
                task.t_title,
                task.t_status,
                task.t_due_date,
                task.t_description,
                task.r_frequency,
                task.r_end_date,
                milestoneDueDate
              );
            });
          }
        });
      }

      //有空再做render purpose selector and set default value
      // purposes.forEach((purpose) => {
      //   const option = document.createElement("option");
      //   option.value = purpose.purpose_id;
      //   option.textContent = purpose.purpose_title;
      //   if (purpose.purpose_id == goalPurposeId) {
      //     option.setAttribute("Selected", "");
      //   }
      //   purposeSelector.appendChild(option);
      // });
    })
    .catch((err) => {
      console.log(err);
    });
};

const createMilestoneContainer = (
  milestoneId,
  title,
  dueDate = null,
  description = null
) => {
  const parent = document.querySelector(".milestones-container");
  const containerOuter = document.createElement("div");
  const containerInner = document.createElement("div");
  const milestoneContainer = document.createElement("div");
  const milestoneTitle = document.createElement("span");
  const milestoneEditButton = document.createElement("button");
  const milestoneEditorContainer = document.createElement("div");
  const milestoneDueDateContainer = document.createElement("div");
  const milestoneDueDate = document.createElement("input");
  const milestoneDescriptionContainer = document.createElement("div");
  const milestoneDescription = document.createElement("p");
  const milestoneTagsContainer = document.createElement("div");
  const milestoneSaveButtonContainer = document.createElement("div");
  const milestoneSaveButton = document.createElement("button");
  const tasksContainer = document.createElement("div");
  const addNewTaskContainer = document.createElement("div");
  const newTaskInputContainer = document.createElement("div");
  const newTaskInput = document.createElement("input");
  const newTaskButton = document.createElement("button");

  containerOuter.classList.add(
    "milestone-outer-container",
    "col-4",
    "overflow-auto",
    "smooth-scroll",
    `milestone-outer-container-${milestoneId}`
  );
  containerOuter.dataset.milestoneId = milestoneId;
  containerInner.classList.add("milestone-container", "card-body");
  milestoneContainer.classList.add("milestone-details", "row");
  milestoneTitle.classList.add("milestone-title");
  milestoneTitle.setAttribute("contenteditable", "true");
  milestoneTitle.textContent = title;
  milestoneEditButton.classList.add(
    "btn",
    "btn-light",
    "edit-button",
    "col-auto",
    "mb-3"
  );
  milestoneEditButton.setAttribute("type", "button");
  milestoneEditButton.setAttribute("data-bs-toggle", "collapse");
  milestoneEditButton.setAttribute(
    "data-bs-target",
    `.modal-milestone-editor-${milestoneId}`
  );
  milestoneEditButton.textContent = "✍";
  milestoneEditorContainer.classList.add(
    `modal-milestone-editor-${milestoneId}`,
    "row",
    "collapse"
  );
  milestoneDueDateContainer.classList.add(
    "milestone-due-date-container",
    "row",
    "mb-3",
    "px-2"
  );
  milestoneDueDate.type = "date";
  milestoneDueDate.classList.add("milestone-due-date");
  milestoneDueDate.value = dueDate;
  milestoneDescriptionContainer.classList.add(
    "milestone-description-container",
    "row",
    "mb-3"
  );
  milestoneDescription.classList.add("modal-milestone-description");
  milestoneDescription.setAttribute("contenteditable", "true");
  milestoneDescription.textContent = description
    ? description
    : "What's special about this milestone?";
  milestoneTagsContainer.classList.add(
    "milestone-tags-container",
    "row",
    "mb-3"
  );
  milestoneSaveButtonContainer.classList.add(
    "save-milestone-button-container",
    "col-auto",
    "mb-3"
  );
  milestoneSaveButton.classList.add(
    "save-milestone-button",
    "btn",
    "btn-primary"
  );
  milestoneSaveButton.textContent = "Save milestone";
  milestoneSaveButton.addEventListener("click", (e) => {
    const body = {};
    body.user_id = 1;
    body.milestone_id = milestoneId;
    body.milestone_title = milestoneTitle.textContent.trim();
    body.milestone_description = milestoneDescription.textContent.trim();
    body.milestone_due_date =
      milestoneDueDate.value.length == 10 ? milestoneDueDate.value : null;
    body.task_due_date_unix = Math.ceil(
      new Date(milestoneDueDate.value + "T23:59:59")
    );

    console.log("body: ", body);
    fetch(`/api/milestone`, {
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
  tasksContainer.classList.add("tasks-container", "row", "border-top", "pt-3");
  addNewTaskContainer.classList.add("add-new-task-container", "row", "px-2");
  newTaskInputContainer.classList.add("new-task-input-container", "col-10");
  newTaskInput.setAttribute("type", "text");
  newTaskInput.classList.add("new-task-title");
  newTaskInput.setAttribute("placeholder", "add new task");
  newTaskButton.classList.add("add-new-task-button", "btn", "col-2");
  newTaskButton.textContent = "+";
  newTaskButton.addEventListener("click", (e) => {
    const newTaskTitle = newTaskInput.value.trim();
    if (!newTaskTitle) {
      return alert("Please name the task before adding");
    }
    const body = {};
    body.user_id = 1;
    body.task_title = newTaskTitle;
    body.task_milestone_id = milestoneId;

    console.log("body: ", body);
    fetch(`/api/task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        const taskId = data.task_id;
        console.log(taskId);
        createTaskComponent(
          milestoneId,
          taskId,
          newTaskTitle,
          0,
          null,
          null,
          null,
          null,
          null
        );
        newTaskInput.value = "";
      })
      .catch((err) => {
        console.log(err);
      });
  });

  parent.append(containerOuter);
  containerOuter.append(containerInner);
  containerInner.append(
    milestoneContainer,
    tasksContainer,
    addNewTaskContainer
  );
  milestoneContainer.append(
    milestoneTitle,
    milestoneEditButton,
    milestoneEditorContainer
  );
  milestoneEditorContainer.append(
    milestoneDueDateContainer,
    milestoneDescriptionContainer,
    milestoneTagsContainer,
    milestoneSaveButtonContainer
  );
  milestoneDueDateContainer.append(milestoneDueDate);
  milestoneDescriptionContainer.append(milestoneDescription);
  milestoneSaveButtonContainer.append(milestoneSaveButton);
  addNewTaskContainer.append(newTaskInputContainer, newTaskButton);
  newTaskInputContainer.appendChild(newTaskInput);
};

const createTaskComponent = (
  milestoneId,
  id,
  title,
  status,
  dueDate,
  description,
  task_repeat_frequency = 0,
  task_repeat_end_date = "2100-01-01",
  milestone_due_date = "2100-01-01"
) => {
  const milestoneContainer = document.querySelector(
    `.milestone-outer-container-${milestoneId}`
  );
  const parentContainer = milestoneContainer.querySelector(`.tasks-container`);
  const eventOuterContainer = document.createElement("div");
  //const eventToggle = document.createElement("a")
  const eventHeaderContainer = document.createElement("div");
  const eventInfoContainer = document.createElement("div");
  const tagsContainer = document.createElement("div");
  const EventTitleContainer = document.createElement("div");
  const checkBox = document.createElement("input");
  const eventTitle = document.createElement("span");
  const eventInfoButtonContainer = document.createElement("div");
  const editButton = document.createElement("button");
  const eventEditor = document.createElement("div");
  const eventDueDateContainer = document.createElement("div");
  const eventDueDate = document.createElement("input");
  const eventDescriptionContainer = document.createElement("div");
  const eventDescription = document.createElement("p");
  const taskRepeatSelectorContainer = createTaskRepeatSelector(
    id,
    task_repeat_frequency,
    task_repeat_end_date,
    dueDate,
    milestone_due_date
  );
  const eventFooterContainer = document.createElement("div");
  const eventSaveButton = document.createElement("button");
  const eventCancelButton = document.createElement("button");

  eventOuterContainer.classList.add(
    `task-outer-container`,
    "card",
    "col-12",
    "mb-2"
  );
  eventOuterContainer.setAttribute("id", `task-${id}`);
  //eventToggle.classList.add("event-toggle");
  // editButton.addEventListener("click", (e) => {
  //   e.target.removeAttribute("data-bs-toggle");
  // });
  //eventToggle.setAttribute("data-bs-toggle", "collapse");
  //eventToggle.setAttribute("data-bs-target", `#editor-${eventType}-${id}`)
  eventHeaderContainer.classList.add("event-header-container", "row", "mb-3");
  eventInfoContainer.classList.add("event-info-container", "col-10");
  tagsContainer.classList.add("tags-container");
  EventTitleContainer.classList.add("event-title-container", "my-2");
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
    body.task_id = id;
    body.task_title = eventTitle.textContent;
    body.task_description = eventDescription.textContent;
    body.task_status = isCheckedNew ? 1 : 0;
    body.task_due_date =
      eventDueDate.value.length == 10 ? eventDueDate.value : null;
    body.task_due_date_unix = Math.ceil(
      new Date(eventDueDate.value + "T23:59:59")
    );

    console.log("[checkbox] body: ", body);
    fetch(`/api/task`, {
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
  eventTitle.classList.add("event-title");
  eventTitle.setAttribute("contenteditable", "true");
  eventTitle.textContent = title;
  eventInfoButtonContainer.classList.add(
    "event-info-button-container",
    "col-2"
  );
  editButton.classList.add("btn", "btn-light", "edit-button");
  editButton.setAttribute("type", "button");
  editButton.setAttribute("data-bs-toggle", "collapse");
  editButton.setAttribute("data-bs-target", `#modal-task-editor-${id}`);
  editButton.textContent = "✍";
  eventEditor.classList.add("event-editor", "row", "collapse");
  eventEditor.setAttribute("id", `modal-task-editor-${id}`);
  eventDueDateContainer.classList.add(
    "event-due-date-container",
    "row",
    "mb-3"
  );
  eventDueDate.classList.add("event-due-date");
  eventDueDate.setAttribute("type", "date");
  eventDueDate.value = dueDate;
  eventDescriptionContainer.classList.add(
    "event-description-container",
    "row",
    "mb-3"
  );
  eventDescription.classList.add("event-description");
  eventDescription.setAttribute("contenteditable", "true");
  eventDescription.textContent = description
    ? description
    : "what is this task about?";

  eventFooterContainer.classList.add("event-footer-container", "row", "mb-3");
  eventSaveButton.textContent = "save";
  eventSaveButton.classList.add(
    "col-4",
    "btn",
    "btn-light",
    "save-button",
    `save-button-task`
  );
  eventSaveButton.setAttribute("type", "button");
  eventSaveButton.setAttribute("data-bs-toggle", "collapse");
  eventSaveButton.setAttribute("data-bs-target", `#modal-task-editor-${id}`);
  eventSaveButton.addEventListener("click", (e) => {
    const body = {};
    body.user_id = 1;
    body.task_id = id;
    body.task_title = eventTitle.textContent;
    body.task_description = eventDescription.textContent;
    body.task_status = checkBox.hasAttribute("checked") ? 1 : 0;
    body.task_due_date = eventDueDate.value;
    body.task_due_date_unix = Math.ceil(
      new Date(eventDueDate.value + "T23:59:59")
    );
    const repeatSelector = taskRepeatSelectorContainer.querySelector("select");
    const task_r_frequency =
      repeatSelector.options[repeatSelector.selectedIndex].value;
    const task_repeat = task_r_frequency != 0 ? 1 : 0;
    const task_r_end_date =
      taskRepeatSelectorContainer.querySelector("input").value ||
      taskRepeatSelectorContainer.querySelector("input").max;
    body.task_repeat = task_repeat;
    body.task_r_frequency = task_r_frequency;
    body.task_r_end_date = task_r_end_date || "2100-01-01";
    body.task_r_end_date_unix = Math.ceil(
      new Date(task_r_end_date + "T23:59:59")
    );
    console.log("body: ", body);
    fetch(`/api/task`, {
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
  eventCancelButton.textContent = "x";
  eventCancelButton.classList.add("col-4", "btn", "btn-light", "cancel-button");
  eventCancelButton.setAttribute("type", "button");
  eventCancelButton.setAttribute("data-bs-toggle", "collapse");
  eventCancelButton.setAttribute("data-bs-target", `#modal-task-editor-${id}`);
  eventCancelButton.addEventListener("click", (e) => {
    editButton.setAttribute("data-bs-toggle", "collapse");
  });

  eventFooterContainer.append(eventSaveButton, eventCancelButton);
  eventDescriptionContainer.appendChild(eventDescription);
  eventDueDateContainer.appendChild(eventDueDate);
  eventEditor.append(
    eventDueDateContainer,
    eventDescriptionContainer,
    eventFooterContainer
  );
  eventDescriptionContainer.after(taskRepeatSelectorContainer);
  EventTitleContainer.append(checkBox, eventTitle);
  eventInfoButtonContainer.appendChild(editButton);
  eventInfoContainer.append(tagsContainer, EventTitleContainer);
  eventHeaderContainer.append(eventInfoContainer, eventInfoButtonContainer);
  //eventHeaderContainer.append(eventInfoContainer);
  //eventToggle.append(eventHeaderContainer, eventEditor);
  //eventOuterContainer.append(eventToggle);
  eventOuterContainer.append(eventHeaderContainer, eventEditor);
  parentContainer.appendChild(eventOuterContainer);
};

const renderMilestone = (milestoneId) => {};

const resetModal = () => {
  const modal = document.querySelector("#modal-goal");
  modal.addEventListener("hidden.bs.modal", (e) => {
    modal.querySelector(".milestones-container").innerHTML = "";
  });
};

resetModal();
