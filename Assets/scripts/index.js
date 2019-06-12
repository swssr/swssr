//Side nav toggle
const overlay = document.querySelector(".overlay--menu");
const btn_menu = document.querySelector(".btn--menu");

//Handle btn_menu click event: toggle menu visibility
function toggleShow(el) {
  // const force = arguments[1] || true;
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
  pill.addEventListener("click", () => {
    toggleShow(overlay);
    toggleShow(modal);
    navbar.classList.toggle("navdown");
  });
});

//Remove modal
document.querySelector(".btn--close").addEventListener("click", () => {
  toggleShow(modal);
  toggleShow(overlay);
  navbar.classList.toggle("navdown");
  // toggleShow(overlay, true);
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

//Switch Project preview IMG
const preview = document.querySelector("canvas#proj-preview");
const projects_lis = document.querySelectorAll("li.list__item");

const sources = [
  { color: "gold", src: "https://project.swss.now.sh" },
  { color: "navy", src: "https://project.swss.now.sh" },
  { color: "powderblue", src: "https://project.swss.now.sh" },
  { color: "yellow", src: "https://project.swss.now.sh" },
  { color: "black", src: "https://project.swss.now.sh" },
  { color: "pink", src: "https://project.swss.now.sh" }
];

//Default bg
switchImage(0);

projects_lis.forEach((item, index, arr) => {
  item.addEventListener("click", e => {
    toggleActive(e, arr, index);
    switchImage(index);
  });
});

function toggleActive(e, arr, index) {
  //Toggle active
  projects_lis.forEach(li => li.classList.remove("list__item--active"));
  e.currentTarget.classList.add("list__item--active");
}

function switchImage(index) {
  //Change preview image
  const color = sources[index].color;
  // preview.style.src = color;
}
//Handle load
const introduction = document.querySelector(".overlay--intro");

const debounce = 500;
(() => {
  if (localStorage.getItem("init")) {
    setTimeout(() => {
      introduction.classList.remove("loading");
      console.log("nth time");
    }, debounce);
  } else {
    localStorage.setItem("init", "once");
    introduction.classList.remove("loading");
    console.log("first time");
  }
})();
