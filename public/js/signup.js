const submitButton = document.querySelector(".sign-up-button");
const confirmPassword = document.querySelector("#confirm-password")
confirmPassword.addEventListener("input", e=>{
  const password = document.querySelector("#password")
  const passwordMatchedText = document.querySelector(".password-match")
  const passwordNotMatchedText = document.querySelector(".password-not-match")
  if(password.value === confirmPassword.value){
  passwordMatchedText.removeAttribute("hidden")
  passwordNotMatchedText.setAttribute("hidden", "hidden")
  } else {
    passwordNotMatchedText.removeAttribute("hidden")
    passwordMatchedText.setAttribute("hidden", "hidden")
  }
})
submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  const userName = document.querySelector("#name");
  const birthday = document.querySelector("#birthday");
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  const body = {
    name: userName.value,
    birthday: birthday.value,
    email: email.value,
    password: password.value,
  };
  fetch("/api/user/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      if (data.error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.error,
        });
      } else {
        const accessToken = data.data.accessToken;
        localStorage.setItem("access_token", accessToken);
        window.location.href = "/life";
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

getUser()