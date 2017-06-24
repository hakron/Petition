var hasSigned;
var canvas = document.getElementById('signature');
var btn = document.getElementById('btn');
var save = document.getElementById('submit');
var signatureValue = document.getElementById("saveSignature");
var context = canvas.getContext('2d');
var mouseX, mouseY;

canvas.addEventListener("mousedown", mouseDown, false);
document.addEventListener("mouseup", mouseUp);
document.addEventListener("mouseup", signatureSave);
btn.addEventListener("click", function(){
  signatureValue.value = "";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.closePath();
  context.beginPath();
});

function mouseDown(e) {
  mouseX = e.offsetX;
  mouseY = e.offsetY;
  canvas.addEventListener("mousemove", mousemove);

}
function mouseUp(e) {
  e.stopPropagation();
  canvas.removeEventListener("mousemove", mousemove);

}
function mousemove(e){
  context.moveTo(mouseX, mouseY);
  context.lineTo(e.offsetX, e.offsetY);
  context.stroke();
  mouseX = e.offsetX;
  mouseY= e.offsetY;
  hasSigned=true;
}
function signatureSave() {
  var dataURL = canvas.toDataURL();
  if(hasSigned){
    signatureValue.value = dataURL;
  }
};
