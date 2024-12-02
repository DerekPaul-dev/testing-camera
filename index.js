let cameraDevices = [];
let localStream = false;
const video = document.getElementById("video")

window.onload = async function() {
  await requestCameraPermission();
}

async function requestCameraPermission() {
  const constraints = {video: true, audio: false};
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const tracks = stream.getTracks();

  for (let i=0; i<tracks.length; i++) {
    const track = tracks[i];
    track.stop();  // stop the opened camera
  }
}

// camera resolution higher
const cameraSelect = document.getElementById("cameraSelect");
const $containerCamera = document.getElementById("container-camera")

window.onload = async function() {
  await loadCameraDevices();
  loadCameraDevicesToSelect();
}

async function loadCameraDevices(){
  console.log(121212)
  const constraints = {video: true, audio: false};
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const devices = await navigator.mediaDevices.enumerateDevices();


  for (let i=0; i<devices. length;i++) {
    let device = devices[i];
    if (device.kind == 'videoinput'){ // filter out audio devices
      cameraDevices.push(device);
    }
  }

  console.log(cameraDevices, "cameraDevices");

  const tracks = stream.getTracks(); // stop the camera to avoid the NotReadableError

  for (let i=0;i<tracks.length;i++) {
    const track = tracks[i];
    track.stop();
  }
}

function loadCameraDevicesToSelect(){
  console.log(cameraDevices, "camera devices")
  for (let i=0; i<cameraDevices.length; i++) {
    let device = cameraDevices[i];
    const $item = document.createElement('li');
    $item.innerHTML = `
      <p>DeviceId: ${device.deviceId}</p>
      <p>GroupId: ${device.groupId}</p>
      <p>Label: ${device.label}</p>
      <p>Kind: ${device.kind}</p>
    `
    $containerCamera.appendChild($item)
    cameraSelect.appendChild(new Option(device.label,device.deviceId))
  }
}

document.getElementById("startCameraBtn").addEventListener('click', (event) => {
  console.log("start camera");
  let options = {};
  if (cameraSelect.selectedIndex != -1) {
    options.deviceId = cameraSelect.selectedOptions[0].value;
  }
  play(options);
});


function play(options) {
  let constraints = {};
  if (options.deviceId){
    constraints = {
      video: {deviceId: options.deviceId},
      audio: false
    }
  }else{
    constraints = {
      video: {width:1280, height:720,facingMode: { exact: "environment" }},
      audio: false
    }
  }
  if (resolutionSelect.selectedIndex != -1) {
    let width = parseInt(resolutionSelect.selectedOptions[0].value.split("x")[0]);
    let height = parseInt(resolutionSelect.selectedOptions[0].value.split("x")[1]);
    constraints["video"]["width"] = width;
    constraints["video"]["height"] = height;
  }

  stop(); // close before play
  video.style.display = "block";
  if (options.deviceId){
    constraints = {
      video: {deviceId: options.deviceId},
      audio: false
    }
  }else{
    constraints = {
      video: {width:1280, height:720,facingMode: { exact: "environment" }},
      audio: false
    }
  }
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    localStream = stream;
    // Attach local stream to video element      
    video.srcObject = stream;
  }).catch(function(err) {
    console.error('getUserMediaError', err, err.stack);
  });
}

function stop() {
  try{
    if (localStream){
      const tracks = localStream.getTracks();
      for (let i=0;i<tracks.length;i++) {
        const track = tracks[i];
        track.stop();
      }
    }
  } catch (e){
    alert(e.message);
  }
};

document.getElementById("takePhotoBtn").addEventListener('click', async (event) => {
  let src;
  if ("ImageCapture" in window) {
    try {
      const track = localStream.getVideoTracks()[0];
      let imageCapture = new ImageCapture(track);
      let blob = await imageCapture.takePhoto();
      src = URL.createObjectURL(blob);
    }catch(e) {
      src = captureFrame();
    }
  }else{
    src = captureFrame();
  }
  document.getElementById("photoTaken").src = src;
});

document.getElementById("photoTaken").onload = function(){
  let img = document.getElementById("photoTaken");
  document.getElementById("info").innerText = "Image Width: " + img.naturalWidth +"\nImage Height: " + img.naturalHeight;
}
   
function captureFrame(){
  let w = video.videoWidth;
  let h = video.videoHeight;
  canvas.width  = w;
  canvas.height = h;
  let ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg")
}
