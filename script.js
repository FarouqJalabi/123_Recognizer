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
            //!Goes over the same pixels several times
            let imgd = ctx.getImageData(
                column * TIMES_BIGGER,
                row * TIMES_BIGGER,
                //size
                TIMES_BIGGER,
                TIMES_BIGGER
            );
            let pix = imgd.data;

            //? Possible to use reduce?
            // Add all pixel values to pixel
            let pixel = [0, 0, 0, 0];
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

            //*DONE
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
