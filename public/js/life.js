const container = document.querySelector(".life-dots");
const pageTitle = document.querySelector(".life-title");

const renderTitle = (userName) => {
  pageTitle.textContent = `${userName}'s Life in Weeks`;
};
const renderBaseWeeks = (birthday, today, byeDay) => {
  for (let i = birthday.year; i <= byeDay.year; i++) {
    const divYear = document.createElement("div");
    const labelAge = document.createElement("div");
    const labelYear = document.createElement("div");
    labelAge.classList.add("label-age");
    labelYear.classList.add("label-year");
    if ((i - birthday.year) % 5 === 0) {
      labelAge.innerText = i - birthday.year;
      labelYear.innerText = i;
    }
    divYear.classList.add("one-year");
    divYear.setAttribute("data-year", i);
    divYear.append(labelAge, labelYear);
    container.appendChild(divYear);
    for (let j = 1; j <= 52; j++) {
      const divWeek = document.createElement("div");
      divWeek.classList.add("one-week", `week${j}`);
      divWeek.setAttribute("id", `${i}-${j}`);
      divWeek.setAttribute("data-bs-toggle", "tooltip");
      divWeek.setAttribute("title", `Year ${i}, week ${j}`);

      if (i < today.year) {
        divWeek.classList.add("past");
      } else if (i == today.year && j < today.week) {
        divWeek.classList.add("past");
      }
      if (i == birthday.year && j < birthday.week) {
        divWeek.classList.add("no-display");
      } else if (i === byeDay.year && j > byeDay.week) {
        divWeek.classList.add("no-display");
      }

      labelYear.before(divWeek);
    }
  }
};
const renderGoals = (goals) => {
  goals.forEach((goal) => {
    const target = document.querySelector(`[id='${goal.year}-${goal.week}']`);
    target.classList.add("highlight", `category-${goal.category}`);
    target.setAttribute("title", goal.title);
    target.addEventListener("click", (e) => {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: false,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
      Toast.fire({
        title: `<a href="/review?goal_id=${goal.id}">Check out ${goal.title}! </a> `,
      });
    });
  });
};

const renderEvent = (event, className, title) => {
  const target = document.querySelector(`[id='${event.year}-${event.week}']`);
  target.classList.add(className);
  target.setAttribute("title", title);
};

const renderLife = () => {
  fetch(`/api/life`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const { birthday, today, byeDay, goals, userName } = data;
      const birthdayTitle = "Your birthday: " + birthday.date;
      const todayTitle = "Today: " + today.date;

      renderTitle(userName);
      renderBaseWeeks(birthday, today, byeDay);

      renderEvent(birthday, "birthday", birthdayTitle);
      renderEvent(today, "today", todayTitle);
      renderEvent(byeDay, "byeday", "Average life expectancy");
      renderGoals(goals);
    })
    .catch((err) => {
      console.log(err);
    });
};

getUser();
document.onload = renderLife();

const goalLegend = document.querySelector("#goal-legend");

document.addEventListener("click", (e) => {
  const goalLegendIsOpen = goalLegend.style.visibility === "visible";
  const main = document.querySelector(".main");
  if (goalLegendIsOpen) {
    main.classList.add("move-right");
  }
  if (!goalLegendIsOpen || e.target.classList.contains("btn-close")) {
    main.classList.remove("move-right");
  }
});
