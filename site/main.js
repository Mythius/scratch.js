async function RUN(code,done){
	SPRITES = [];
	let sprites = document.querySelectorAll('.sprite');
	let text = document.querySelectorAll('.textbox');
	for(let s of sprites) s.remove();
	for(let t of text) t.remove();
	try{
		eval(code);
		flag();
	} catch(e){
		alert(e);
	}
}
