//Side nav toggle
const overlay = document.querySelector(".overlay--menu");
const btn_menu = document.querySelector(".btn--menu");

//Handle btn_menu click event: toggle menu visibility
function toggleShow(el, force) {
  // const force = arguments[1] || true;
  el.classList.toggle("visible", force) ? showItem(el) : hideItem(el);
}
function showItem(el) {
  el.style.display = "block";
}
function hideItem(el) {
  setTimeout(() => {
    el.style.display = "none";
  }, 250);
  clearTimeout();
}

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
function removeOverlay(e) {
  overlay.classList.remove("visible");
  modal.classList.remove("visible");
  bottomNav.classList.remove("navdown");
  hideItem(overlay);
  // toggleShow(overlay, true);
}
overlay.addEventListener("click", removeOverlay);

//Hide bottom nav when intro is visible
const bottomNav = document.querySelector(".nav.fixed--bottom");
const topmNav = document.querySelector(".nav.fixed--top");
const sect1 = document.querySelector(".main");

//Show hide menu
btn_menu.addEventListener("click", () => {
  toggleShow(overlay);
  bottomNav.classList.add("navdown");
});

//Intersection observer setup
const margin = 0;

let options = {
  rootMargin: "-10px",
  treshold: 1
};

let toggleNav = entries => {
  entries.forEach(entry => {
    console.log(entry.target);
    if (!entry.isIntersecting) {
      topmNav.classList.add("navup");
      bottomNav.classList.add("navdown");
    } else {
      console.log("notIntersecting");
      topmNav.classList.remove("navup");
      bottomNav.classList.remove("navdown");
    }
  });
};

let IO = new IntersectionObserver(toggleNav, options);

IO.observe(sect1);

//Switch Project preview images
const preview = document.querySelector("#proj-preview");
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
switchImage(preview, 0);

projects_lis.forEach((item, index, arr) => {
  item.addEventListener("click", e => {
    toggleActive(e, arr, index);
    switchImage(preview, index);
  });
});

function toggleActive(e, arr, index) {
  //Toggle active
  projects_lis.forEach(li => li.classList.remove("list__item--active"));
  e.currentTarget.classList.add("list__item--active");
}

function switchImage(target, index) {
  //Change preview image
  const { src } = sources[index];
  target.src = src;
}
//Handle load
const introduction = document.querySelector(".overlay--intro");

const debounce = 500;
(() => {
  if (localStorage.getItem("init")) {
    setTimeout(() => {
      introduction.classList.remove("loading");
    }, debounce);
  } else {
    localStorage.setItem("init", "once");
    introduction.classList.remove("loading");
  }
})();

//Menu item click
const menuLink = document.querySelectorAll(".menu__links .link");

menuLink.forEach(link => {
  link.addEventListener("click", removeOverlay);
});
