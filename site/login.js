
hide(obj('explorer'));
var socket = io();
//hide(obj('login'));

var CONFIG;

document.on('keydown',e=>{
	if(e.keyCode == 13) login();
});

obj('button').on('click',login);

function login(){
	let u = obj('#u').value;
	let p = obj('#p').value;
	if(u && p) socket.emit('login',{u,p});
	else obj('p').innerHTML = 'Enter Information';
}

socket.on('invalid',()=>{
	obj('p').innerHTML = 'Password Incorrect';
});

socket.on('data',data=>{
	hide(obj('login'));
	show(obj('explorer'));
	initUI(data);
});

socket.on('project',config=>{
	obj('#proj').style.transform='rotateY(0deg)';
	obj('h3').innerHTML = config.name;
	CONFIG = config;
});


function initUI(data){
	obj('ul').innerHTML = '';
	for(let d of data){
		let l = create('li',d);
		obj('ul').appendChild(l);
		l.on('click',()=>{
			socket.emit('open',d);
		});
	}
	var l = create('li','New Project +');
	obj('ul').appendChild(l);
	l.on('click',function(){
		let name = prompt('Enter New Project Name');
		if(name) socket.emit('open',name);
	});
}

obj('#close').on('click',function(){
	obj('#proj').style.transform='rotateY(90deg)';
});

obj('#edit').on('click',function(){
	socket.emit('edit',CONFIG);
})

socket.on('go',id=>{
	location.href = location.href + 'editor.html?' + id;
})