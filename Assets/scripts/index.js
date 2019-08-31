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
    // debugger;
    el.style.display = "none";
  }, 250);
  clearTimeout();
}

//Show/hide Skill modal
const skill_pills = document.querySelectorAll(".skill");
const modal = document.querySelector(".modal");
const btnModalClose = document.querySelector(".btn--close");

const modalDataList = [
  {
    header: "FRONT-END DEVELOPMENT",
    bodyText:
      "Front Developement is my soulmate, my daily bread, I'm obsessed. Best thing about it is that there's always something new to learn. ",
    items: ["ReactJS", "VueJS", "Sass", "Pug"]
  },
  {
    header: "BACK-END DEVELOPMENT",
    bodyText:
      "Brain food. This is were my 3 year of learning software engineering becomes useful. I use with NodeJS and .NET Core when building server. There's always room too learn new stuff",
    items: ["NodeJS", "C#", "ASP.NET MVC", "ASP.NET Core"]
  },
  {
    header: "UX/UI Design",
    bodyText:
      "I've always loved designing and illustrating, even before I got into software development, this was only natural and I love every bit of it. I still have a lot to learn though. ",
    items: ["AdobeXD", "Adobe PhotoShop", "Adobe Illustrator", "Figma"]
  }
];

skill_pills.forEach((pill, index) => {
  pill.addEventListener("click", () => {
    toggleShow(overlay);
    toggleShow(modal);
    bottomNav.classList.toggle("navdown");

    //Fill modal
    populateModal(modal, modalDataList[index]);
  });
});

//Populate modal with the right content based on pill clicked

function populateModal(_modal, _data) {
  const modalHead = _modal.querySelector(".head");
  const modalBody = _modal.querySelector(".body__text");
  const modalList = _modal.querySelector(".modal__list");

  modalHead.textContent = _data.header;
  modalBody.textContent = _data.bodyText;
  modalList.innerHTML = _data.items
    .map(x => `<li class="tool">${x}</li>`)
    .join("");
}
//Remove modal
function removeOverlay(e) {
  overlay.classList.remove("visible");
  modal.classList.remove("visible");
  bottomNav.classList.remove("navdown");
  hideItem(overlay);
  hideItem(modal);
  // toggleShow(overlay, true);
}
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
    color: "navy",
    src:
      "https://res.cloudinary.com/swssr/image/upload/v1567208498/swssr/vqghyhvfghcjnk2znivw.webp"
  },
  {
    color: "powderblue",
    src:
      "https://res.cloudinary.com/swssr/image/upload/v1567205438/swssr/sztu5pdvcidcxeneeemy.png"
  },
  {
    color: "yellow",
    src:
      "https://res.cloudinary.com/swssr/image/upload/v1567213059/swssr/t6jcolitz8rbdrt0tqxe.webp"
  },
  {
    color: "black",
    src:
      "https://res.cloudinary.com/swssr/image/upload/v1567119024/swssr/v3edsityrdc6wlyng0oh.png"
  },
  {
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

//Easter egg
function glitch() {
  const scrollTexts = document.querySelectorAll(".scroll span");

  scrollTexts[0].classList.toggle("hidden");
  scrollTexts[1].classList.toggle("visible");
}
