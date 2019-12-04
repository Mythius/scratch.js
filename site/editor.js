var socket = io();

var CONFIG,PATH = './';

socket.emit('lock', location.href.split('?')[1]);

socket.on('config', c => {
    CONFIG = c;
    PATH = `projects/${c.owner}/${c.name}/`;
    obj('code').innerHTML = c.script.replace(/\n/gi,'<br>');
});

setTimeout(function(){
	c.update();
},100)

var c = new code();
socket.on('kikout', () => {
    //location.href = '/';
    // Prevents People from Editing Without Logging In
});

show(obj('code'));
var tabs = document.querySelectorAll('.tab');
var switches = document.querySelectorAll('.switch');

for (let t of tabs) {
    t.on('click', function() {
        changeTab(t);
    });
}

obj('#upimg').on('change', function(e) {
    for (let f of e.target.files) {
        if (f) {
            var r = new FileReader();
            r.readAsDataURL(f);
            r.onload = function(e) {
            	var ext = f.type.split('/')[1];
             	imageHolder(e.target.result,ext);
            }
        }
    }
});

function imageHolder(src,ext){
	let i = create('img');
	i.src = src;
	var cont = create('imghold',i);
	var b1 = create('button','Save');
	var b2 = create('button','Remove');
	var name = create('input');
	name.placeholder='Enter Name';
	cont.appendChild(create('br'));
	cont.appendChild(name);
	cont.appendChild(create('br'));
	cont.appendChild(b1);
	cont.appendChild(b2);
	obj('images').appendChild(cont);

	b2.on('click',function(){
		cont.remove();
	});

	b1.on('click',function(){
		if(!name.value){
			alert('Add Name');
			name.focus();
			return;
		}
		saveImage(i,name.value+'.'+ext);
		cont.remove();
	})
}

function saveImage(image,name){
	var canvas = create('canvas');
	canvas.style.imageRendering='pixelated';
	canvas.width = image.width;
	canvas.height = image.height;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(image,0,0,canvas.width,canvas.height);
	canvas.toBlob(blob=>{
		socket.emit('save',{name,blob});
	});
}

function print(text){
	//
	obj('#notify').innerHTML = text;
}

function changeTab(t) {
    for (let ct of tabs) ct.classList.remove('selected');
    t.classList.add('selected');
    for (let s of switches) hide(s);
    let name = t.innerText;
    show(obj(name));
    if(name == 'Assets'){
    	getAssetData();
    }
}
// CODE EDITOR
function code() {
    this.update = update;
    var keywords = ['async', 'await', 'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'of', 'instanceof', 'new', 'return', 'switch', 'throw', 'try', 'typeof', 'var', 'let', 'while', 'const', 'with'];
    var other = ['Sprite','console', 'prototype', 'document', 'window', 'Object', 'Node', 'Array', 'RegExp'];
    var vars = [];

    function update(e) {
        var text = obj('code').innerText;
        var colors = 'g'.repeat(text.length).split('');
        match(/\(.+\)/gi, 'o');
        match(/((\(.+\))|\w+)=>/gi,'o');
        match(/(let|var|const)\s*(\w+\s*)+=/gi,'d');
        match(/function \w+\(/gi,'d');
        for (let k of keywords) match(new RegExp('\\b' + k + '\\b', 'g'), 'k');
        match(/\bthis\b/gi, 'o');
        match(/\.\w+/gi, 'c');
        for (let o of other) match(new RegExp('\\b' + o + '\\b', 'g'), 'b');
        match(/(0x)?\d/gi, 'p');
        match(/(true|false)/gi, 'p');
        match(/=\s*(\w|\([\w,\s]+\))\s*=>/gi, 'o');
        match(/\W/gi, 'w');
        match(/0x[0-9a-f]{2,6}/gi, 'p');
        match(/=>/gi, 'k');
        match(/\/\/.*/g, 'gr');
        match(/('|"|`)[^'\n]*('|"|`)/gi, 't');
        match(/\/\S+\//gi, 'y');
        obj('code').innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            if (text[i] == '\n') obj('code').appendChild(create('br'));
            else obj('code').appendChild(colorize(text[i], colors[i]))
        }

        function colorize(t, c) {
            let s = create('span', t);
            s.classList.add(c || 'gr');
            return s;
        }

        function match(regex, clas) {
            var regi = text.matchAll(regex);
            var done = false;
            while (!done) {
                var b = regi.next();
                if (b.value && b.value[0]) fto(b.value.index, b.value[0].length, clas);
                done = b.done;
            }
        }

        function fto(s, l, c) {
            for (let i = s; i < s + l; i++) {
                colors[i] = c;
            }
        }
    }
}

obj('#imbut').on('click',function(){
	// Trigger The input:file
	this.querySelector('input').click();
});

function getAssetData(){
	if(!PATH) return;
	xml(PATH+'assets.txt',text=>{
		obj('#assetlist').innerHTML = 'Assets';
		obj('#spritelist').innerHTML = 'Sprites<br>';
		if(!text) return;
		let lines = text.split('\n');
		console.log(lines);
		for(let l of lines){
			if(!l) continue;
			let im = create('img');
			im.src = PATH + l;
			im.width=32;
			let ol = create('ol',im);
			ol.appendChild(create('p',l));
			obj('#assetlist').appendChild(ol);
		}
	});
}

obj('#start').on('click',async function(){
	print('Running');
	debugger;
	RUN(obj('code').innerText,done=>{
		print('Stopped');
	});

});
obj('#stop').on('click',function(){
	stop();
	print('Stopped');
});
obj('#save').on('click',function(){
	print('Saving...');
	if(!CONFIG){
		print('Cannot Save, Not Logged In');
		return;
	}
	let text = obj('code').innerText;
	socket.emit('code',text);
});

socket.on('saved',function(){
	print('Saved');
});