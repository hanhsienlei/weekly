const submitButton = document.querySelector("button");

submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  const body = {
    email: email.value,
    password: password.value,
    provider: "native"
  };
  fetch("/api/user/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      if(data.error){
        alert(data.error)
      } else {
        const access_token = data.data.access_token
        localStorage.setItem("access_token", access_token)
        window.location.href="/horizon"
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
