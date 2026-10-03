import mongoose from 'mongoose';
import sharp from 'sharp';
import { storeFile } from './storage.js';
import { categories, checkConfig } from './config.js';
import { Image } from './models.js';
checkConfig();await mongoose.connect(process.env.MONGO_URI);
const palettes=[['#153d35','#b6dc9f'],['#09072f','#b678e4'],['#422066','#ff9966'],['#3d4929','#e8c699'],['#162d4a','#fb9775'],['#dad4c8','#394652'],['#151725','#34dabf'],['#4a121e','#ff664a']];
for(let i=0;i<categories.length;i++){
 const filename=`demo-${i}.webp`,thumbnail=`demo-${i}-thumb.webp`;
 if(await Image.exists({filename})) continue;
 const [a,b]=palettes[i],w=i%3===0?1200:1920,h=i%3===0?1920:1080;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${w*.72}" cy="${h*.35}" r="${w*.22}" fill="${b}" opacity=".5"/><path d="M0 ${h*.8} Q ${w*.3} ${h*.2} ${w} ${h*.9} V${h} H0Z" fill="${a}" opacity=".6"/></svg>`;
 const buffer=await sharp(Buffer.from(svg)).webp({quality:92}).toBuffer();await storeFile(filename,buffer);
 await storeFile(thumbnail,await sharp(buffer).resize({width:600,height:600,fit:'inside'}).webp().toBuffer());
 await Image.create({title:`${categories[i]} study`,category:categories[i],tags:['demo','gradient'],description:'Original abstract demo artwork. Replace with your own category images.',filename,thumbnail,width:w,height:h,bytes:buffer.length});
}
console.log('Demo wallpapers added (existing demos preserved).');await mongoose.disconnect();
