var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');


var file = {
	save: function(name,text){
		fs.writeFile(name,text,e=>{
		console.log(e);
		})
	},
	read: function(name,callback){
	fs.readFile(name,(error,buffer)=>{
			if (error) console.log(error);
			else callback(buffer.toString());
		});
	}
}

function saveImage(buffer){
	var imageBuffer = request.file.buffer;
	var imageName = 'public/images/map.png';

	fs.createWriteStream(imageName).write(imageBuffer);
}


function cd(d,er){
	var dir = './projects/'+d;
	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	} else err('Exists');
}

function createProject(name,owner,err){
	file.read('save.json',json=>{
		let save = JSON.parse(json);
		let ok = true;
		for(let s of save){
			if(s.name == name) ok = false;
			break;
		}
		if(ok){
			save.push(new Project(name,owner));
			file.save('save.json',JSON.stringify(save));
		} else {
			err('Name Taken');
		}
	});
}


class Project{
	constructor(n,o){
		this.name = n;
		this.owner = o;
	}
}

createProject('proj2','Matthias',e=>{
	if(e) console.log(e);
});



const port = 80;
const path = __dirname+'/';

app.use(express.static(path+'site/'));
app.get(/.*/,function(request,response){
	response.sendFile(path+'site/');
});

http.listen(port,()=>{console.log('Serving Port: '+port)});

io.on('connection',function(socket){
	var id;
	socket.on('')
	socket.on('new',config=>{

	});
});