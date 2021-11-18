const accessToken = localStorage.getItem("access_token");
const currentPath = window.location.pathname;
const isSignupSignup = currentPath === "/signin" || currentPath === "/signup";
const getUser = async () => {
  fetch(`/api/user/profile`, {
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error && !isSignupSignup) {
        Swal.fire({
          icon: "warning",
          title: "Please sign in first",
        }).then(() => {
          window.location.pathname = "/signin";
          return;
        });
      } else if (!data.error && isSignupSignup) {
        Swal.fire({
          icon: "success",
          title: `Welcome back, ${data.data.name}!`,
        }).then(() => {
          window.location.pathname = "/life";
          return;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
const categoryIcons = ["💼", "👪", "💰", "🎨", "🧘🏼", "🚀", "🤾🏼", "💗", "🗺️"]
const categoryMaterialIcons = ["business_center", "groups", "savings", "palette", "self_improvement", "rocket_launch", "directions_run",  "volunteer_activism", "sailing"]
