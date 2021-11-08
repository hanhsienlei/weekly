const accessToken = localStorage.getItem("access_token");
const main = document.querySelector(".main");
const renderBaseWeeks = (birthday, today, byeDay) => {
  for (let i = birthday.year; i <= byeDay.year; i++) {
    const divYear = document.createElement("div");
    const labelAge = document.createElement("div");
    const labelYear = document.createElement("div");
    labelAge.classList.add("label-age")
    labelYear.classList.add("label-year")
    if ((i - birthday.year) % 5 === 0){
      labelAge.innerText = i - birthday.year
      labelYear.innerText = i
    }
    divYear.classList.add("one-year");
    divYear.setAttribute("data-year", i)
    divYear.append(labelAge, labelYear);
    main.appendChild(divYear)
    for (let j = 1; j <= 52; j++) {
      const divWeek = document.createElement("div");
      divWeek.classList.add("one-week", `week${j}` );
      divWeek.setAttribute("id", `${i}-${j}`)
      divWeek.setAttribute("data-bs-toggle", "tooltip")
      divWeek.setAttribute("title", `Year ${i}, week ${j}`)

      if(i < today.year){
        divWeek.classList.add("past")
      }else if(i == today.year && j < today.week){
        divWeek.classList.add("past")
      }
      if (i == birthday.year && j < birthday.week){
        divWeek.classList.add("no-display")
      }else if(i === byeDay.year && j > byeDay.week){
        divWeek.classList.add("no-display")
      }

      labelYear.before(divWeek)
    }
    console.log("done")
  }
};
const renderEvents = (goals) => {
  goals.forEach(goal=>{
    const target = document.querySelector(`[id='${goal.year}-${goal.week}']`)
    target.classList.add("highlight")
    target.setAttribute("title", goal.title)
    const link = document.createElement("a")
    link.setAttribute("href", `/dashboard/goal?id=${goal.id}`)
  //還沒做完
  })
}


const renderLife = ()=>{
fetch(`/api/life`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      const{birthday, today, byeDay, goals} = data
      renderBaseWeeks(birthday, today, byeDay)
      renderEvents(goals)
    })
    .catch((err) => {
      console.log(err);
    });
}
  document.onload = renderLife()