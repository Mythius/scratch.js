function Sprite(data){

	var element,textbox;
	var center = {x:0,y:0};
	var width,height;
	var costumes = [];

	setup();

	let THIS = this;

	function setup(){
		textbox = create('div');
		element = create('img');
		textbox.classList.add('textbox');
		element.classList.add('sprite');
		textbox.draggable = false;
		element.draggable = false;
		element.src = 'default.png';
		obj('.stage').appendChild(textbox);
		obj('.stage').appendChild(element);
		setCenter();
	}

	function setCenter(){
		let rect = element.getBoundingClientRect();
		center.x = rect.width/2;
		center.y = rect.height/2;
		width = rect.width;
		height = rect.height;
		element.style.transformOrigin = `50% 50%`;
	}



	//this.touching = function(sprite){
	//	let d1 = getDims();
	//	let d2 = sprite.getDimensions();
	//	let ox = Math.abs(d1.x - d2.x) < (d1.x < d2.x ? d2.width : d1.width);
	//	let oy = Math.abs(d1.y - d2.y) < (d1.y < d2.y ? d2.height : d1.height);
	//	return ox && oy;
	//}


	// TODO -- DONE -- STARTED ------
	// MOTION 	[x]		y
	// LOOKS  	[ ]		y
	// SOUNDS 	[ ]		y
	// PEN 		[ ]		n
	// SENSING 	[ ]		n
	// EVENTS	[ ]		y
	// CONTROL  [ ]		y
	// DATA     [ ]		y
	// CUSTOM 	[ ]		n


	this.motion = new Motion();
	this.looks = new Looks();
	this.sound = new Sounds();
	this.data = new Data();
	this.control = new Control();

	this.setup = function(){
		setCenter();
		this.motion.move(0);
	}

	this.addCostumes = function(...srcs){
		costumes = srcs;
		xml(PATH + 'assets.txt',text=>{
			let list = text.split('\n');
			let done = true;
			let missing = [];
			for(let s of srcs){
				let i = list.includes(s);
				done &= i;
				if(i) missing.push(s);
			}
			if(!done){
				alert('Missing Assets: '+missing.join(' , '));
			}
		});
	}

	function moveImage(){

		if(!THIS.motion || !THIS.looks) return;

		let m = THIS.motion.where();
		let l = THIS.looks.getData();


		element.src = PATH + costumes[l.costume];

		element.style.left = m.x + WIDTH/2 - m.center.x + 'px';
		element.style.top = m.y*-1 + HEIGHT/2 - m.center.y + 'px';


		// APPLY TRANSOFRMATIONS ON SIZE / ROTATION
		let dir = m.dir;
		let s = "";
		if(m.style == 'all around'){
			s += ` rotate(${dir}rad) `;
		} else if(m.style == 'left-right'){
			// Ensure angle is positive and within (0,2PI)
			dir = (dir + Math.PI*8) % (Math.PI*2);
			var left = dir > (Math.PI / 2) && dir < (Math.PI * 3/2);
			// 
			if(left) s += ` rotateY(180deg) `;
			else s+= 'rotateY(0deg)';
		} else {
			s+= 'rotateY(0deg)';
		}
		s += ` scale(${l.size/100}) `;


		let clrt = element.getBoundingClientRect();
		textbox.style.left = Math.max(clrt.x + clrt.width/2,0) + 'px';
		textbox.style.top = Math.max(clrt.y - clrt.height/2,0) + 'px';

		element.style.transform = s;
	}

	function where(){
		// Making Data Public for All Subclasses
		return this.motion.where();
	}


	function Motion(){
		var x = 0;
		var y = 0;
		var dir = 0;
		var rot_style = 'all around';

		var bounce = {top:false,left:false,right:false,bottom:false};

		function radians(deg){
			return deg*Math.PI/180;
		}

		this.where = function(){ return {x,y,dir,center,style:rot_style} }
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
					x = random(-WIDTH/2,WIDTH/2);
					y = random(-HEIGHT/2,HEIGHT/2);
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
				ty = w.y + w.center.y;
			}
			let mx = x + center.x;
			let my = y - center.y;
			if(ty >= my) dir = Math.atan((tx-mx)/(ty-my)) + Math.PI * 3/2;
			else dir = Math.atan((tx-mx)/(ty-my)) + Math.PI / 2;
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
			if(y - height < -HEIGHT/2 && !bounce.top){
				let temp = Math.PI / 2 - dir;
				dir = temp - Math.PI / 2;
				bounce.top = true;
			} else bounce.top = false;

			if(y > HEIGHT/2 && !bounce.bottom){
				let temp = Math.PI / 2 - dir;
				dir = temp - Math.PI / 2;
				bounce.bottom = true;
			} else bounce.bottom = false;

			if(x < -WIDTH/2 && !bounce.left){
				let temp = -dir;
				dir = temp + Math.PI;
				bounce.left = true;
			} else bounce.left = false;

			if(x + width > WIDTH/2 && !bounce.right){
				let temp = -dir;
				dir = temp + Math.PI;
				bounce.right = true;
			} else bounce.right = false;
		}
		this.setRotationStyle = function(s){
			// math calculated in moveImage
			rot_style = s;
		}
		this.xPosition = () => x;
		this.yPosition = () => y;
		this.direction = () => dir;
	}

	function Looks(){
		var size = 50;
		var costume = 0;

		this.getData = function(){
			// This may continue to grow
			return {size,costume};
		}
		this.changeSizeBy = function(s){
			size += s;
			setCenter();
			moveImage();
		}
		this.setSizeTo = function(s){
			size = s;
			setCenter();
			moveImage();
		}
		this.say = function(t){
			if(t == ''){
				hide(textbox);
			} else {
				textbox.innerHTML = t;
				show(textbox);
				moveImage();
			}
		}
		this.sayFor = function(t,secs){
			return new Promise(resolve=>{
				if(t == ''){
					hide(textbox);
					resolve();
				} else {
					textbox.innerHTML = t;
					show(textbox);
					moveImage();
					setTimeout(()=>{
						hide(textbox);
						resolve();
					},1000*secs);
				}
			});
		}
		this.think = this.say;
		this.thinkFor = this.sayFor;
		this.switchCostumeTo = function(c){
			let names = costumes.map(e=>e.split('.')[0]);
			if(names.includes(c)){
				costume = names.indexOf(c);
				moveImage();
			} else {
				alert(c + ' not found');
			}
		}
		this.nextCostume = function(){
			costume = (costume + 1) % costumes.length;
			moveImage();
		}
		this.previousCostume = function(){
			costume = (costume - 1 + costumes.length) % costumes.length;
			moveImage();
		}
		this.show = function(){
			show(element);
		}
		this.hide = function(){
			hide(element);
		}
	}

	function Sounds(){
	}

	function Data(){
	}

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
				clearInterval(interval);
				Loops.splice(Loops.indexOf(this),1);
			}
			this.stop = stop;
			Loops.push(this);
		}

		function waitLoop(fn,cb){
			var wait = 1000/fps;
			var contin = true;
			var iterations = 0;
			async function call(){
				iterations++;
				await fn(iterations);
				if (cb(iterations)) stop();
				if (contin) setTimeout(call,wait);
			}
			function stop(){
				contin = false;
			}
			this.stop = stop;
			Loops.push(this);
			call();
		}

		this.stopAllScripts = function(){
			for(let l of Loops) l.stop();
		}

		this.repeat = function(amount,script){
			return new Promise(resolve=>{
				new waitLoop(script,iter=>{
					let a = iter >= amount;
					if(a) resolve();
					return a;
				});
			});
		}

		this.forever = function(script){
			new waitLoop(script,iter=>{
				return false;
			});
		}

		this.repeatUntil = function(condition,script){
			return new Promise(resolve=>{
				new waitLoop(script,iter=>{
					let a = condition();
					if(a) resolve();
					return a;
				});
			});
		}
		this.wait = function(secs){
			return new Promise(resolve=>{
				setTimeout(()=>{
					resolve();
				},secs*1000);
			});
		}
	}

	moveImage();
	SPRITES.push(this);
}