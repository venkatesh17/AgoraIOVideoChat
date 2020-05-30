let handleFail = function(err){
    console.log('====================================');
    console.log("Error :", err);
    console.log('====================================');
}

let remoteContainer = document.getElementById('remote-container')
let canvasContainer = document.getElementById('canvas-container')

function addVideoStream(streamId) {
    let streamDiv = document.createElement("div")
    streamDiv.id = streamId;
    streamDiv.style.transform = "rotateY(180deg)"
    remoteContainer.appendChild(streamDiv)
}

function removeVideoStream(params) {
    let stream = evt.stream;
    stream.stop();
    let remDiv = document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);
    console.log('====================================');
    console.log("Remote stream is removed", stream.getId());
    console.log('====================================');
}

function addCanvas(streamId){
    let video = document.getElementById(`video${streamId}`);
    let canvas = document.createElement('canvas');
    canvasContainer.appendChild(canvas);
    let ctx = canvas.getContext('2d');

    video.addEventListener('loadedmetadata', function(){
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    })

    video.addEventListener('play', function(){
        var $this = this;
        (function loop(){
            if($this.paused && $this.ended){
                if($this.width!==canvas.width){
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }
                ctx.drawImage($this, 0,0);
                setTimeout(loop, 1000/30)
            }
        })()
    },0)
}


let client = AgoraRTC.createClient({
    mode:'live',
    codec: 'h264'
});

client.init("186b693c3339401ab43903ca85e736f5",
    ()=>console.log('Client Initialized'));

client.join(null, 'agora-demo', null,(uid)=>{
    let localStream = AgoraRTC.createStream({
        streamId: uid,
        audio: false,
        video: true,
        screen: false
    })

    localStream.init(function (){
        localStream.play('me');
        client.publish(localStream, handleFail())

        client.on('stream-added', function (evt){
            client.subscribe(evt.stream.handleFail())

        })

        client.on('stream-subscribed', function (evt){
            let stream = evt.stream;
            addVideoStream(stream.getId())
            stream.play(stream.getId());
            addCanvas(stream.getId())
        })

        client.on('stream-removed', removeVideoStream)
    }, handleFail())
}, handleFail())





