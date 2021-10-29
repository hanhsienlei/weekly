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
        const eventsContainer = document.querySelector(
          `.${container}-events-container`
        );

        title.setAttribute("data-due-date", data[container].due_date);
        title.textContent = data[container].value;
        beforeButton.setAttribute("onclick", `renderEvents('${dateBefore}')`);
        afterButton.setAttribute("onclick", `renderEvents('${dateAfter}')`);
        eventsContainer.innerHTML = "";
        if (container === "week") {
          title.textContent = "Week " + data[container].value;
        }
      });
      //events
      if (data.date.tasks) {
        data.date.tasks.forEach((task) => {
          createEventComponent(
            "date",
            "task",
            task.t_id,
            task.t_title,
            task.t_status,
            task.t_due_date,
            task.t_description,
            task.t_parent.join("·")
          );
        });
        data.date.milestones.forEach((milestone) => {
          createEventComponent(
            "date",
            "milestone",
            milestone.m_id,
            milestone.m_title,
            milestone.m_status,
            milestone.m_due_date,
            milestone.m_description,
            milestone.m_parent.join("·")
          );
        });
        data.date.goals.forEach((goal) => {
          createEventComponent(
            "date",
            "goal",
            goal.g_id,
            goal.g_title,
            goal.g_status,
            goal.g_due_date,
            goal.g_description,
            goal.g_parent.join("·")
          );
        });
      }

      if (data.week.tasks) {
        data.week.tasks.forEach((task) => {
          createEventComponent(
            "week",
            "task",
            task.t_id,
            task.t_title,
            task.t_status,
            task.t_due_date,
            task.t_description,
            task.t_parent.join("·")
          );
        });
        data.week.milestones.forEach((milestone) => {
          createEventComponent(
            "week",
            "milestone",
            milestone.m_id,
            milestone.m_title,
            milestone.m_status,
            milestone.m_due_date,
            milestone.m_description,
            milestone.m_parent.join("·")
          );
        });
        data.week.goals.forEach((goal) => {
          createEventComponent(
            "week",
            "goal",
            goal.g_id,
            goal.g_title,
            goal.g_status,
            goal.g_due_date,
            goal.g_description,
            goal.g_parent.join("·")
          );
        });
      }

      if (data.month.tasks) {
        data.month.tasks.forEach((task) => {
          createEventComponent(
            "month",
            "task",
            task.t_id,
            task.t_title,
            task.t_status,
            task.t_due_date,
            task.t_description,
            task.t_parent.join("·")
          );
        });
        data.month.milestones.forEach((milestone) => {
          createEventComponent(
            "month",
            "milestone",
            milestone.m_id,
            milestone.m_title,
            milestone.m_status,
            milestone.m_due_date,
            milestone.m_description,
            milestone.m_parent.join("·")
          );
        });
        data.month.goals.forEach((goal) => {
          createEventComponent(
            "month",
            "goal",
            goal.g_id,
            goal.g_title,
            goal.g_status,
            goal.g_due_date,
            goal.g_description,
            goal.g_parent.join("·")
          );
        });
      }
      if (data.year.tasks) {
        data.year.tasks.forEach((task) => {
          createEventComponent(
            "year",
            "task",
            task.t_id,
            task.t_title,
            task.t_status,
            task.t_due_date,
            task.t_description,
            task.t_parent.join("·")
          );
        });

        data.year.milestones.forEach((milestone) => {
          createEventComponent(
            "year",
            "milestone",
            milestone.m_id,
            milestone.m_title,
            milestone.m_status,
            milestone.m_due_date,
            milestone.m_description,
            milestone.m_parent.join("·")
          );
        });
        data.year.goals.forEach((goal) => {
          createEventComponent(
            "year",
            "goal",
            goal.g_id,
            goal.g_title,
            goal.g_status,
            goal.g_due_date,
            goal.g_description,
            goal.g_parent.join("·")
          );
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
    task_title: title,
    task_due_date: dueDate,
    task_due_date_unix: dueDateUnix,
  };
  fetch("/api/task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      const taskId = data.task_id;
      createEventComponent(
        timeScale,
        eventType,
        taskId,
        title,
        null,
        dueDate,
        null,
        null
      );
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
  parents
) => {
  const parentContainer = document.querySelector(
    `.${timeScale}-events-container`
  );
  const eventOuterContainer = document.createElement("div");
  //const eventToggle = document.createElement("a")
  const eventHeaderContainer = document.createElement("div");
  const eventInfoContainer = document.createElement("div");
  const tagsContainer = document.createElement("div");
  const EventTitleContainer = document.createElement("div");
  const checkBox = document.createElement("input");
  const eventTitle = document.createElement("span");
  const eventParents = document.createElement("h6");
  const eventInfoButtonContainer = document.createElement("div");
  const editButton = document.createElement("button");
  const eventEditor = document.createElement("div");
  const eventDueDateContainer = document.createElement("div");
  const eventDueDate = document.createElement("input");
  const eventDescriptionContainer = document.createElement("div");
  const eventDescription = document.createElement("p");
  const eventFooterContainer = document.createElement("div");
  const eventSaveButton = document.createElement("button");
  const eventCancelButton = document.createElement("button");

  eventOuterContainer.classList.add(
    `${eventType}-outer-container`,
    "event-outer-container",
    "card",
    "col-12",
    "mb-2"
  );
  eventOuterContainer.setAttribute("id", `${eventType}-${id}`);
  //eventToggle.classList.add("event-toggle");
  editButton.addEventListener("click", (e) => {
    e.target.removeAttribute("data-bs-toggle");
  });
  //eventToggle.setAttribute("data-bs-toggle", "collapse");
  //eventToggle.setAttribute("data-bs-target", `#editor-${eventType}-${id}`)
  eventHeaderContainer.classList.add("event-header-container", "row", "mb-3");
  eventInfoContainer.classList.add("event-info-container", "col-10");
  tagsContainer.classList.add("tags-container");
  EventTitleContainer.classList.add("event-title-container", "my-2");
  checkBox.classList.add("form-check-input");
  checkBox.setAttribute("type", "checkbox");
  checkBox.setAttribute("checked", status);
  eventTitle.classList.add("event-title");
  eventTitle.setAttribute("contenteditable", "true");
  eventTitle.textContent = title;
  eventParents.classList.add("event-parents", "mt-1", "mb-2", "text-muted");
  eventParents.textContent = parents;
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
  eventSaveButton.classList.add("col-4", "btn", "btn-light", "save-button", `save-button-${eventType}`);
  eventSaveButton.setAttribute("type", "button");
  eventSaveButton.setAttribute("data-bs-toggle", "collapse");
  eventSaveButton.setAttribute("data-bs-target", `#editor-${eventType}-${id}`);
  eventSaveButton.addEventListener("click", (e) => {
    const body = {};
    body[`${eventType}_id`] = id
    body[`${eventType}_title`] = eventTitle.textContent
    body[`${eventType}_description`] = eventDescription.textContent
    body[`${eventType}_due_date`] = eventDueDate.value
    body[`${eventType}_due_date_unix`] = Math.ceil(new Date(eventDueDate.value + "T23:59:59"))
    console.log("body: ", body)
    fetch(`/api/${eventType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
      })
      .catch((err) => {
        console.log(err);
      });
    editButton.setAttribute("data-bs-toggle", "collapse");
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
  EventTitleContainer.append(checkBox, eventTitle, eventParents);
  eventInfoButtonContainer.appendChild(editButton);
  eventInfoContainer.append(tagsContainer, EventTitleContainer, eventParents);
  eventHeaderContainer.append(eventInfoContainer, eventInfoButtonContainer);
  //eventHeaderContainer.append(eventInfoContainer);
  //eventToggle.append(eventHeaderContainer, eventEditor);
  //eventOuterContainer.append(eventToggle);
  eventOuterContainer.append(eventHeaderContainer, eventEditor);
  parentContainer.appendChild(eventOuterContainer);
};

const createTagComponent = () => {
  const tag = document.createElement("span");
  tag.classList.add("tag", "badge", "rounded-pill");
};

document.onload = renderEvents("2021-10-25");
