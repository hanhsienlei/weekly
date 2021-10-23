const milestonesNumTasks = [10, 10, 20, 10, 20];
const milestonesAchievements = [10, 5, 15, 10, 20];
const milestonesNames = [
  "Milestone 1",
  "Milestone 2",
  "Milestone 3",
  "Milestone 4",
  "not done yet",
];
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
    labels: milestonesNames,
    datasets: [
      {
        label: "Goal Achievement",
        data: milestonesAchievements,
        // backgroundColor: [
        // ],
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
    scales:{
      "y0":{
        display:false
      },
    }
},
  data: {
    labels: milestonesNames,
    datasets: [
      {
        type: "bar",
        label: "done tasks",
        data: milestonesAchievements,
        fill: false,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
        ],
        yAxisID: "y0"
      },
      {
        type: "bar",
        label: "total tasks",
        data: milestonesNumTasks,
        fill: false,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
        ],
        yAxisID: "y1",
      },
    ],
  },
});
