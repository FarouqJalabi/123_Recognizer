/* global onnx */
("use strict");
/* global onnx */
/* exported onnx */

const BRUSH_WIDTH = 8;
const BOOST = 2.1; //Boosting white color

let c = document.querySelector("#c");
let ctx = c.getContext("2d", { willReadFrequently: true });

let c2 = document.querySelector("#c2");
let ctx2 = c2.getContext("2d", { willReadFrequently: true });

let c3 = document.querySelector("#c3");
let ctx3 = c3.getContext("2d", { willReadFrequently: true });

const choices = document.querySelector("ul");
const clearElement = document.querySelector("#clear");

clearCanvas();

const TIMES_BIGGER = c.width / c2.width; //Assuming that it's a square
const PIXEL_BLOCK = c.width / TIMES_BIGGER;

// create a session
const models = [
  new onnx.InferenceSession(),
  new onnx.InferenceSession(),
  new onnx.InferenceSession(),
];
models[0].loadModel("./model_1.onnx");
models[1].loadModel("./model_2.onnx");
models[2].loadModel("./model_3.onnx");
let current_model = 2; //Current model - 1

let last_x = -1;
let last_y = -1;
let mouseDown = 0;
c.addEventListener("mousedown", () => (mouseDown = 1));
c.addEventListener("mouseup", () => (mouseDown = 0));

c.addEventListener("mousemove", (e) => draw(e));
c.addEventListener("click", (e) => draw(e, true));

c.addEventListener("mouseout", () => (mouseDown = 0));

c.addEventListener("touchstart", () => (mouseDown = 1));
c.addEventListener("touchmove", (e) => draw(e.touches[0]));
c.addEventListener("touchend", (e) => {
  mouseDown = 0;
  draw(e.touches[0]);
});
c.addEventListener("touchcancel", () => (mouseDown = 0));

//! Drawing laggy on firefox
const draw = async (e, click = false) => {
  if (!mouseDown && !click) {
    last_x = -1;
    last_y = -1;
    return;
  }
  //Relative position
  let rect = c.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  if (x == undefined) {
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  }

  addRgba(x, y, e);
  runModel();
};

