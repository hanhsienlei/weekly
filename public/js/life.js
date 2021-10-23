const main = document.querySelector(".main");
const renderWeeks = (numYears) => {
  for (let i = 0; i < numYears; i++) {
    const label = document.createElement("div");
    const divYear = document.createElement("div");
    label.className = "year-label"
    label.innerText = i
    divYear.className = "one-year";
    divYear.appendChild(label);
    main.appendChild(divYear);
    for (let j = 0; j < 52; j++) {
      const divWeek = document.createElement("div");
      divWeek.className = "one-week";
      divYear.appendChild(divWeek)
    }
  }
};
renderWeeks(80)