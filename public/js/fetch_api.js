// save goal
//1. fetch save goal
//2.1 if res.ok, render goal
//2.2 if !res.ok, alert 

function saveGoal(){
  const goalTitle = document.querySelector(".goal-title").textContent
  const goalId = document.querySelector(".goal-title").dataset.goalId
  const goalDescription = document.querySelector(".goal-description").value
  const goalDueDate = document.querySelector(".goal-due-date").value
  const goalDueDateUnix = Math.ceil(new Date(goalDueDate+ "T23:59:59"))
  const select = document.querySelector(".purpose-selector")
	const option = select.options[select.selectedIndex];
  const goalPurposeId = option.value

  const body = {
    goal_id:goalId,
    goal_title: goalTitle,
    goal_due_date: goalDueDateUnix,
    goal_description: goalDescription,
    goal_purpose_id: goalPurposeId
  }
  fetch("/api/goal",{
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body)
  })
  .then(result=>{
    console.log("save goal: ", result.statusText)
  }).catch(err=>{console.log(err)})
}

