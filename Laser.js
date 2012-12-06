// Globals
var stageCanvas = document.createElement("canvas");
stageCanvas.width = 640;//window.innerWidth;
stageCanvas.height = 480;//window.innerHeight;
document.body.appendChild(stageCanvas);

var hiddenCanvas = document.createElement("canvas");
hiddenCanvas.width = 640;
hiddenCanvas.height = 480;
document.body.appendChild(hiddenCanvas);

var stageContext = stageCanvas.getContext('2d');
var hiddenContext = hiddenCanvas.getContext('2d');
var stage = new createjs.Stage(stageCanvas);

var video = document.getElementById('webcam');
var img_u8 = new jsfeat.matrix_t(video.width, video.height, jsfeat.U8_t | jsfeat.C1_t);
img_u8_warp = new jsfeat.matrix_t(640, 480, jsfeat.U8_t | jsfeat.C1_t);

compatibility.getUserMedia({video: true}, function (stream)
{
    try
    {
        video.src = compatibility.URL.createObjectURL(stream);
    }
    catch (error)
    {
        video.src = stream;
    }
    video.addEventListener('canplay', function ()
    {
        video.removeEventListener('canplay');
        setTimeout(function ()
        {
            video.play();

            compatibility.requestAnimationFrame(filterRed);
        }, 500);
    }, true);
}, function (error)
{
    alert('WebRTC not available. ' + error);
});

var threshold = { r: 50 };
var gui = new dat.GUI();
gui.add(threshold, 'r').min(0).max(255);

var warp = { x1: 0, y1: 0, x2: 640, y2: 0, x3: 640, y3: 480, x4: 0, y4: 480 };
gui.add(warp, 'x1').min(-640).max(640*2);
gui.add(warp, 'y1').min(-480).max(480*2);
gui.add(warp, 'x2').min(-640).max(640*2);
gui.add(warp, 'y2').min(-480).max(480*2);
gui.add(warp, 'x3').min(-640).max(640*2);
gui.add(warp, 'y3').min(-480).max(480*2);
gui.add(warp, 'x4').min(-640).max(640*2);
gui.add(warp, 'y4').min(0-480).max(480*2);

function filterRed()
{
    compatibility.requestAnimationFrame(filterRed);

    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    // TODO: don't recalculate every frame
    var transform = [];
    jsfeat.transform.perspective_4point_transform(transform,
        0,   0,  warp.x1, warp.y1,
        640, 0,   warp.x2, warp.y2,
        640, 480, warp.x3, warp.y3,
        0,   480, warp.x4, warp.y4);
    jsfeat.transform.invert_perspective_transform(transform, transform);

    hiddenContext.drawImage(video, 0, 0);

    var imageData = hiddenContext.getImageData(0, 100, video.width, video.height-200);

    //jsfeat.imgproc.grayscale(imageData.data, img_u8.data);
    jsfeat.imgproc.filterRGB(imageData.data, img_u8.data, threshold);

    jsfeat.imgproc.warp_perspective(img_u8, img_u8_warp, transform, 0);

    // render result back to canvas
    var data_u32 = new Uint32Array(imageData.data.buffer);
    var alpha = (0xff << 24);
    var i = img_u8_warp.cols * img_u8_warp.rows, pix = 0;
    while (--i >= 0)
    {
        pix = img_u8_warp.data[i];
        data_u32[i] = alpha | (0 << 16) | (pix << 8) | 0;
    }

    stageContext.putImageData(imageData, 0, 100);
}

// draw UI to screen
// get webcam image of screen
// filter webcam image to contain only laser light
// warp webcam image to fit to screen image (4point_transform)
// count pixels in webimage in target areas
// update UI