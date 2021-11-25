const submitButton = document.querySelector(".sign-in-button");

submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  const body = {
    email: email.value,
    password: password.value,
    provider: "native",
  };
  fetch("/api/user/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.error,
        });
      } else {
        const accessToken = data.data.accessToken;
        localStorage.setItem("access_token", accessToken);
        window.location.href = "/horizon";
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

getUser()