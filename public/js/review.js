const goalList = document.querySelector(".goal-list");
const renderGoalProgress = async (goal_id) => {
  console.log("fetch: ", goal_id)
  fetch(`/api/goal/progress?goal_id=${goal_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if(data.error){
        Swal.fire({
          title: "Oops...",
          text: data.error,
          icon: "error",
          showCancelButton: false,
        });
        return
      }
      console.log(data);
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
      const progressTaskSum = document.querySelector(".progress-task-progress");
      const progressMilestoneSum = document.querySelector(
        ".progress-milestone-progress"
      );

      const progressEmptyNote = document.querySelector(".progress-empty-note");
      const goalPercentageSpan = document.querySelector(".goal-percentage");
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
      let weeksFromNowValue =
        g_weeks_from_now > 0 ? g_weeks_from_now : Math.abs(g_weeks_from_now);
      let weeksFromNowText = "";

      if (g_weeks_from_now > 1) {
        weeksFromNowText = ` week away`;
      } else if (g_weeks_from_now == 1) {
        weeksFromNowValue = "";
        weeksFromNowText = `Some days ago`;
      } else if (g_weeks_from_now == 0) {
        weeksFromNowValue = "";
        weeksFromNowText = `Today is the big day!`;
      } else if (g_weeks_from_now == -1) {
        weeksFromNowValue = "";
        weeksFromNowText = `Some days away`;
      } else if (g_weeks_from_now < -1) {
        weeksFromNowText = ` weeks ago`;
      }

      const GoalEmptyNote = m_titles.length
        ? ""
        : "⚠️ No plans are made for this goal yet. The charts show how they would look like when you start working on your goals.";

      const goalDonePercentage = g_summary.task[1]
        ? Math.ceil((g_summary.task[0] / g_summary.task[1]) * 100)
        : 0;
      const numberOfTaskOpen = g_summary.task[1] - g_summary.task[0];
      let doughnutData = new Array(...m_number_of_task_done, numberOfTaskOpen);
      let doughnutLabels = new Array(...m_titles, "Not done yet");
      let barLabels = m_titles;
      let barDataDone = m_number_of_task_done;
      let barDataTotal = m_number_of_task;
      let doneColor = m_titles.length ? "#ffafaf" : "#d8d8e0";
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
        doneColor
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
              backgroundColor: doneColor,
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
      progressGoalButton.textContent = "🔍  checkout goal"
      progressGoalDueDate.textContent = `🗓 ${g_due_date}`;
      progressWeeksFromNowValue.textContent = "🕰 " + weeksFromNowValue;
      progressWeeksFromNowText.textContent = weeksFromNowText;
      progressTaskSum.textContent = `${g_summary.task[0]} / ${g_summary.task[1]} tasks done`;
      progressMilestoneSum.textContent = `${g_summary.milestone[0]} / ${g_summary.milestone[1]} milestones achieved`;
      goalPercentageSpan.textContent = goalDonePercentage;
      progressEmptyNote.textContent = GoalEmptyNote;
      goalList.addEventListener("click", (e) => {
        doughnut.destroy();
        bar.destroy();
      });

      $("#modal-goal").on("hidden.bs.modal", () => {
        const selectedGoal = document.querySelector(".selected");
        const selectedGoalId = selectedGoal.dataset.goalId;
        doughnut.destroy();
        bar.destroy();
        renderGoalProgress(selectedGoalId);
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
      console.log(data);
      const goalList = document.querySelector(".goal-list");
      if (data.length) {
        const params = new URLSearchParams(window.location.search)
        const renderGoalId = params.get("goal_id")? Number(params.get("goal_id")):data[0].g_id
        console.log("render goal: ", renderGoalId)
        renderGoalProgress(renderGoalId);
        data.forEach((goal) => {
          const { g_id, g_title } = goal;
          const goalItem = document.createElement("li");
          goalItem.setAttribute("data-goal-id", g_id);
          goalItem.classList.add("list-group-item", "ps-4");
          goalItem.textContent = g_title;
          goalList.appendChild(goalItem);
          if (g_id == renderGoalId) {
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



getUser();
window.onload = InitializePage();
