//! First press akward

const BRUSH_WIDTH = 8;
const BOOST = 2.1; //Boosting white color

let modelChoice = document.querySelector("select");
modelChoice.addEventListener("change", changeModel);

let c = document.querySelector("#c");
let ctx = c.getContext("2d", { willReadFrequently: true });

let c2 = document.querySelector("#c2");
let ctx2 = c2.getContext("2d", { willReadFrequently: true });

let choices = document.querySelector("ul");

clearCanvas();

const TIMES_BIGGER = c.width / c2.width; //Assuming that it's a square
const PIXEL_BLOCK = c.width / TIMES_BIGGER;

// create a session
let myOnnxSession = new onnx.InferenceSession();
// load the ONNX model file
myOnnxSession.loadModel("./model_3.onnx");

let last_x = -1;
let last_y = -1;
let mouseDown = 0;
c.addEventListener("mousedown", () => mouseDown++);
c.addEventListener("mouseup", () => mouseDown--);

c.addEventListener("mousemove", (e) => draw(e));
c.addEventListener("click", (e) => draw(e, true));

c.addEventListener("mouseout", () => (mouseDown = 0));

c.addEventListener("touchstart", () => mouseDown++);
c.addEventListener("touchmove", (e) => draw(e.touches[0]));
c.addEventListener("touchend", (e) => {
    mouseDown = 0;
    draw(e.touches[0]);
});
c.addEventListener("touchcancel", () => (mouseDown = 0));

const draw = (e, click = false) => {
    console.log(mouseDown);
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
        let x = e.touches[0].clientX - rect.left;
        let y = e.touches[0].clientY - rect.top;
    }

    addRgba(x, y);
    runModel();
};
const addRgba = (x, y) => {
    if (last_x == -1 || last_y == -1) {
        last_x = x;
        last_y = y;
    }
    //Drawing on big board

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(x, y, BRUSH_WIDTH, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = BRUSH_WIDTH + 8;
    ctx.strokeStyle = "white";
    ctx.moveTo(last_x, last_y);
    ctx.lineTo(x, y);
    ctx.stroke();

    last_x = x;
    last_y = y;

    let final = ctx2.getImageData(0, 0, c2.width, c2.height);
    let final_data = final.data;
    for (let row = 0; row < c2.height; row++) {
        for (let column = 0; column < c2.width; column++) {
            let imgd = ctx.getImageData(
                column * TIMES_BIGGER,
                row * TIMES_BIGGER,
                //size
                TIMES_BIGGER,
                TIMES_BIGGER
            );
            let pix = imgd.data;

            // Add all pixel values to pixel
            let pixel = [0, 0, 0, 0];

            //? Possible to use reduce?
            for (let i = 0; i < pix.length; i += 4) {
                pixel[0] += pix[i + 0] * BOOST; //Red
                pixel[1] += pix[i + 1] * BOOST; //Green
                pixel[2] += pix[i + 2] * BOOST; //Blue
                pixel[3] += pix[i + 3] * BOOST; //Alpha
            }

            //Averge
            pixel[0] /= pix.length / 4;
            pixel[1] /= pix.length / 4;
            pixel[2] /= pix.length / 4;
            pixel[3] /= pix.length / 4;

            //Drawing pixel to final
            let pixel_pos =
                row * 4 + (column * 4 + row * (PIXEL_BLOCK - 1) * 4);
            final_data[pixel_pos + 0] = pixel[0]; //R
            final_data[pixel_pos + 1] = pixel[1]; //G
            final_data[pixel_pos + 2] = pixel[2]; //B
            final_data[pixel_pos + 3] = pixel[3]; //A
        }
    }
    ctx2.putImageData(final, 0, 0);
};

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
    const outputMap = await myOnnxSession.run([inputTensor]);
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
    for (ch of choices.children) {
        let id_number = ch.innerHTML.trim()[0];

        let presentage = Math.round(output[id_number] * 100) + "%";
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

    //? Maybe using show result function could look better
    for (ch of choices.children) {
        // result = ch.children[0];
        // result.innerHTML = "0";
        let spanWidth = ch.children[0].children[0];
        spanWidth.style.width = "0%";
    }
}

async function changeModel(e) {
    myOnnxSession = await new onnx.InferenceSession();
    await myOnnxSession.loadModel("./model_" + e.target.value + ".onnx");
    runModel();
}
