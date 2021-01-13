// Ip='192.168.0.45';
'use strict';
const express=require('express');
const app=express();
const path=require('path');
const server=require('http').createServer(app);
const Io=require('socket.io')(server);
const Canvas=require('canvas');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('parsing'));
app.get('/',async(req,res)=>{
    res.sendFile(path.join(__dirname,'parsing','test.html'));
});
server.listen(80,()=>console.log('run!'));

// 0 - черный цвет
// 1 - белый цвет
const numbers=[
    '000000000000001110000011000110001100011000100000100010000010001000001001100000100110000010001000001000100000100011000110001100011000001110000000000000',
    '000000000000000000000000111000000111100000111110000110011000000001100000000110000000011000000001100000000110000000011000000111110000000000000000000000',
    '000000000000000000000000000000000111000000111111000110011100011100110000000001100000000110000000110000001100000011000000001111110000111111000000000000',
    '000000000000000000000111100000000011100000000111000000001110000000111000001111100111110000000011111000000011100000001110000001110001111100000000000000',
    '000000000000000000000000000000011100011000110001100011000110001100111001100001100011000110111111111100000011100000011100000000110000000011100000011000',
    '000000000000000000000000111000011111111001110000110111000000011100000001110011000111111110000000111000000001100110000010011110011000011111100000000000',

];
Io.on('connection',socket=>{
    socket.on('parseStart',async data=>{
        console.time('parsing');
        const bitmap=[[0]];
        const pixel=Canvas.createCanvas(1,1);
        const pix=pixel.getContext('2d');
        const image=Canvas.createCanvas(75,15);
        const ctx=image.getContext('2d');
        const img=await Canvas.loadImage(data[0]);
        ctx.drawImage(img,0,0,data[1],data[2],0,0,75,15);
        img.src=image.toDataURL();
        const pixels=[{x:0,y:0}];
        drawing(0,0,img,pix);
        const pixelURL=pixel.toDataURL().split(',')[1];
        for(let y=0;y<15;y++){
            for(let x=0;x<75;x++){
                drawing(x,y,img,pix);
                if(urlEqual(pixel.toDataURL().split(',')[1],pixelURL,0.87)){
                    pixels.push({x,y});
                }
                else pixels.push('');
            }
        }
        ctx.fillStyle='#ffffff';
        ctx.fillRect(0,0,75,15);
        ctx.fillStyle='#000000';
        for(let i=1;i<pixels.length;i++)drawing(pixels[i].x,pixels[i].y,{},ctx,true);
        const text=[];
        let l=0;
        img.src=image.toDataURL();
        for(let i=1;i<pixels.length;i++){
            if(!pixels[i]){
                if(pixels[i-1].x<75){
                    pixels[i]={x:pixels[i-1].x+1,y:pixels[i-1].y};
                    bitmap[l].push(1);
                }
                else{
                    l++;
                    bitmap.push([]);
                    pixels[i]={x:0,y:pixels[i-1].y+1};
                    bitmap[l].push(1);
                }
            }
            else{
                if(pixels[i-1].x<75-1)bitmap[l].push(0);
                else{
                    l++;
                    bitmap.push([]);
                    bitmap[l].push(0);
                }
            }
        }
        console.log(bitmap);
        let nummap='';
        for(let i=0;i<75-15/1.5+1;i++){
            for(let y=0;y<15;y++){
                for(let x=0;x<15/1.5;x++){
                    nummap+=bitmap[y][x+i];
                }
            }
            for(let n=0;n<5;n++){
                if(urlEqual(numbers[n],nummap,0.8)){
                    text.push(n);
                }
            }
            nummap='';
        }
        console.log(text.join(''));
        Io.emit('parseEnd',image.toDataURL());
        console.timeEnd('parsing');
    });
});
function urlEqual(url1,url2,k){
    const arr1=url1.split('');
    const arr2=url2.split('');
    let n=0;
    for(let i=0;i<arr1.length;i++){
        if(arr1[i]===arr2[i])n++;
    }
    if(n>arr1.length*k)return true;
    else return false;
}
function drawing(x,y,img,ctx,ok,check,w,h){
    if(check){
        if(ok)ctx.drawImage(img,x,y,w,h,0,0,w,h);
        else ctx.drawImage(img,0,0);
        return;
    }
    if(!ok)ctx.drawImage(img,x,y,1,1,0,0,1,1);
    else ctx.fillRect(x,y,1,1);
}