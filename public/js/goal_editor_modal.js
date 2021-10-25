const renderGoalEditor = (
  goalId,
  goalTitle,
  goalDueDate,
  goalDescription,
  goalPurposeId,
  purposes
) => {
  getGoalWithPlan(12)
  const modal = document.querySelector(".modal");
  const goalTitleTarget = document.querySelector(".goal-title");
  const goalDueDateTarget = document.querySelector(".goal-due-date");
  const goalDescriptionTarget = document.querySelector(".goal-description");
  const purposeSelector = document.querySelector(".purpose-selector");

  //add id to dataset attribute
  //不確定顯示出來會怎樣（期待是data-goal-id=12）
  modal.dataset.goalId = goalId;
  //render goal title
  goalTitleTarget.textContent = goalTitle;
  //render goal date (YYYY-MM-DD)
  goalDueDateTarget.value = goalDueDate;
  //render goal description
  goalDescriptionTarget.value = goalDescription;
  //render purpose selector and set default value
  purposes.forEach((purpose) => {
    const option = document.createElement("option");
    option.value = purpose.purpose_id;
    option.textContent = purpose.purpose_title;
    if (purpose.purpose_id == goalPurposeId) {
      option.setAttribute("Selected", "");
    }
    purposeSelector.appendChild(option);
  });
};


const createMilestoneTemplate = () => {
  const parent = document.querySelector(".milestones-container");
  const containerOuter = document.createElement("div");
  const containerInner = document.createElement("div");
  const milestoneContainer = document.createElement("div");
  const milestoneTitle = document.createElement("h5");
  const milestoneEditButton = document.createElement("button");
  const milestoneEditor = document.createElement("div");
  const milestoneDueDateRow = document.createElement("div");
  const milestoneDueDate = document.createElement("input");
  const milestoneDescriptionRow = document.createElement("div");
  const milestoneDescription = document.createElement("textarea");
  const milestoneTagsContainer = document.createElement("div");
  const milestoneSaveButtonRow = document.createElement("div");
  const milestoneSaveButton = document.createElement("button");
  const tasksContainer = document.createElement("div");

  containerOuter.classList.add(
    "milestone-outer-container",
    "col-4",
    "overflow-auto",
    "smooth-scroll"
  );
  containerInner.classList.add("milestone-container", "card-body");
  milestoneContainer.classList.add("milestone-details", "row");
  milestoneTitle.classList.add("milestone-title");
  milestoneTitle.setAttribute("contenteditable", "true");
  milestoneEditButton.classList.add(
    "btn",
    "btn-light",
    "edit-button",
    "col-auto",
    "mb-3"
  );
  milestoneEditButton.setAttribute("type", "button");
  milestoneEditButton.setAttribute("data-bs-toggle", "collapse");
  milestoneEditButton.setAttribute("data-bs-target", ".milestone-editor");
  milestoneEditButton.textContent = "Edit goal details";
  milestoneEditor.classList.add("milestone-editor", "row", "collapse");
  milestoneDueDateRow.classList.add(
    "milestone-due-date-row",
    "row",
    "mb-3",
    "px-2"
  );
  milestoneDueDate.type = "date";
  milestoneDueDate.classList.add("milestone-due-date");
  milestoneDescriptionRow.classList.add(
    "milestone-description-row",
    "row",
    "mb-3"
  );
  milestoneDescription.classList.add("milestone-description");
  milestoneDescription.setAttribute("placeholder", "What's special about this milestone?");
  milestoneTagsContainer.classList.add("milestone-tags-row", "row", "mb-3");
  milestoneSaveButtonRow.classList.add(
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
  tasksContainer.classList.add("tasks-container", "row");

  parent.append(containerOuter);
  containerOuter.append(containerInner);
  containerInner.append(milestoneContainer, tasksContainer);
  milestoneContainer.append(
    milestoneTitle,
    milestoneEditButton,
    milestoneEditor
  );
  milestoneEditor.append(
    milestoneDueDateRow,
    milestoneDescriptionRow,
    milestoneTagsContainer,
    milestoneSaveButtonRow
  );
  milestoneDueDateRow.append(milestoneDueDate);
  milestoneDescriptionRow.append(milestoneDescription);
  milestoneSaveButtonRow.append(milestoneSaveButton);
};
const addNewMilestone = async () => {
  await createMilestone()
  createMilestoneTemplate()
}

const renderMilestone = (milestoneId) => {};




