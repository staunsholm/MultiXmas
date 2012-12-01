var img_u8 = new jsfeat.matrix_t(640, 480, jsfeat.U8_t | jsfeat.C1_t);

var video = document.getElementById('webcam');

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
            //            demo_app();

            compatibility.requestAnimationFrame(filterRed);
        }, 500);
    }, true);
}, function (error)
{
    alert('WebRTC not available.');
});

var threshold = { r: 200, g: 100, b: 100 };
var gui = new dat.GUI();
gui.add(threshold, 'r').min(0).max(255);
gui.add(threshold, 'g').min(0).max(255);
gui.add(threshold, 'b').min(0).max(255);

function filterRed()
{
    compatibility.requestAnimationFrame(filterRed);

    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    stageContext.drawImage(video, 0, 0, 640, 480);

    var imageData = stageContext.getImageData(0, 0, 640, 480);

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