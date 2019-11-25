try{
	var socket = io();
	socket.on('test',()=>{
		alert('Connected');
	});
} catch(e){}





var cat = new Sprite();




async function flag(){
	cat.motion.turn(0);
	await cat.motion.glideToXY(1,100,100);
	await cat.motion.glideToXY(1,-100,-100);
	cat.control.repeat(10,(i)=>{
		obj('p').innerHTML = i;
	})
}


document.on('keydown',e=>{
	if(e.key == " "){
		cat.motion.move(10);
	}
})
