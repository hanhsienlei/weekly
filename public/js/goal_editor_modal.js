
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
      const goalTitleIcon = modal.querySelector(".modal-title-icon");
      const goalTitle = modal.querySelector(".goal-title");
      const deleteGoalButton = modal.querySelector(
        ".editor-delete-goal-button"
      );
      const goalDueDate = modal.querySelector(".goal-due-date");
      const goalCategory = modal.querySelector(".goal-category-selector");
      const goalDescription = modal.querySelector(".goal-description");
      const goalSaveButton = modal.querySelector(".save-goal-button");
      const newMilestoneTitle = modal.querySelector(".new-milestone-title");
      const newMilestoneButton = modal.querySelector(".new-milestone-button");
      const saveGoal = () => {
        if (!goalTitle.value.trim()) {
          Swal.fire({
            icon: "warning",
            title: `Milestone title cannot be empty`,
          });
        } else {
          const body = {
            goal_id: goalId,
            goal_title: goalTitle.value.trim(),
            goal_due_date: goalDueDate.value,
            goal_category: goalCategory.options[goalCategory.selectedIndex].value,
            goal_description: goalDescription.value.trim(),
          };
          //console.log("dave goal body:", body)
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
              //console.log("return from save: ", data);
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
                showConfirmButton: false,
              });
            })
            .catch((err) => {
              console.log(err);
            });
        }
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
      goalTitleIcon.textContent = categoryMaterialIcons[data.g_category]
      goalTitle.value = data.g_title;
      goalTitle.addEventListener("keyup", (e) => {
        if (e.keyCode === 13) {
          saveGoal();
        }
      });

      deleteGoalButton.setAttribute(
        "onclick",
        `deleteGoalAndChildren(${goalId})`
      );
      goalDueDate.value = data.g_due_date;
      
      goalDescription.value = data.g_description;
      goalSaveButton.addEventListener("click", saveGoal);
      goalSaveButton.setAttribute("data-bs-toggle", "collapse")
      goalSaveButton.setAttribute("data-bs-target", ".goal-container-row")
      let goalCategoryIndex = data.g_category
      if(data.g_category>8||data.g_category<0){
        goalCategoryIndex = 0
      }
      goalCategory.options[goalCategoryIndex].selected = true
      goalCategory.addEventListener("change", e=> {
        const goalCategoryNumber = Number(goalCategory.value)
        goalTitleIcon.textContent = categoryMaterialIcons[goalCategoryNumber]
      })

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
                  0,
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
  const milestoneLabelDate = document.createElement("span");
  const milestoneTitleContainer = document.createElement("div");
  
  const milestoneTitle = document.createElement("input");
  const milestoneEditButton = document.createElement("span");
  const milestoneEditorContainer = document.createElement("div");
  const milestoneDueDateLabel = document.createElement("span");
  const milestoneDueDate = document.createElement("input");
  const milestoneDescriptionLabel = document.createElement("span");
  const milestoneDescription = document.createElement("textarea");
  const milestoneButtonsContainer = document.createElement("div");
  const milestoneSaveButton = document.createElement("button");
  const milestoneDeleteButton = document.createElement("button");
  const tasksContainer = document.createElement("div");
  const addNewTaskContainer = document.createElement("div");
  const newTaskInput = document.createElement("input");
  const newTaskButton = document.createElement("button");

  const modalSaveMilestone = ()=>{
    if (!milestoneTitle.value.trim()) {
      Swal.fire({
        icon: "warning",
        title: `Milestone title cannot be empty`,
      });
    } else {
      const body = {};
      body.milestone_id = milestoneId;
      body.milestone_title = milestoneTitle.value.trim();
      body.milestone_description = milestoneDescription.value.trim();
      body.milestone_due_date =
      milestoneDueDate.value.length == 10 ? milestoneDueDate.value : null;

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
          if (data.error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: data.error,
            });
            return;
          }else{
          Swal.fire({
            icon: "success",
            title: "All good!",
            text: "Update successfully",
            showConfirmButton: false,
          });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  containerOuter.classList.add(
    "milestone-outer-container",
    "overflow-auto",
    "smooth-scroll",
    `milestone-outer-container-${milestoneId}`,
    "mr-2"
  );
  containerOuter.dataset.milestoneId = milestoneId;
  containerInner.classList.add("milestone-container", "card-body");
  milestoneContainer.classList.add("milestone-details", "row");
  milestoneLabelContainer.classList.add(
    "event-label-container",
    "mb-1",
    "col-12"
  );
  milestoneLabel.classList.add(
    "event-label",
    `milestone-label`,
    "badge",
    "rounded-pill"
  );
  milestoneLabel.textContent = "milestone";
  milestoneLabelDate.classList.add(
    "event-label",
    "event-label-date",
    "badge",
    "rounded-pill"
  );
  milestoneLabelDate.textContent = dueDate;

  milestoneTitleContainer.classList.add(
    "milestone-title-container",
    "row",
    "mb-3"
  );
  
  milestoneTitle.classList.add("milestone-title", "off-focus");
  milestoneTitle.type = "text";
  milestoneTitle.setAttribute("placeholder", `Milestone name`);
  milestoneTitle.value = title;
  milestoneTitle.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      modalSaveMilestone()
    }
  });
  milestoneEditButton.classList.add(
    "modal-milestone-edit-button",
    "edit-button",
    "material-icons",
    "align-middle"
  );
  milestoneEditButton.setAttribute("data-bs-toggle", "tooltip");
  milestoneEditButton.setAttribute("data-bs-placement", "top");
  milestoneEditButton.setAttribute("title", "Edit milestone");
  milestoneEditButton.setAttribute("data-bs-toggle", "collapse");
  milestoneEditButton.setAttribute(
    "data-bs-target",
    `.modal-milestone-editor-${milestoneId}`
  );
  milestoneEditButton.textContent = "mode_edit";
  milestoneEditorContainer.classList.add(
    "modal-milestone-editor",
    `modal-milestone-editor-${milestoneId}`,
    "collapse",
    "card",
    "my-2",
    "py-2"
  );
  
  milestoneDueDateLabel.textContent = "Milestone due date"
  milestoneDueDate.type = "date";
  milestoneDueDate.classList.add("milestone-due-date", "form-control", "mb-3");
  milestoneDueDate.setAttribute("max", goalDueDate);
  milestoneDueDate.value = dueDate;
  milestoneDueDate.addEventListener("change", e => {
    milestoneLabelDate.textContent = milestoneDueDate.value
  })
  
  milestoneDescriptionLabel.textContent = "Milestone description"
  milestoneDescription.classList.add(
    "modal-milestone-description",
    "event-description",
    "off-focus",
    "mb-3",
    "form-control"
  );
  
  milestoneDescription.value = description;
  milestoneDescription.setAttribute(
    "placeholder",
    `Description of the milestone...`
  );

  milestoneButtonsContainer.classList.add("milestone-buttons-container");
  milestoneSaveButton.classList.add(
    "save-milestone-button",
    "btn",
    "btn-outline-success"
  );
  milestoneSaveButton.textContent = "Save";
  milestoneSaveButton.setAttribute("data-bs-toggle", "collapse");
  milestoneSaveButton.setAttribute(
    "data-bs-target",
    `.modal-milestone-editor-${milestoneId}`
  );
  milestoneSaveButton.onclick = modalSaveMilestone

  milestoneDeleteButton.classList.add(
    "delete-milestone-button",
    "btn",
    "btn-outline-danger"
  );
  milestoneDeleteButton.textContent = "Delete";
  milestoneDeleteButton.addEventListener("click", (e) => {
    deleteMilestoneAndChildren(milestoneId);
    
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
  newTaskInput.type = "text";
  newTaskInput.classList.add("modal-new-task-title", "col-10");
  newTaskInput.setAttribute("placeholder", "New task for the milestone");

  newTaskInput.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      newTaskButton.click();
      newTaskInput.value=""
    }
  });

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
          0,
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
  parent.scrollLeft = parent.scrollWidth;
  containerOuter.append(containerInner, addNewTaskContainer);
  containerInner.append(milestoneContainer, tasksContainer);
  milestoneContainer.append(
    milestoneLabelContainer,
    milestoneTitleContainer,
    milestoneEditorContainer
  );
  milestoneLabelContainer.append(milestoneLabel,milestoneLabelDate, milestoneEditButton);
  milestoneTitleContainer.append(milestoneTitle);
  milestoneButtonsContainer.append(milestoneSaveButton, milestoneDeleteButton);
  milestoneEditorContainer.append(
    milestoneDueDateLabel,
    milestoneDueDate,
    milestoneDescriptionLabel,
    milestoneDescription,
    milestoneButtonsContainer
  );
  addNewTaskContainer.append(newTaskInput, newTaskButton);
};

const modal = document.querySelector("#modal-goal");
modal.addEventListener("hidden.bs.modal", (e) => {
  modal.querySelector(".milestones-container").innerHTML = "";
});

document
  .querySelector(".new-milestone-title")
  .addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      document.querySelector(".new-milestone-button").click();
      document.querySelector(".new-milestone-title").value = ""
    }
  });
