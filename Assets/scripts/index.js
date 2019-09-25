//Side nav toggle
const overlay = document.querySelector(".overlay--menu");
const btn_menu = document.querySelector(".btn--menu");

//Show/hide Skill modal
const skill_pills = document.querySelectorAll(".skill");
const modal = document.querySelector(".modal");
const btnModalClose = document.querySelector(".btn--close");

const modalDataList = [
  {
    header: "DEVELOPMENT",
    subhead: "refactor city. joy!",
    bodyText:
      "Front Developement is my soulmate, my daily bread, I'm obsessed. Best thing about it is that there's always something new to learn. ",
    items: ["ReactJS", "VueJS", "Sass", "Pug"]
  },
  {
    header: "UX/UI Design",
    subhead: "Too fun to be tough, so I thought...",
    bodyText:
      "I've always loved designing and illustrating even before I got into software development, transitioning to UX design was only natural and I love every bit of it. I still have a lot to learn though. ",
    items: ["AdobeXD", "PhotoShop", "Illustrator", "Figma"]
  },
  {
    header: "BACK-END DEVELOPMENT",
    subhead: "These folks stole all of my sleep",
    bodyText:
      "Brain food. This is were my 3 year of learning software engineering becomes useful. I work mostly with NodeJS but I'll happily dabble with .NET Core when needed.",
    items: ["NodeJS", "C#", ".NET MVC", ".NET Core"]
  }
];

skill_pills.forEach((pill, index) => {
  pill.addEventListener("click", () => {
    showOverlay();
    showItem(modalList, "grid");
    //Fill modal
    populateModal(modal, modalDataList[index], "tool");
  });
});
overlay.addEventListener("click", removeOverlay);
btnModalClose.addEventListener("click", removeOverlay);
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
    glitch();
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
  {
    name: "BLACKCHILD FAIRCHILD",
    color: "green",
    src:
      "https://res.cloudinary.com/swssr/image/upload/v1567119024/swssr/v3edsityrdc6wlyng0oh.png"
  },
  {
    name: "MERIT BRANDING",
    color: "powderblue",
    src:
      "https://res.cloudinary.com/swssr/image/upload/v1567205438/swssr/sztu5pdvcidcxeneeemy.png"
  },
  {
    name: "TUMISONG.DJ",
    color: "navy",
    src:
      "https://res.cloudinary.com/swssr/image/upload/v1567208498/swssr/vqghyhvfghcjnk2znivw.webp"
  },
  {
    name: "MpiloTech",
    color: "yellow",
    src:
      "https://res.cloudinary.com/swssr/image/upload/v1567213059/swssr/t6jcolitz8rbdrt0tqxe.webp"
  },
  {
    name: "FILR",
    color: "pink",
    src:
      "https://res.cloudinary.com/swssr/image/upload/v1567119024/swssr/zjfedfxofdrwkvtlvakp.png"
  }
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
  target.dataset.src = src;
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

//🐇🐇Easter egg
function glitch() {
  const scrollTexts = document.querySelectorAll(".scroll span");

  scrollTexts[0].classList.toggle("hidden");
  scrollTexts[1].classList.toggle("visible");
}

//Show resume modal preview
const btnShowResume = document.getElementById("btnShowResume");
const linkShowResume = document.getElementById("linkShowResume");
const form = document.querySelector(".modal__form");
const emailInput = document.querySelector("[name=email]");

[btnShowResume, linkShowResume].forEach(btn => {
  btn.addEventListener("click", showResume);
});

function showResume() {
  showOverlay();
  showItem(form, "grid");
  hideItem(modalList);

  populateModal(modal, {
    header: "WANT MY RESUME?",
    subhead: "TELLTALE SIGNS YOU FANCY ME",
    bodyText: `Submit your email below and I'll be sure to send it to you directly.`,
    more:
      "I call Durban work-home but always open to the world. Feel free to contact me for a project request."
  });
}

//handle toggle modal
function showOverlay() {
  toggleShow(overlay);
  toggleShow(modal);
  hideItem(form);
  bottomNav.classList.toggle("navdown");
}
function removeOverlay(e) {
  overlay.classList.remove("visible");
  modal.classList.remove("visible");
  bottomNav.classList.remove("navdown");
  hideItemDelay(overlay);
  hideItemDelay(modal);
  // toggleShow(overlay, true);
}
//Handle btn_menu click event: toggle menu visibility
function toggleShow(el, force) {
  // const force = arguments[1] || true;
  el.classList.toggle("visible", force) ? showItem(el) : hideItemDelay(el);
}
function showItem(el, display) {
  el.style.display = display || "block";
}
function hideItem(el) {
  el.style.display = "none";
}
function hideItemDelay(el) {
  setTimeout(() => {
    // debugger;
    el.style.display = "none";
  }, 250);
  clearTimeout();
}
//Populate modal with the right content based on pill clicked
const modalList = document.querySelector(".modal__list");

function populateModal(_modal, _data, _itemClass = "list__item") {
  const modalHead = _modal.querySelector(".head");
  const modalSubHead = _modal.querySelector(".subhead");
  const modalBody = _modal.querySelector(".body__text");

  const { header, subhead, bodyText, items } = _data;

  modalHead.textContent = header;
  modalSubHead.textContent = subhead;
  modalBody.textContent = bodyText;
  modalList.innerHTML = items
    .map(x => `<li class="${_itemClass}">${x}</li>`)
    .join("");
}
