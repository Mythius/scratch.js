var mouseDown = false,mouseX = 1,mouseY = 1;
var SPRITES = [];
const WIDTH = 480, HEIGHT = 360;
const fps = 10;

var key = {q:false,w:false,e:false,r:false,t:false,y:false,u:false,i:false,o:false,p:false,a:false,s:false,d:false,f:false,g:false,h:false,j:false,k:false,l:false,z:false,x:false,c:false,v:false,b:false,n:false,m:false,ArrowUp:false,ArrowDown:false,ArrowLeft:false,ArrowRight:false};

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
	if(e.key in key) key[e.key] = true;
});

document.on('keyup',function(e){
	if(e.key in key) key[e.key] = false;
});