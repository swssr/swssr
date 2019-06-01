//Side nav toggle
const overlay = document.querySelector(".overlay--menu");
const btn_menu = document.querySelector(".btn--menu");

//Handle btn_menu click event: toggle menu visibility
function toggleShow(el) {
  el.classList.toggle("visible") ? showItem(el) : hideItem(el);
}
function showItem(el) {
  el.style.display = "block";
}
function hideItem(el) {
  setTimeout(() => {
    el.style.display = "none";
  }, 250);
}
btn_menu.addEventListener("click", () => toggleShow(overlay));

//Show/hide Skill modal
const skill_pills = document.querySelectorAll(".skill");
const modal = document.querySelector(".modal");

skill_pills.forEach(pill => {
  pill.addEventListener("click", () => toggleShow(modal));
});

//Remove modal
document.querySelector(".btn--close").addEventListener("click", () => {
  toggleShow(modal);
});

//Hide bottom nav when intro is visible
const navbar = document.querySelector(".nav.alpha");
const intro = document.querySelector(".overlay");

//Intersection observer setup
const margin = Math.round(innerHeight / 2.5);
let options = {
  root: null,
  rootMargin: `-${margin}px`,
  treshold: 1.0
};

let toggleNav = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navbar.classList.toggle("navdown");
    } else {
      navbar.classList.remove("navdown");
    }
  });
};

let IO = new IntersectionObserver(toggleNav, options);

IO.observe(intro);
