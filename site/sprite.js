

function Sprite(){

	var element;
	var center = {x:0,y:0};
	var width,height;

	setup();

	function setup(){
		element = create('img');
		element.classList.add('sprite');
		element.draggable = false;
		element.src = 'default.svg';
		obj('.stage').appendChild(element);
		setCenter();
	}

	function setCenter(){
		let rect = element.getBoundingClientRect();
		center.x = rect.width/2;
		center.y = rect.height/2;
		element.style.transformOrigin = `${center.x}px ${center.y}px`;
	}



	//this.touching = function(sprite){
	//	let d1 = getDims();
	//	let d2 = sprite.getDimensions();
	//	let ox = Math.abs(d1.x - d2.x) < (d1.x < d2.x ? d2.width : d1.width);
	//	let oy = Math.abs(d1.y - d2.y) < (d1.y < d2.y ? d2.height : d1.height);
	//	return ox && oy;
	//}
	//this.moveTo = moveTo;

	this.motion = new Motion();
	this.looks = new Looks();
	this.sound = new Sounds();
	this.variables = new Variables();
	this.control = new Control();

	this.setup = function(){
		setCenter();
		this.motion.move(0);
	}


	function Motion(){
		var x = 0;
		var y = 0;
		var dir = 0;
		var rot_style = 'all around';

		moveImage(0,0);

		function radians(deg){
			return deg*Math.PI/180;
		}

		function moveImage(){
			setCenter();
			element.style.left = x + 240 - center.x + 'px';
			element.style.top = y*-1 +180 - center.y + 'px';
			element.style.transform = `rotate(${dir}rad)`;
		}

		this.where = function(){ return {x,y,dir,center} }
		this.move = function(step){
			x += step * Math.cos(-dir);
			y += step * Math.sin(-dir);
			moveImage();
		}
		this.turn = function(deg){
			dir += radians(deg);
			moveImage();
		}
		this.goTo = function(thing){
			if(typeof thing == 'string'){
				if(thing == 'random position'){
					x = random(-240,240);
					y = random(-180,180);
					moveImage();
				} else if(thing == 'mouse-pointer'){
					x = mouseX;
					y = mosueY;
					moveImage();
				} else {
					console.error(thing + ' is not a valid option');
				}
			} else {
				try{
					let data = thing.motion.where();
					x = data.x - data.center.x;
					y = data.y - data.cneter.y;
					moveImage();
				} catch(e){
					console.error('You cannot goTo '+thing);
				}
			}
		}
		this.goToXY = function(tx,ty){
			x = tx;
			y = ty;
			moveImage();
		}
		this.glideTo = function(secs,thing){
			element.style.transition = `left ${secs}s , top ${secs}s`;
			this.goTo(thing);
			return new Promise(function(resolve){
				setTimeout(function(){
					element.style.transition = '';
					resolve();
				},secs*1000);
			});
		}
		this.glideToXY = function(secs,x,y){
			element.style.transition = `left ${secs}s , top ${secs}s`;
			this.goToXY(x,y);
			return new Promise(function(resolve){
				setTimeout(function(){
					element.style.transition = '';
					resolve();
				},secs*1000);
			})
		}
		this.pointInDirection = function(d){
			dir = radians(d);
			moveImage();
		}
		this.pointTowards = function(thing){
			let tx=0,ty=0;
			if(typeof thing == 'string'){
				if(thing != 'mouse-pointer'){
					console.error(thing + ' is not something you can point to');
					return;
				}
				tx = mouseX;
				ty = mouseY;
			} else {
				let w = thing.motion.where();
				tx = w.x - w.center.x;
				ty = w.y - w.center.y;
			}
			if(ty >= y) dir = Math.atan(tx-x/ty-y);
			else dir = Math.atan(tx-x/ty-y) + Math.PI;
			moveImage();
		}
		this.changeXby = function(tx){
			x+=tx;
			moveImage();
		}
		this.changeYby = function(ty){
			y+=ty;
			moveImage();
		}
		this.setXto = function(tx){
			x = tx;
			moveImage();
			x = tx;
			moveImage();
		}
		this.setYto = function(ty){
			y = ty;
			moveImage();
		}
		this.ifOnEdgeBounce = function(){

		}
	}

	function Looks(){}
	function Sounds(){}
	function Variables(){}
	function Control(){
		var Loops = [];

		function Loop(fn,cb){
			var interval = setInterval(call,1000/fps);
			var iterations = 0;
			function call(){
				iterations++;
				fn(iterations);
				if (cb(iterations)) stop();
			}
			function stop(){
				clearInterval(this.interval);
				Loops.splice(Loops.indexOf(this),1);
			}
			this.stop = stop;
			Loops.push(this);
		}

		this.repeat = function(amount,callback){
			return new Promise(resolve=>{
				let loop = new Loop(callback,iter=>{
					let a = iter > amount;
					console.log(iter);
					if(a){
						resolve();
						loop.stop();
					} 
					return a;
				})
			});
		}
	}

	SPRITES.push(this);
}