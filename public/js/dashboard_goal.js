const goalSelector = document.querySelector(".goal-selector");
const renderGoalProgress = async (goal_id) => {
  fetch(`/api/goal/progress?goal_id=${goal_id}`)
    .then((response) => response.json())
    .then((data) => {
      const progressGoalTitle = document.querySelector(".progress-goal-title");
      const progressGoalDueDate = document.querySelector(
        ".progress-goal-due-date"
      );
      const progressMilestoneSum = document.querySelector(
        ".progress-milestone-progress"
      );
      const progressTaskSum = document.querySelector(".progress-task-progress");
      const {
        g_id,
        g_title,
        g_due_date,
        g_summary,
        m_titles,
        m_number_of_task,
        m_number_of_task_done,
      } = data;
      const numberOfTaskOpen = g_summary.task[1] - g_summary.task[0];
      const doughnutData = new Array(
        ...m_number_of_task_done,
        numberOfTaskOpen
      );
      const doughnutLabels = new Array(...m_titles, "Not done yet");
      const doughnutCanvas = document.querySelector("#doughnut");
      const doughnut = new Chart(doughnutCanvas, {
        type: "doughnut",
        options: {
          plugins: {
            legend: {
              display: false,
            },
          },
        },
        data: {
          labels: doughnutLabels,
          datasets: [
            {
              data: doughnutData,
              hoverOffset: 4,
            },
          ],
        },
      });
      const barCanvas = document.querySelector("#bar");
      const bar = new Chart(barCanvas, {
        options: {
          indexAxis: "y",
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y0: {
              display: false,
            },
            x: {
              title: {
                display: true,
                text: "Number of tasks",
              },
              // min: 0,
              // max: 100,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
        data: {
          labels: m_titles,
          datasets: [
            {
              type: "bar",
              label: "done tasks",
              data: m_number_of_task_done,
              fill: false,
              // backgroundColor: [
              //   "rgba(255, 99, 132, 0.2)",
              //   "rgba(255, 159, 64, 0.2)",
              //   "rgba(255, 205, 86, 0.2)",
              //   "rgba(75, 192, 192, 0.2)",
              //   "rgba(54, 162, 235, 0.2)",
              // ],
              yAxisID: "y0",
            },
            {
              type: "bar",
              label: "total tasks",
              data: m_number_of_task,
              fill: false,
              // backgroundColor: [
              //   "rgba(255, 99, 132, 0.2)",
              //   "rgba(255, 159, 64, 0.2)",
              //   "rgba(255, 205, 86, 0.2)",
              //   "rgba(75, 192, 192, 0.2)",
              //   "rgba(54, 162, 235, 0.2)",
              // ],
              yAxisID: "y1",
            },
          ],
        },
      });
      const progressGoalEditorButtonContainer = document.querySelector(".progress-goal-editor-button-container")
      const progressGoalEditorButton= createGoalButton(g_id)
      progressGoalEditorButtonContainer.appendChild(progressGoalEditorButton)
      progressGoalTitle.textContent = g_title;
      progressGoalDueDate.textContent = `Due date: ${g_due_date}`;
      progressMilestoneSum.textContent = `${g_summary.milestone[0]} / ${g_summary.milestone[1]} milestones`;
      progressTaskSum.textContent = `${g_summary.task[0]} / ${g_summary.task[1]} tasks`;
      goalSelector.addEventListener("change", (e) => {
        doughnut.destroy();
        bar.destroy();
        progressGoalEditorButtonContainer.innerHTML = ""
        renderGoalProgress(e.target.value);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const renderGoalSelector = async (user_id) => {
  fetch(`/api/goals?user_id=${user_id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.length) {
        data.forEach((goal) => {
          const { g_id, g_title } = goal;
          const option = document.createElement("option");
          option.setAttribute("value", g_id);
          option.textContent = g_title;
          goalSelector.appendChild(option);
        });
      } else {
        alert("No goals found");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const createGoalButton = (goal_id) => {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-light", "edit-goal-button");
  button.setAttribute("type", "button");
  button.setAttribute("data-bs-toggle", "modal");
  button.setAttribute("data-bs-target", "#modal-goal");
  button.setAttribute("onclick", `renderGoalEditor(${goal_id})`);
  button.textContent = "check goal";
  return button;
};
const createTaskRepeatSelector = (
  task_id,
  task_repeat_frequency,
  task_repeat_end_date,
  min_date,
  max_date
) => {
  const container = document.createElement("div");
  container.classList.add(
    `task-repeat-container-${task_id}`,
    "task-repeat-container",
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
    repeatEndDate.classList.add("event-due-date");
    repeatEndDate.setAttribute("type", "date");
    repeatEndDate.value = task_repeat_end_date;
    repeatEndDate.setAttribute("min", min_date);
    repeatEndDate.setAttribute("max", max_date);
    selector.addEventListener("change", (e) => {
      if (selector.value == 0) {
        repeatEndDate.setAttribute("disabled", "true");
      } else {
        repeatEndDate.removeAttribute("disabled");
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
    repeatEndDateContainer.append(repeatEndDate);
    container.append(selector, repeatEndDateContainer);
  }

  return container;
};

window.onload = renderGoalProgress(1);
window.onload = renderGoalSelector(1);
