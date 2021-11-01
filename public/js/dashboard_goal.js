const goalSelector = document.querySelector(".goal-selector");
const renderGoalProgress = async (goal_id) => {
  fetch(`/api/goal/progress?goal_id=${goal_id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
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
      console.log(doughnutLabels, doughnutData);
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
      progressGoalTitle.textContent = g_title;
      progressGoalDueDate.textContent = `Due date: ${g_due_date}`;
      progressMilestoneSum.textContent = `${g_summary.milestone[0]} / ${g_summary.milestone[1]} milestones`;
      progressTaskSum.textContent = `${g_summary.task[0]} / ${g_summary.task[1]} tasks`;
      goalSelector.addEventListener("change", (e) => {
        doughnut.destroy();
        bar.destroy();
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

window.onload = renderGoalProgress(1);
window.onload = renderGoalSelector(1);
