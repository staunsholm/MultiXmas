// Globals
var stageCanvas = document.createElement("canvas");
stageCanvas.width = window.innerWidth;
stageCanvas.height = window.innerHeight;
document.body.appendChild(stageCanvas);

var stageContext = stageCanvas.getContext('2d');
var stage = new createjs.Stage(stageCanvas);

var video = document.getElementById('webcam');
var img_u8 = new jsfeat.matrix_t(video.width, video.height, jsfeat.U8_t | jsfeat.C1_t);

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

var threshold = { r: 100, g: 100, b: 100 };
var gui = new dat.GUI();
gui.add(threshold, 'r').min(0).max(255);

var warp = { tilt: 0, scaleX: 1, scaleY: 1 }
gui.add(warp, 'tilt').min(0).max(30);
gui.add(warp, 'scaleX').min(0.5).max(2);
gui.add(warp, 'scaleY').min(0.5).max(2);

function filterRed()
{
    compatibility.requestAnimationFrame(filterRed);

    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    stageContext.drawImage(video, 0, 0);

    var imageData = stageContext.getImageData(0, 0, video.width, video.height);

    //jsfeat.imgproc.grayscale(imageData.data, img_u8.data);
    jsfeat.imgproc.filterRGB(imageData.data, img_u8.data, threshold);

    // render result back to canvas
    var data_u32 = new Uint32Array(imageData.data.buffer);
    var alpha = (0xff << 24);
    var i = img_u8.cols * img_u8.rows, pix = 0;
    while (--i >= 0)
    {
        pix = img_u8.data[i];
        data_u32[i] = alpha | (0 << 16) | (0 << 8) | pix;
    }

    stageContext.putImageData(imageData, 0, 0);
}

// draw UI to screen
// get webcam image of screen
// filter webcam image to contain only laser light
// warp webcam image to fit to screen image (tilt, scale)
// count pixels in webimage in target areas
// update UI