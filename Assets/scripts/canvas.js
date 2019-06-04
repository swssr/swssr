//#region declarations
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
//#endregion

//#region Utility function
function fitCanvas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

function updateCursor(e) {}

function isAtEdge(object) {
  let atEdge = false;

  const { objX, objY } = object;

  if (objY >= innerWidth || objY >= innerHeight || objY <= 0 || objX <= 0) {
    atEdge = true;
  }

  return atEdge;
}
//#endregion

const cursor = {
  x: 100,
  y: 100
};

class Item {
  constructor(x, y, w, h, mod) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = mod.speed || 0;
    //Modified appearence
    this.color = mod.color || "rgba(0,0,0,1)";
    this.isCircle = mod.isCircle || false;
    //type: Object, has width, color
    this.stroke = mod.stroke || null;
  }
  draw() {
    c.fillStyle = this.color;
    c.strokeStyle = this.color;
    if (!this.isCircle) {
      c.fillRect(this.x, this.y, this.w, this.h);
    } else {
      c.ellipse(this.x, this.y, this.w, this.h);
    }
  }
  update() {
    //TODO:
    this.x += this.speed;
    //Wall collion behavior
    const isAtEdge = () => {
      let test = true;
      if (this.y > window.innerHeight || this.x > window.innerWidth) {
        console.log({
          self: {
            x: this.x
          },
          world: {
            innerWidth,
            innerHeight
          }
        });
        test = true;
      }
      return test;
    };
    if (isAtEdge) {
      //Not realistic, should bounce off wall depending curr direction, Imma roll with it for now.
      this.x -= this.speed;
    }

    this.y += 20;
  }
}

function setup() {
  fitCanvas();
  window.addEventListener("resize", fitCanvas);
  window.addEventListener("mousemove", e => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
  });
}
let speed = 0;

function animate() {
  c.fillStyle = "rgba(255,255,255,0.2)";
  c.fillRect(0, 0, innerWidth, innerHeight);

  requestAnimationFrame(animate);
}

setup();
animate();
