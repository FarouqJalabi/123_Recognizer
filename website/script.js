const BRUSH_WIDTH = 5;

let c = document.querySelector("canvas");
let ctx = c.getContext("2d", { willReadFrequently: true });
ctx.fillStyle = "Black";
ctx.rect(0, 0, c.width, c.height);
ctx.fill();

let c2 = document.querySelector("#c");
let ctx2 = c2.getContext("2d");
ctx2.fillStyle = "Black";
ctx2.rect(0, 0, c2.width, c2.height);
ctx2.fill();

const TIMES_BIGGER = c.width / c2.width; //Assuming that it's a square
const PIXEL_BLOCK = c.width / TIMES_BIGGER;

//! pressing while going out
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

//Need to get the pixels the mouse is leaning to and then adding rgba
const addRgba = (x, y) => {
    //Drawing
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(x, y, BRUSH_WIDTH, 0, 2 * Math.PI);
    ctx.fill();

    let final = ctx2.getImageData(0, 0, c2.width, c2.height);
    let final_data = final.data;

    let row = 1;
    let column = 10;

    for (let row = 0; row < c2.height; row++) {
        for (let column = 0; column < c2.width; column++) {
            //!Goes over the same pixels several times
            let imgd = ctx.getImageData(
                (column + 1) * (TIMES_BIGGER - 1),
                (row + 1) * (TIMES_BIGGER - 1),
                //size
                PIXEL_BLOCK,
                PIXEL_BLOCK
            );
            let pix = imgd.data;

            //? Possible to use reduce?
            // Add all pixel values to pixel
            let pixel = [0, 0, 0, 0];
            for (let i = 0; i < pix.length; i += 4) {
                pixel[0] += pix[i + 0] * 3.1; //Red
                pixel[1] += pix[i + 1] * 3.1; //Green
                pixel[2] += pix[i + 2] * 3.1; //Blue
                pixel[3] += pix[i + 3] * 3.1; //Alpha
            }

            //Averge
            pixel[0] /= pix.length / 4;
            pixel[1] /= pix.length / 4;
            pixel[2] /= pix.length / 4;
            pixel[3] /= pix.length / 4;

            //*DONE
            let pixel_pos =
                row * 4 + (column * 4 + row * (PIXEL_BLOCK - 1) * 4);
            final_data[pixel_pos + 0] = pixel[0];
            final_data[pixel_pos + 1] = pixel[1];
            final_data[pixel_pos + 2] = pixel[2];
            final_data[pixel_pos + 3] = pixel[3];
        }
    }

    ctx2.putImageData(final, 0, 0);
};
