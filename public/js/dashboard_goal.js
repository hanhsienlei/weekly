const goalList = document.querySelector(".goal-list");
const accessToken = localStorage.getItem("access_token");
const renderGoalProgress = async (goal_id) => {
  fetch(`/api/goal/progress?goal_id=${goal_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const progressGoalTitle = document.querySelector(".progress-goal-title");
      const progressGoalButton = document.querySelector(
        ".progress-view-goal-button"
      );

      const progressGoalDueDate = document.querySelector(
        ".progress-goal-due-date"
      );

      const progressWeeksFromNowValue = document.querySelector(
        ".progress-weeks-from-now-value"
      );
      const progressWeeksFromNowText = document.querySelector(
        ".progress-weeks-from-now-text"
      );
      const progressTaskSum = document.querySelector(
        ".progress-task-progress"
      );
      const progressMilestoneSum = document.querySelector(
        ".progress-milestone-progress"
      );
      
      const progressEmptyNote = document.querySelector(".progress-empty-note");
      const goalPercentageSpan = document.querySelector(".goal-percentage")
      const {
        g_id,
        g_title,
        g_due_date,
        g_weeks_from_now,
        g_summary,
        m_titles,
        m_number_of_task,
        m_number_of_task_done,
      } = data;
      const weeksFromNowValue =
        g_weeks_from_now > 0 ? g_weeks_from_now : Math.abs(g_weeks_from_now);
      const weeksFromNowText =
        g_weeks_from_now > 0 ? ` weeks away` : ` weeks ago`;
      const GoalEmptyNote = m_titles.length
        ? ""
        : "⚠️ No plans are made for this goal yet. The charts show how they would look like when you start working on your goals.";
        
      const goalDonePercentage =  g_summary.task[1]? Math.ceil((g_summary.task[0] / g_summary.task[1])*100):0
      const numberOfTaskOpen = g_summary.task[1] - g_summary.task[0];
      let doughnutData = new Array(...m_number_of_task_done, numberOfTaskOpen);
      let doughnutLabels = new Array(...m_titles, "Not done yet");
      let barLabels = m_titles;
      let barDataDone = m_number_of_task_done;
      let barDataTotal = m_number_of_task;
      if (!m_titles.length) {
        doughnutData = [1, 4, 3, 2, 5];
        doughnutLabels = [
          "milestone 1",
          "milestone 2",
          "milestone 3",
          "milestone 4",
          "Not done yet",
        ];
        barLabels = [
          "milestone 1",
          "milestone 2",
          "milestone 3",
          "milestone 4",
        ];
        barDataDone = [1, 4, 3, 2];
        barDataTotal = [2, 4, 4, 5];
      }
      const doughnutCanvas = document.querySelector("#doughnut");
      const doughnutBackgroundColor = Array(doughnutLabels.length).fill(
        "#ffafaf"
      );
      doughnutBackgroundColor[doughnutLabels.length - 1] = "#d8d8e0";
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
              backgroundColor: doughnutBackgroundColor,
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
          labels: barLabels,
          datasets: [
            {
              type: "bar",
              label: "done tasks",
              data: barDataDone,
              fill: false,
              backgroundColor: "#ffafaf",
              yAxisID: "y0",
            },
            {
              type: "bar",
              label: "total tasks",
              data: barDataTotal,
              fill: false,
              backgroundColor: "#d8d8e0",
              yAxisID: "y1",
            },
          ],
        },
      });

      progressGoalTitle.textContent = g_title;
      progressGoalButton.setAttribute("onclick", `renderGoalEditor(${g_id})`);
      progressGoalDueDate.textContent = `🗓 ${g_due_date}`;
      progressWeeksFromNowValue.textContent = "💭 " + weeksFromNowValue;
      progressWeeksFromNowText.textContent = weeksFromNowText;
      progressTaskSum.textContent = `${g_summary.task[0]} / ${g_summary.task[1]} tasks done`;
      progressMilestoneSum.textContent = `${g_summary.milestone[0]} / ${g_summary.milestone[1]} milestones achieved`;
      goalPercentageSpan.textContent = goalDonePercentage;
      progressEmptyNote.textContent = GoalEmptyNote;
      goalList.addEventListener("click", (e) => {
        doughnut.destroy();
        bar.destroy();
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const InitializePage = async () => {
  const accessToken = localStorage.getItem("access_token");
  fetch(`/api/goals`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const goalList = document.querySelector(".goal-list");
      if (data.length) {
        renderGoalProgress(data[0].g_id);
        data.forEach((goal) => {
          const { g_id, g_title } = goal;
          const goalItem = document.createElement("li");
          goalItem.setAttribute("data-goal-id", g_id);
          goalItem.classList.add("list-group-item", "ps-4");
          goalItem.textContent = g_title;
          goalList.appendChild(goalItem);
          if (g_id == data[0].g_id) {
            goalItem.classList.add("selected");
          }
        });
        goalList.addEventListener("click", (e) => {
          if (e.target.classList.contains("list-group-item")) {
            const targetId = e.target.dataset.goalId;
            renderGoalProgress(targetId);
            const selectedItem = document.querySelector(".selected");
            if (selectedItem) {
              selectedItem.classList.remove("selected");
            }
            e.target.classList.add("selected");
          }
        });
      } else {
        const goalItem = document.createElement("li");

        goalItem.classList.add("list-group-item");
        goalItem.textContent = "You don't have any goal yet";
        goalList.appendChild(goalItem);
      }
    })
    .catch((err) => {
      console.log(err);
    });
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

//window.onload = renderGoalProgress();
window.onload = InitializePage();
