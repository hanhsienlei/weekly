const accessToken = localStorage.getItem("access_token");
const currentPath = window.location.pathname;
const isSignupSignup = currentPath === "/signin" || currentPath === "/signup";
const getUser = async () => {
  if (!accessToken) return;
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
      } else {
        return;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
const categoryMaterialIcons = [
  "business_center",
  "groups",
  "savings",
  "palette",
  "self_improvement",
  "rocket_launch",
  "directions_run",
  "volunteer_activism",
  "sailing",
];
const getTodayYMD = () => {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString();
  const month2Digit = month.length === 1 ? `0${month}` : month;
  const date = today.getDate().toString();
  const date2Digit = date.length === 1 ? `0${date}` : date;
  const todayYMD = `${year}-${month2Digit}-${date2Digit}`;
  return todayYMD;
};
