const signOut = ()=> {
  localStorage.removeItem("access_token");
  window.location.href="/signup"
}

const renderNavLink = () => {
  const life = document.querySelector(".nav-link-life")
  const horizon = document.querySelector(".nav-link-horizon")
  const review = document.querySelector(".nav-link-review")
  const currentPath = window.location.pathname
  if(currentPath.includes("life")){
    life.classList.add("active")
  }else if(currentPath.includes("horizon")){
    horizon.classList.add("active")
  }else if(currentPath.includes("review")){
    review.classList.add("active")
  }
}

window.onload = renderNavLink()