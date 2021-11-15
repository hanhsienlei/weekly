// const accessToken = localStorage.getItem("access_token");
const renderGoalEditor = (goalId) => {
  fetch(`/api/goal/plan?goal_id=${goalId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const modal = document.querySelector("#modal-goal");
      const goalTitle = modal.querySelector(".goal-title");
      const deleteGoalButton = modal.querySelector(
        ".editor-delete-goal-button"
      );
      const goalDueDate = modal.querySelector(".goal-due-date");
      const goalDescription = modal.querySelector(".goal-description");
      //const purposeSelector = modal.querySelector(".purpose-selector");
      const goalSaveButton = modal.querySelector(".save-goal-button");
      const newMilestoneTitle = modal.querySelector(".new-milestone-title");
      const newMilestoneButton = modal.querySelector(".new-milestone-button");
      const saveGoal = () => {
        const body = {
          goal_id: goalId,
          goal_title: goalTitle.value.trim(),
          goal_due_date: goalDueDate.value,
          goal_due_date_unix: Math.ceil(
            new Date(goalDueDate.value + "T23:59:59")
          ),
          goal_description: goalDescription.value.trim(),
          //goal_purpose_id: goalPurposeId,
        };

        fetch("/api/goal", {
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
        Swal.fire({
          icon: "success",
          title: "All good!",
          text: "Update successfully",
        });
          })
          .catch((err) => {
            console.log(err);
          });
      };
      const addNewMilestone = (e) => {
        const newTitle = newMilestoneTitle.value.trim();
        if (!newTitle) {
          return alert("Please name the milestone before adding ");
        }
        const body = {
          milestone_title: newTitle,
          milestone_status: 0,
          milestone_goal_id: goalId,
          milestone_due_date: goalDueDate.value,
        };
        console.log(body);
        fetch("/api/milestone", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })
          .then((response) => response.json())
          .then((data) => {
            const milestoneId = data.milestone_id;
            console.log("newMilestoneButton: milestoneId: ", milestoneId);
            createMilestoneContainer(
              milestoneId,
              newTitle,
              goalDueDate.value,
              null,
              goalId
            );
            newMilestoneTitle.value = "";
          })
          .catch((err) => {
            console.log(err);
          });
      };

      modal.dataset.goalId = goalId;
      goalTitle.value = data.g_title;
      deleteGoalButton.setAttribute(
        "onclick",
        `deleteGoalAndChildren(${goalId})`
      );
      goalDueDate.value = data.g_due_date;
      goalDescription.value = data.g_description
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
          if (milestone.m_status > -1) {
            createMilestoneContainer(
              milestoneId,
              milestone.m_title,
              milestone.m_due_date,
              milestone.m_description,
              goalId
            );
          }
          if (milestone.tasks) {
            milestone.tasks.forEach((task) => {
              if (task.t_status > -1 || !task.t_origin_id) {
                // createTaskComponent(
                //   milestoneId,
                //   task.t_id,
                //   task.t_title,
                //   task.t_status,
                //   task.t_due_date,
                //   task.t_description,
                //   task.r_frequency,
                //   task.r_end_date,
                //   milestoneDueDate
                // );
                createEventComponent(
                  `milestone-${milestoneId}`,
                  "task",
                  task.t_id,
                  task.t_title,
                  task.t_status,
                  task.t_due_date,
                  task.t_description,
                  null,
                  task.r_frequency,
                  task.r_end_date,
                  milestoneId,
                  milestone.m_due_date,
                  goalId,
                  goalDueDate.value,
                  task.t_origin_id,
                  null
                );
              }
            });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const createMilestoneContainer = (
  milestoneId,
  title,
  dueDate = null,
  description = null,
  goalDueDate = null,
  goalId
) => {
  const parent = document.querySelector(".milestones-container");
  const containerOuter = document.createElement("div");
  const containerInner = document.createElement("div");
  const milestoneContainer = document.createElement("div");
  const milestoneLabelContainer = document.createElement("div");
  const milestoneLabel = document.createElement("span");
  const milestoneTitleContainer = document.createElement("div");
  const milestoneTitle = document.createElement("input");
  const milestoneEditButton = document.createElement("span");
  const milestoneEditorContainer = document.createElement("div");
  // const milestoneDueDateContainer = document.createElement("div");
  const milestoneDueDate = document.createElement("input");
  // const milestoneDescriptionContainer = document.createElement("div");
  const milestoneDescription = document.createElement("textarea");
  // const milestoneTagsContainer = document.createElement("div");
  const milestoneButtonsContainer = document.createElement("div")
  // const milestoneSaveButtonContainer = document.createElement("div");
  const milestoneSaveButton = document.createElement("button");
  // const milestoneDeleteButtonContainer = document.createElement("div");
  const milestoneDeleteButton = document.createElement("button");
  const tasksContainer = document.createElement("div");
  const addNewTaskContainer = document.createElement("div");
  // const newTaskInputContainer = document.createElement("div");
  const newTaskInput = document.createElement("input");
  const newTaskButton = document.createElement("button");

  containerOuter.classList.add(
    "milestone-outer-container",
    "col-4",
    "overflow-auto",
    "smooth-scroll",
    `milestone-outer-container-${milestoneId}`,
    "mr-2"
  );
  containerOuter.dataset.milestoneId = milestoneId;
  containerInner.classList.add("milestone-container", "card-body");
  milestoneContainer.classList.add("milestone-details", "row");
milestoneLabelContainer.classList.add("event-label-container", "mb-1", "col-12");
  milestoneLabel.classList.add(
    "event-label",
    `milestone-label`,
    "badge",
    "rounded-pill"
  );
  milestoneLabel.textContent = "milestone";


  milestoneTitleContainer.classList.add("milestone-title-container", "row", "mb-3");
  milestoneTitle.classList.add("milestone-title", "off-focus");
  milestoneTitle.setAttribute("type", "text");
  milestoneTitle.setAttribute("placeholder", `Milestone name`);
  milestoneTitle.value = title;
  milestoneEditButton.classList.add( "modal-milestone-edit-button", 
    "edit-button", "material-icons", "align-middle"
  );
  milestoneEditButton.setAttribute("data-bs-toggle", "tooltip");
    milestoneEditButton.setAttribute("data-bs-placement", "top");
    milestoneEditButton.setAttribute( "title","Edit milestone"
    );
  milestoneEditButton.setAttribute("data-bs-toggle", "collapse");
  milestoneEditButton.setAttribute(
    "data-bs-target",
    `.modal-milestone-editor-${milestoneId}`
  );
  milestoneEditButton.textContent = "mode_edit";
  milestoneEditorContainer.classList.add(
    "modal-milestone-editor",
    `modal-milestone-editor-${milestoneId}`,
    "collapse", "card", "my-2", "py-2"
  );
  // milestoneDueDateContainer.classList.add(
  //   "milestone-due-date-container",
  //   "row",
  //   "mb-3",
  //   "px-2"
  // );
  milestoneDueDate.type = "date";
  milestoneDueDate.classList.add("milestone-due-date", "mb-3");
  milestoneDueDate.setAttribute("max", goalDueDate);
  milestoneDueDate.value = dueDate;
  // milestoneDescriptionContainer.classList.add(
  //   "milestone-description-container",
  //   "row",
  //   "mb-3"
  // );
  milestoneDescription.classList.add("modal-milestone-description", "event-description", "off-focus", "mb-3");
  // milestoneDescription.setAttribute("contenteditable", "true");
  milestoneDescription.value = description
    milestoneDescription.setAttribute(
    "placeholder",
    `Description of the milestone...`
  );

  // milestoneSaveButtonContainer.classList.add(
  //   "save-milestone-button-container",
  //   "col-auto",
  //   "mb-3"
  // );
  milestoneButtonsContainer.classList.add("milestone-buttons-container")
  milestoneSaveButton.classList.add(
    "save-milestone-button",
    "btn",
    "btn-outline-success",
  );
  milestoneSaveButton.textContent = "Save";
  milestoneSaveButton.addEventListener("click", (e) => {
    const body = {};
    body.milestone_id = milestoneId;
    body.milestone_title = milestoneTitle.value.trim();
    body.milestone_description = milestoneDescription.value.trim();
    body.milestone_due_date =
      milestoneDueDate.value.length == 10 ? milestoneDueDate.value : null;
    body.task_due_date_unix = Math.ceil(
      new Date(milestoneDueDate.value + "T23:59:59")
    );

    console.log("body: ", body);
    fetch(`/api/milestone`, {
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
        Swal.fire({
          icon: "success",
          title: "All good!",
          text: "Update successfully",
        });
          })
      .catch((err) => {
        console.log(err);
      });
  });

  // milestoneDeleteButtonContainer.classList.add(
  //   "delete-milestone-button-container",
  //   "col-auto",
  //   "mb-3"
  // );
  milestoneDeleteButton.classList.add(
    "delete-milestone-button",
    "btn",
    "btn-outline-danger",
  );
  milestoneDeleteButton.textContent = "Delete";
  milestoneDeleteButton.addEventListener("click", (e) => {
    deleteMilestoneAndChildren(milestoneId);
    const currentContainer = parent.querySelector(
      `.milestone-outer-container-${milestoneId}`
    );
    console.log(parent, currentContainer);
    parent.removeChild(currentContainer);
  });

  tasksContainer.classList.add(
    "tasks-container",
    "row",
    "border-top",
    "pt-3",
    `milestone-${milestoneId}-events-container`,
    "overflow-auto", 
    "smooth-scroll" 
  );
  addNewTaskContainer.classList.add("modal-add-new-task-container");
  // newTaskInputContainer.classList.add("new-task-input-container", "col");
  newTaskInput.setAttribute("type", "text");
  newTaskInput.classList.add("modal-new-task-title", "col-10");
  newTaskInput.setAttribute("placeholder", "New task for the milestone");
  newTaskButton.classList.add("modal-add-new-task-button", "btn", "col-1");
  newTaskButton.textContent = "+";
  newTaskButton.addEventListener("click", (e) => {
    const newTaskTitle = newTaskInput.value.trim();
    if (!newTaskTitle) {
      return alert("Please name the task before adding");
    }
    const body = {};
    body.task_title = newTaskTitle;
    body.task_status = 0;
    body.task_due_date = milestoneDueDate.value;
    body.task_milestone_id = milestoneId;

    console.log("body: ", body);
    fetch(`/api/task`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        const taskId = data.task_id;
        console.log(taskId);
        // createTaskComponent(
        //   milestoneId,
        //   taskId,
        //   newTaskTitle,
        //   0,
        //   milestoneDueDate.value,
        //   null,
        //   null,
        //   null,
        //   milestoneDueDate.value
        // );
        createEventComponent(
          `milestone-${milestoneId}`,
          "task",
          taskId,
          newTaskTitle,
          0,
          milestoneDueDate.value,
          null,
          null,
          0,
          null,
          milestoneId,
          milestoneDueDate.value,
          goalId,
          goalDueDate.value,
          null,
          null
        );
        newTaskInput.value = "";
      })
      .catch((err) => {
        console.log(err);
      });
  });

  parent.prepend(containerOuter);
  containerOuter.append(containerInner, addNewTaskContainer);
  containerInner.append(
    milestoneContainer,
    tasksContainer
  );
  milestoneContainer.append(
    milestoneLabelContainer,
    milestoneTitleContainer,
    milestoneEditorContainer
  );
  milestoneLabelContainer.append(milestoneLabel, milestoneEditButton);
  milestoneTitleContainer.append(
    milestoneTitle
  );
  milestoneButtonsContainer.append(milestoneSaveButton,
    milestoneDeleteButton)
  milestoneEditorContainer.append(
    milestoneDueDate,
    milestoneDescription,
    // milestoneTagsContainer,
    milestoneButtonsContainer,
    // milestoneSaveButtonContainer,
    // milestoneDeleteButtonContainer
  );
  // milestoneDueDateContainer.append(milestoneDueDate);
  // milestoneDescriptionContainer.append(milestoneDescription);
  // milestoneSaveButtonContainer.append(milestoneSaveButton);
  // milestoneDeleteButtonContainer.append(milestoneDeleteButton);
  addNewTaskContainer.append(newTaskInput, newTaskButton);
  // newTaskInputContainer.appendChild(newTaskInput);
};

// const createTaskComponent = (
//   milestoneId,
//   id,
//   title,
//   status,
//   dueDate,
//   description,
//   task_repeat_frequency = 0,
//   task_repeat_end_date = null,
//   milestone_due_date = null
// ) => {
//   const milestoneContainer = document.querySelector(
//     `.milestone-outer-container-${milestoneId}`
//   );
//   const parentContainer = milestoneContainer.querySelector(`.tasks-container`);
//   const eventOuterContainer = document.createElement("div");
//   //const eventToggle = document.createElement("a")
//   const eventHeaderContainer = document.createElement("div");
//   const eventInfoContainer = document.createElement("div");
//   const tagsContainer = document.createElement("div");
//   const EventTitleContainer = document.createElement("div");
//   const checkBox = document.createElement("input");
//   const eventTitle = document.createElement("span");
//   const eventInfoButtonContainer = document.createElement("div");
//   const editButton = document.createElement("button");
//   const eventEditor = document.createElement("div");
//   const eventDueDateContainer = document.createElement("div");
//   const eventDueDate = document.createElement("input");
//   const eventDescriptionContainer = document.createElement("div");
//   const eventDescription = document.createElement("p");
//   const taskRepeatSelectorContainer = createTaskRepeatSelector(
//     id,
//     task_repeat_frequency,
//     task_repeat_end_date,
//     dueDate,
//     milestone_due_date,
//     eventDueDate
//   );
//   const eventFooterContainer = document.createElement("div");
//   const eventSaveButton = document.createElement("button");
//   const eventCancelButton = document.createElement("button");

//   eventOuterContainer.classList.add(
//     `task-outer-container`,
//     "card",
//     "col-12",
//     "mb-2"
//   );
//   eventOuterContainer.setAttribute("id", `task-${id}`);

//   eventHeaderContainer.classList.add("event-header-container", "row", "mb-3");
//   eventInfoContainer.classList.add("event-info-container", "col-9");
//   tagsContainer.classList.add("tags-container");
//   EventTitleContainer.classList.add("event-title-container", "my-2");
//   checkBox.classList.add("form-check-input");
//   checkBox.setAttribute("type", "checkbox");
//   if (status) {
//     checkBox.setAttribute("checked", "true");
//   }
//   checkBox.addEventListener("click", (e) => {
//     const isChecked = checkBox.hasAttribute("checked");
//     if (isChecked) {
//       checkBox.removeAttribute("checked");
//     } else {
//       checkBox.setAttribute("checked", "true");
//     }
//     const isCheckedNew = checkBox.hasAttribute("checked");

//     const body = {};
//     body.task_id = id;
//     body.task_title = eventTitle.textContent;
//     body.task_description = eventDescription.textContent;
//     body.task_status = isCheckedNew ? 1 : 0;
//     body.task_due_date =
//       eventDueDate.value.length == 10 ? eventDueDate.value : null;
//     body.task_due_date_unix = Math.ceil(
//       new Date(eventDueDate.value + "T23:59:59")
//     );

//     console.log("[checkbox] body: ", body);
//     fetch(`/api/task`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log(data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });
//   eventTitle.classList.add("event-title");
//   eventTitle.setAttribute("contenteditable", "true");
//   eventTitle.textContent = title;
//   eventInfoButtonContainer.classList.add(
//     "event-info-button-container",
//     "col-2"
//   );
//   editButton.classList.add("btn", "btn-light", "edit-button");
//   editButton.setAttribute("type", "button");
//   editButton.setAttribute("data-bs-toggle", "collapse");
//   editButton.setAttribute("data-bs-target", `#modal-task-editor-${id}`);
//   editButton.textContent = "✍";
//   eventEditor.classList.add("event-editor", "row", "collapse");
//   eventEditor.setAttribute("id", `modal-task-editor-${id}`);
//   eventDueDateContainer.classList.add(
//     "event-due-date-container",
//     "row",
//     "mb-3"
//   );
//   eventDueDate.classList.add("event-due-date");
//   eventDueDate.setAttribute("type", "date");
//   eventDueDate.setAttribute("max", milestone_due_date);
//   eventDueDate.value = dueDate;
//   eventDescriptionContainer.classList.add(
//     "event-description-container",
//     "row",
//     "mb-3"
//   );
//   eventDescription.classList.add("event-description", "border");
//   eventDescription.setAttribute("contenteditable", "true");
//   eventDescription.textContent = description
//     ? description
//     : "what is this task about?";

//   eventFooterContainer.classList.add("event-footer-container", "row", "mb-3");
//   eventSaveButton.textContent = "save";
//   eventSaveButton.classList.add(
//     "col-12",
//     "btn",
//     "btn-outline-secondary",
//     "save-button",
//     `save-button-task`
//   );
//   eventSaveButton.setAttribute("type", "button");
//   eventSaveButton.setAttribute("data-bs-toggle", "collapse");
//   eventSaveButton.setAttribute("data-bs-target", `#modal-task-editor-${id}`);
//   eventSaveButton.addEventListener("click", (e) => {
//     const body = {};
//     body.task_id = id;
//     body.task_title = eventTitle.textContent;
//     body.task_description = eventDescription.textContent;
//     body.task_status = checkBox.hasAttribute("checked") ? 1 : 0;
//     body.task_due_date = eventDueDate.value;
//     body.task_due_date_unix = Math.ceil(
//       new Date(eventDueDate.value + "T23:59:59")
//     );
//     const repeatSelector = taskRepeatSelectorContainer.querySelector("select");
//     const task_r_frequency =
//       repeatSelector.options[repeatSelector.selectedIndex].value;
//     const task_repeat = task_r_frequency != 0 ? 1 : 0;
//     const task_r_end_date =
//       taskRepeatSelectorContainer.querySelector("input").value ||
//       taskRepeatSelectorContainer.querySelector("input").max;
//     body.task_repeat = task_repeat;
//     body.task_r_frequency = task_r_frequency;
//     body.task_r_end_date = task_r_end_date || "2100-01-01";
//     body.task_r_end_date_unix = Math.ceil(
//       new Date(task_r_end_date + "T23:59:59")
//     );
//     console.log("body: ", body);
//     fetch(`/api/task`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log(data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });
//   eventCancelButton.textContent = "Delete";
//   eventCancelButton.classList.add(
//     "col-12",
//     "btn",
//     "btn-outline-secondary",
//     "cancel-button"
//   );
//   eventCancelButton.setAttribute("type", "button");
//   eventCancelButton.setAttribute("data-bs-toggle", "collapse");
//   eventCancelButton.setAttribute("data-bs-target", `#modal-task-editor-${id}`);
//   eventCancelButton.addEventListener("click", (e) => {
//     editButton.setAttribute("data-bs-toggle", "collapse");
//     let apiEndpoint = `/api/task?task_id=${id}`;
//     console.log("apiEndpoint: ", apiEndpoint);
//     fetch(apiEndpoint, {
//       method: "DELETE",
//       headers: { Authorization: `Bearer ${accessToken}` },
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log("return from delete", data);
//         parentContainer.removeChild(eventOuterContainer);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });

//   eventFooterContainer.append(eventSaveButton, eventCancelButton);
//   eventDescriptionContainer.appendChild(eventDescription);
//   eventDueDateContainer.appendChild(eventDueDate);
//   eventEditor.append(
//     eventDueDateContainer,
//     eventDescriptionContainer,
//     eventFooterContainer
//   );
//   eventDescriptionContainer.after(taskRepeatSelectorContainer);
//   EventTitleContainer.append(checkBox, eventTitle);
//   eventInfoButtonContainer.appendChild(editButton);
//   eventInfoContainer.append(tagsContainer, EventTitleContainer);
//   eventHeaderContainer.append(eventInfoContainer, eventInfoButtonContainer);
//   //eventHeaderContainer.append(eventInfoContainer);
//   //eventToggle.append(eventHeaderContainer, eventEditor);
//   //eventOuterContainer.append(eventToggle);
//   eventOuterContainer.append(eventHeaderContainer, eventEditor);
//   parentContainer.appendChild(eventOuterContainer);
// };

const resetModal = () => {
  const modal = document.querySelector("#modal-goal");
  modal.addEventListener("hidden.bs.modal", (e) => {
    modal.querySelector(".milestones-container").innerHTML = "";
  });
};


resetModal();
