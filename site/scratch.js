var mouseDown = false,mouseX = 1,mouseY = 1;
var SPRITES = [];
const WIDTH = 480, HEIGHT = 360;
const fps = 10;


document.on('mouseup',function(){
	mouseDown = false;
});

document.on('mousedown',function(){
	mouseDown = true;
});

document.on('mousemove',e=>{
	let cr = obj('.stage').getBoundingClientRect();
	mouseX = e.clientX - 240 - cr.x;
	mouseY = e.clientY * -1 + 180 + cr.y;
});

function stop(){
	for(let s of SPRITES) s.control.stopAllScripts();
}

document.on('keydown',function(e){
	if(e.key == 'Escape') stop();
});


