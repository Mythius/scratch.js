var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

var file = {
	save: function(name,text,error){
		fs.writeFile(name,text,e=>{
			if(!e) return;
			if(error) error(e);
			else console.log(e);
		})
	},
	read: function(name,callback,error){
	fs.readFile(name,(e,buffer)=>{
			if (e){
				if(error) error(e);
				else console.log(e);
			} else callback(buffer.toString());
		});
	}
}

function saveImage(filename,buffer){
	var imageBuffer = buffer;
	var imageName = filename;

	fs.createWriteStream(imageName).write(imageBuffer);
}


function md(d,err){
	var dir = './'+d;
	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	} else {
		if(err) err('Exists');
	}
}

function getProject(name,owner,cb){
	var path = `site/projects/${owner}/${name}/`;
	let d = file.read('users.json',j=>{
		let data = JSON.parse(j);
		let my = data.filter(e=>e.u == owner)[0];
		if(my.projects.includes(name)){
			file.read(path+'config.json',text=>{
				cb(JSON.parse(text));
			})
		} else {
			data[data.indexOf(my)].projects.push(name);
			file.save('users.json',JSON.stringify(data));
			md(path);
			file.read('xconfig.json',d=>{
				let config = JSON.parse(d);
				config.name = name;
				config.owner = owner;
				file.save(path+'config.json',JSON.stringify(config));
				file.save(path+'assets.txt','');
				cb(config);
			});
		}
	});
}

var errors = ['Success','Name Taken'];

class Project{
	constructor(n,o){
		this.name = n;
		this.owner = o;
	}
}




const port = 80;
const path = __dirname+'/';




// SERVE WEBSITE FILES
app.use(express.static(path+'site/'));
app.get(/.*/,function(request,response){
	response.sendFile(path+'site/');
});

var opening = [];

var uniq=0;

md('site/projects');


http.listen(port,()=>{console.log('Serving Port: '+port)});

io.on('connection',function(socket){
	var owner,project;
	socket.on('open',name=>{
		getProject(name,owner,proj=>{
			socket.emit('project',proj);
			file.read('users.json',text=>{
				let users = JSON.parse(text);
				let me = users.filter(u=>u.u==owner)[0];
				socket.emit('data',me.projects);
			});
		});
	});
	socket.on('login',cred=>{
		file.read('users.json',text=>{
			let users = JSON.parse(text);
			let me = users.filter(u => u.u==cred.u);
			if(me.length){
				me = me[0];
				if(me.p != cred.p){
					socket.emit('invalid');
				} else {
					owner = me.u;
					socket.emit('data',me.projects);
				}
			} else {
				cred.projects = [];
				users.push(cred);
				file.save('users.json',JSON.stringify(users));
				
				owner = cred.u;
				md(`site/projects/${cred.u}/`);

				socket.emit('data',[]);
			}
		});
	});
	socket.on('edit',config=>{
		let id = uniq++;
		opening.push({id,config});
		socket.emit('go',id);
	});
	socket.on('lock',id=>{
		let op = opening.filter(e=>e.id==id);
		if(!op.length) {
			socket.emit('kikout');
			return;
		}
		op = op[0].config;
		owner = op.owner;
		project = op.name;
		opening.splice(opening.indexOf(op),1);
		socket.emit('config',op);
	});
	socket.on('save',data=>{
		if(!owner) return;
		var path = `site/projects/${owner}/${project}/`;
		saveImage(path+data.name,data.blob);
		file.read(path+'assets.txt',text=>{
			file.save(path+'assets.txt',text+'\n'+data.name);
		},error=>{
			file.save(path+'assets.txt',data.name);
		});
	});
	socket.on('code',code=>{
		var path = `site/projects/${owner}/${project}/`;
		file.read(path+'config.json',text=>{
			let j = JSON.parse(text);
			j.script = code;
			let n = JSON.stringify(j);
			file.save(path+'config.json',n);
			socket.emit('saved');
		})
	})
});