const addRgba = async (x, y, e) => {
  clearElement.hidden = false;
  if (last_x == -1 || last_y == -1) {
    last_x = x;
    last_y = y;
  }
  //Drawing on big board

  let times_factor = e.which != 3 ? 1 : 1.5;
  ctx.beginPath();
  ctx.fillStyle = e.which != 3 ? "white" : "black";
  ctx.arc(x, y, BRUSH_WIDTH * times_factor, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.lineWidth = BRUSH_WIDTH * times_factor + 8;
  ctx.strokeStyle = e.which != 3 ? "white" : "black";
  ctx.moveTo(last_x, last_y);
  ctx.lineTo(x, y);
  ctx.stroke();

  last_x = x;
  last_y = y;

  ctx2.drawImage(c, 0, 0, c.width, c.height, 0, 0, c2.width, c2.height);
  ctx3.drawImage(c, 0, 0, c.width, c.height, 0, 0, c2.width, c2.height);
};
// const addRgba = async (x, y, e) => {};

let arr = [1, 2, 3];
arr.reduce((prev, curr) => prev + curr);
async function runModel() {
  let img = ctx2.getImageData(0, 0, c2.width, c2.height).data;
  let img_r = new Float32Array(
    img.filter((v, i) => {
      // Img red channel, only what we need
      return i % 4 == 0;
    })
  );

  img_r = img_r.map((v) => {
    return v / 255;
  });
  // generate model input
  let inputTensor = new onnx.Tensor(img_r, "float32", [1, 1, 28, 28]);

  // execute the model

  const outputMap = await models[current_model].run([inputTensor]);
  const outputTensor = outputMap.values().next().value;
  const output = outputTensor.data;

  showResult(output);
}

function showResult(output) {
  //Homemade softmax
  let min = Math.min(...output);

  output = output.map((n) => n + Math.abs(min));

  let max = output.reduce((total, curr) => total + curr, 0); //Makes the sum to 1, do we want that?
  max = Math.max(...output); //Makes the highest one to one
  max = 50; //I think this is the max output by our model

  output = output.map((n) => n / max);

  //! Blind people can't see with, should be an alt text
  //?Blind people can't darw either?
  for (let ch of choices.children) {
    let id_number = ch.innerHTML.trim()[0];

    let presentage = Math.round(output[id_number] * 100);
    presentage = Math.max(presentage, 5.5) + "%";
    let spanWidth = ch.children[0].children[0];
    spanWidth.style.width = presentage;

    if (
      id_number == output.indexOf(Math.max(...output)) &&
      Math.max(...output) != 0
    ) {
      spanWidth.id = "topResult";
    } else {
      spanWidth.id = "";
    }
  }
}

function clearCanvas() {
  ctx.fillStyle = "Black";
  ctx.rect(0, 0, c.width, c.height);
  ctx.fill();
  ctx2.fillStyle = "Black";
  ctx2.rect(0, 0, c2.width, c2.height);
  ctx2.fill();
  ctx3.fillStyle = "Black";
  ctx3.rect(0, 0, c3.width, c3.height);
  ctx3.fill();

  clearElement.hidden = true;
  //? Maybe using show result function could look better
  for (let ch of choices.children) {
    // result = ch.children[0];
    // result.innerHTML = "0";
    let spanWidth = ch.children[0].children[0];
    spanWidth.style.width = "5.5%";
    spanWidth.id = "";
  }
}

const buttons = document.querySelectorAll("#logo > button");
const ball = document.querySelector("#logoCircle");
const ballPositions = ["margin:0", "margin:auto;", "margin:0 0 0 auto"];

async function changeModel(number) {
  console.log("Well?", number);
  console.log("Well?", buttons);

  buttons.forEach((button) => {
    console.log(number, button.innerHTML);
    if (button.innerHTML.trim() != number) {
      button.style.color = "var(--accent-1)";
    } else {
      button.style.color = "var(--action-1)";
      ball.className = "p" + number;
      if (number == "1") {
        ball.style = "margin-left: 0%;";
      } else if (number == "2") {
        ball.style = "margin-left: 50%; transform:translateX(-50%)";
      } else if (number == "3") {
        ball.style = "margin-left: 100%; transform:translateX(-100%)";
      }
    }
  });

  current_model = Number(number) - 1;
  //Run only when drawn on screen
  if (!clearElement.hidden) {
    runModel();
  }
}

let overlay_img = document.querySelector("#smallOverlay");
function changeView() {
  if (document.getElementById("viewChanger").value == "Human") {
    overlay_img.src = "/robot.png";
    document.getElementById("viewChanger").value = "Robot";
    document.getElementById("viewChanger").innerHTML = "Robot view 🤖";
    document.getElementById("c3").hidden = false;
  } else {
    overlay_img.src = "/human.png";
    document.getElementById("viewChanger").value = "Human";
    document.getElementById("viewChanger").innerHTML = "Human view 👀";
    document.getElementById("c3").hidden = true;
  }
}

// Theme handlers

const rootVarNames = [
  "--background",
  "--background-accent",
  "--accent-1",
  "--accent-2",
  "--text-color",
];

const lightTheme = ["#fefefe", "#d0dacd", "#a8dadc", "#457b9d", "black"];
const darkTheme = ["#282634", "#54506b", "#c1b8fa", "#5c48db", "white"];

//Whene theme button change
document.querySelector("#themeButton").addEventListener("change", (e) => {
  console.log(e.currentTarget.checked);
  if (e.currentTarget.checked) {
    for (let name in rootVarNames) {
      document.documentElement.style.setProperty(
        rootVarNames[name],
        darkTheme[name]
      );
    }
  } else {
    for (let name in rootVarNames) {
      document.documentElement.style.setProperty(
        rootVarNames[name],
        lightTheme[name]
      );
    }
  }
});
