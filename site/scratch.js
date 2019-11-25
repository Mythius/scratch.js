var mouseDown = false,mouseX = 0,mouseY = 0;
var SPRITES = [];
const fps = 30;

function setup(){
	for(let s of SPRITES) s.setup();
	setTimeout(flag,1000);
}

document.on('mouseup',function(){
	mouseDown = false;
});

document.on('mousedown',function(){
	mouseDown = true;
});

document.on('mousemove',e=>{
	mouseX = e.clientX + 240;
	mouseY = e.clientY * -1 + 180;
});





setTimeout(setup,10);