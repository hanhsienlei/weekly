let newGoal = 0;

const goalList = document.querySelector(".goal-list");
const renderGoalProgress = async (goal_id) => {
  console.log("fetch: ", goal_id);
  fetch(`/api/goal/progress?goal_id=${goal_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        Swal.fire({
          title: "Oops...",
          text: data.error,
          icon: "error",
          showCancelButton: false,
        });
        return;
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
      progressGoalButton.textContent = "🔍  checkout goal";
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
      goalList.addEventListener("change", (e) => {
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

const InitializePage = async (goalId) => {
  const accessToken = localStorage.getItem("access_token");
  const goalList = document.querySelector(".goal-list");
  goalList.innerHTML = "";
  const params = new URLSearchParams(window.location.search);
  if (params.get("goal") === "new" && !newGoal) {
    console.log("add new goal");
    newGoal++;
    addNewGoal();
  } else {
    fetch(`/api/goals`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const goalList = document.querySelector(".goal-list");
        goalList.innerHTML = "";
        const params = new URLSearchParams(window.location.search);
        if (data.length) {
          let renderGoalId = params.get("goal_id")
            ? Number(params.get("goal_id"))
            : data[0].g_id;
          if (goalId) {
            renderGoalId = goalId;
          }
          console.log("render goal: ", renderGoalId);
          renderGoalProgress(renderGoalId);
          data.forEach((goal) => {
            const { g_id, g_title, g_category } = goal;
            const goalItem = document.createElement("div");
            goalItem.setAttribute("data-goal-id", g_id);
            goalItem.classList.add("list-group-item", "ps-2");
            goalItemIcon = document.createElement("span");
            goalItemTitle = document.createElement("span");
            goalItemIcon.classList.add("material-icons");
            goalItemIcon.textContent = categoryMaterialIcons[g_category];
            goalItemTitle.textContent = g_title;
            goalList.appendChild(goalItem);
            goalItem.append(goalItemIcon, goalItemTitle);
            if (g_id == renderGoalId) {
              goalItem.classList.add("selected");
            }
            goalItemTitle.addEventListener("click", (e) => {
              goalItem.click();
            });
            goalItemIcon.addEventListener("click", (e) => {
              goalItem.click();
            });
          });

          goalList.addEventListener("click", (e) => {
            if (e.target.classList.contains("list-group-item")) {
              const targetId = e.target.dataset.goalId;
              if (!targetId) {
                return;
              }
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

        const addNewGoalButton = document.createElement("div");
        addNewGoalButton.classList.add(
          "list-group-item",
          "ps-2",
          "add-new-goal-button"
        );
        addNewGoalButtonIcon = document.createElement("span");
        addNewGoalButtonTitle = document.createElement("span");
        addNewGoalButtonIcon.classList.add("material-icons");
        addNewGoalButtonIcon.textContent = "add_circle";
        addNewGoalButtonTitle.textContent = "Add a new goal";
        goalList.appendChild(addNewGoalButton);
        addNewGoalButton.append(addNewGoalButtonIcon, addNewGoalButtonTitle);
        addNewGoalButton.addEventListener("click", (e) => {
          addNewGoal();
        });
        console.log(params.get("goal"));
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

//new goal 還沒寫完
const addNewGoal = async () => {
  const accessToken = localStorage.getItem("access_token");
  const dueDate = getTodayYMD();
  const dueDateUnix = Math.ceil(new Date(dueDate + "T23:59:59"));
  const body = {};
  const swalResult = await Swal.fire({
    title: "What is your goal?",
    input: "text",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to write something!";
      }
    },
  });
  if (!swalResult.value) {
    newGoal++
    InitializePage()
    return
  };
  body[`goal_title`] = swalResult.value;
  body[`goal_due_date`] = dueDate;
  body[`goal_due_date_unix`] = dueDateUnix;

  console.log("body: ", body);
  fetch(`/api/goal`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("restuls: ", data);
      if (data.error) {
        Swal.fire({
          icon: "warning",
          title: data.error,
          showConfirmButton: false,
        });
      } else {
        InitializePage(data.goal_id);
        renderGoalEditor(data.goal_id);
        swal
          .fire({
            title: "Start planning now!",
            html: '<div class="swal-align-left">Step 1. Pick a <strong>category</strong> for this goal <br> Step 2. Break down the goal into <strong>milestones</strong> and <strong>tasks</strong> <br> Step 3. Make sure to set <strong>due dates</strong> <br> Step 4. <a href="/horizon">Awesome! Then you will see the approach on your "Horizon" </a></div>',
            showConfirmButton: true,
          })
          .then((result) => {
            if (result.isConfirmed) {
              const goalEditorButton = document.querySelector(
                ".progress-view-goal-button"
              );
              goalEditorButton.click();
            }
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

getUser();
window.onload = InitializePage();
