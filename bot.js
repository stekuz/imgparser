// 'use strict';
// const ViberBot=require('viber-bot').Bot;
// const BotEvents=require('viber-bot').Events;
// const bot = new ViberBot({
// 	authToken:'4cb87bee81a7df92-8e47ef75722e881e-12983f7f5433ae3c',
// 	name:'EchoBot',
// 	avatar:'boticon.png'
// });
// bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
// 	response.send(message);
// });
// const https = require('https');
// const port = process.env.PORT || 8080.
// const webhookUrl = process.env.WEBHOOK_URL;
// const httpsOptions = {
// 	key: 0,
// 	cert: 2,
// 	ca: 1
// };
// https.createServer(httpsOptions, bot.middleware()).listen(port, () => bot.setWebhook(webhookUrl));
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

Io.on('connection',socket=>{
    socket.on('parseStart',async data=>{
        console.time('parsing');
        const numbers=[];
        const pixel=Canvas.createCanvas(1,1);
        const pix=pixel.getContext('2d');
        const image=Canvas.createCanvas(data[1],data[2]);
        const ctx=image.getContext('2d');
        const nums=Canvas.createCanvas(data[2]/1.5,data[2]);
        const nctx=nums.getContext('2d');
        const img=await Canvas.loadImage(data[0]);
        const pixels=[{x:0,y:0}];
        drawing(0,0,img,pix);
        const pixelURL=pixel.toDataURL().split(',')[1];
        for(let n=0;n<10;n++){
            numbers.push([]);
            for(let j=0;j<4;j++){
                const img=await Canvas.loadImage(`parsing/images/${j}/${n}.png`);
                numbers[n].push(img);
            }
        }
        for(let y=0;y<data[2];y++){
            for(let x=0;x<data[1];x++){
                drawing(x,y,img,pix);
                if(urlEqual(pixel.toDataURL().split(',')[1],pixelURL,0.87)){
                    pixels.push({x,y});
                }
            }
        }
        ctx.fillStyle='#ffffff';
        ctx.fillRect(0,0,data[1],data[2]);
        ctx.fillStyle='#000000';
        for(let i=0;i<pixels.length;i++)drawing(pixels[i].x,pixels[i].y,{},ctx,true);
        const text=[];
        img.src=image.toDataURL();
        for(let x=0;x<image.width-image.height/1.5;x++){
            for(let n=0;n<10;n++){
                drawing(x,0,img,nctx,true,true,image.height/1.5,image.height);
                const url=nums.toDataURL().split(',')[1];
                let skip;
                for(let i=0;i<4;i++){
                    drawing(0,0,numbers[n][i],nctx,'',true,'','');
                    if(urlEqual(url,nums.toDataURL().split(',')[1],0.5)){
                        text.push(n);
                        skip=true;
                        x+=image.height/1.5-1;
                        break;
                    }
                }
                if(skip)break;
            }
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