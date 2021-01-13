const socket=io();
const canvas=document.getElementById('image');
const ctx=canvas.getContext('2d');
const img=new Image();
img.src='images/mytest.png';
const int=setInterval(drawing,50);
function drawing(){
    ctx.drawImage(img,0,0);
}
setTimeout(()=>{
    clearInterval(int);
    socket.emit('parseStart',[canvas.toDataURL(),img.width,img.height]);
},50);
socket.on('parseEnd',data=>{
    img.src=data;
    ctx.clearRect(0,0,400,400);
    setInterval(()=>ctx.drawImage(img,0,0),50);
});