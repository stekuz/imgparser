const canvas=document.getElementById('image');
const ctx=canvas.getContext('2d');
const img=new Image();
img.src='copy.png';
img.crossorigin='anonymous';
const int=setInterval(()=>ctx.drawImage(img,0,0),50);
setTimeout(()=>{
    clearInterval(int);
    console.log(canvas.toDataURL());
},1000);