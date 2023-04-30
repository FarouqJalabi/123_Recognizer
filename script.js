//! pressing while going out
//! Clearing cnavas not working

const BRUSH_WIDTH = 8;
const BOOST = 2.1; //Boosting white color

let c = document.querySelector("canvas");
let ctx = c.getContext("2d", { willReadFrequently: true });
ctx.fillStyle = "Black";
ctx.rect(0, 0, c.width, c.height);
ctx.fill();

let c2 = document.querySelector("#c");
let ctx2 = c2.getContext("2d", { willReadFrequently: true });
ctx2.fillStyle = "Black";
ctx2.rect(0, 0, c2.width, c2.height);
ctx2.fill();

let choices = document.querySelector("ul");

const TIMES_BIGGER = c.width / c2.width; //Assuming that it's a square
const PIXEL_BLOCK = c.width / TIMES_BIGGER;

let mouseDown = 0;
c.addEventListener("mousedown", () => mouseDown++);
c.addEventListener("mouseup", () => mouseDown--);

c.addEventListener("mousemove", (e) => draw(e));
c.addEventListener("click", (e) => draw(e, true));

const draw = (e, click = false) => {
    if (!mouseDown && !click) return;

    //Relative position
    let rect = c.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    addRgba(x, y, 0.2);
};

const addRgba = (x, y) => {
    //Drawing on big board
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(x, y, BRUSH_WIDTH, 0, 2 * Math.PI);
    ctx.fill();

    // let row = 0;
    // let column = 0;

    //Converting to 28*28

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

async function runExample() {
    // create a session
    const sess = new onnx.InferenceSession();
    // load the ONNX model file
    await sess.loadModel("./model_0.onnx");

    let exampleInput = new Float32Array([
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.1608, 0.4863, 0.6196, 0.0706, 0.0, 0.5176, 0.8667, 0.302, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.2667, 0.5922, 0.9333, 0.9961, 0.9961, 0.5529, 0.0275,
        0.8235, 0.9961, 0.9804, 0.1961, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3373, 0.8118, 0.9922, 0.9961,
        0.9961, 0.9961, 0.9961, 0.6706, 0.4157, 0.9961, 0.9961, 0.7608, 0.1137,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1647,
        0.7804, 0.9922, 0.9961, 0.9961, 0.9961, 0.8627, 0.5647, 0.349, 0.1843,
        0.8902, 0.9961, 0.9843, 0.2275, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.2627, 0.8, 0.9725, 0.9961, 0.9961, 0.9961, 0.7765,
        0.4, 0.0353, 0.0, 0.1608, 0.8863, 0.9961, 0.9961, 0.5412, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5922, 0.9686, 0.9961,
        0.9961, 0.9412, 0.6863, 0.2392, 0.0118, 0.0, 0.0, 0.0353, 0.702, 0.9961,
        0.9961, 0.7373, 0.0235, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.6431, 0.9961, 0.9961, 0.7804, 0.2196, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.5176, 0.9961, 0.9961, 0.949, 0.1451, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.9216, 0.9961,
        0.8431, 0.2353, 0.0902, 0.0, 0.0, 0.0353, 0.3725, 0.9137, 0.9961,
        0.9059, 0.3843, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.3961, 0.8627, 0.9961, 0.9961, 0.9255, 0.8667, 0.8,
        0.8353, 0.9961, 0.9961, 0.9961, 0.498, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0431, 0.3529,
        0.8, 0.9804, 0.9961, 0.9961, 0.9961, 0.9961, 0.9961, 0.898, 0.0353, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.6157, 0.9961, 0.9961, 0.9961, 0.9961, 0.9961,
        0.9765, 0.6471, 0.0902, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0824, 0.4157, 0.9176, 0.9961,
        0.9961, 0.8706, 0.3569, 0.4627, 0.7922, 0.9686, 0.7451, 0.0353, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.1686, 0.7804, 0.9961, 0.9961, 0.9961, 0.651, 0.102, 0.0, 0.0, 0.0,
        0.4706, 0.9961, 0.4118, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.2784, 0.898, 0.9961, 0.9961, 0.8667, 0.3765,
        0.0314, 0.0, 0.0, 0.0, 0.0, 0.0235, 0.8157, 0.6235, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3804, 0.9098, 0.9961,
        0.9961, 0.7216, 0.1373, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0118, 0.7843,
        0.9608, 0.1176, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.6431, 0.9961, 0.9961, 0.6471, 0.0235, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.2431, 0.9961, 0.9686, 0.1608, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.6431, 0.9961, 0.8118, 0.0392, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.1804, 0.7725, 0.9961, 0.7961, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2902, 0.9765,
        0.9961, 0.8275, 0.6314, 0.3765, 0.1922, 0.2157, 0.3765, 0.3765, 0.651,
        0.8431, 0.9961, 0.9961, 0.4588, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4078, 0.8549, 0.9961, 0.9961, 0.9961,
        1.0, 0.9961, 0.9961, 0.9961, 1.0, 0.9961, 0.9922, 0.549, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0902,
        0.5216, 0.6588, 0.8471, 0.9961, 0.9961, 0.9961, 0.9961, 0.7216, 0.502,
        0.1804, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    ]);
    //Running the model
    let inputTensor = new onnx.Tensor(exampleInput, "float32", [1, 1, 28, 28]);
    const outputMap = await sess.run([inputTensor]);

    //Getting data to normal array
    const outputData = outputMap;
    output = outputData.values().next().value.data;
    output = [...output];

    //Homemade softmax
    min = Math.min(...output);
    output = output.map((n) => n + Math.abs(min));

    max = output.reduce((total, curr) => total + curr, 0); //Makes the sum to 1, do we want that?
    max = Math.max(...output); //Makes the highest one to one
    max = 30; //I think this is the max output by our model

    output = output.map((n) => n / max);

    console.log(output);

    //? of and in difference? only of works?
    //* of get's the actual childre object
    //* in get's the index
    for (c of choices.children) {
        result = c.children[0];
        id_number = Number(result.id);
        result.innerHTML = Math.round(output[id_number] * 100);
        if (id_number == output.indexOf(Math.max(...output))) {
            c.className = "Hello";
        } else {
            c.className = "No";
        }
    }
}
runExample();
