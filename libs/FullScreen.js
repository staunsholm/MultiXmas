function toggleFullScreen(element)
{
    if (!document.mozFullScreen && !document.webkitFullScreen)
    {
        if (element.mozRequestFullScreen)
        {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullScreen)
        {
            element.webkitRequestFullScreen();
        }
    }
    else
    {
        if (document.mozCancelFullScreen)
        {
            document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen)
        {
            document.webkitCancelFullScreen();
        }
    }

    lockScreenOrientation();
}

function lockScreenOrientation()
{
    var result = false;

    if (window.screen && window.screen.lockOrientation)
    {
        result = window.screen.lockOrientation("landscape");
    }
    else if (window.screen && window.screen.mozLockOrientation)
    {
        result = window.screen.mozLockOrientation("landscape");
    }

    if (!result)
    {
        setTimeout(lockScreenOrientation, 100);
    }
}

