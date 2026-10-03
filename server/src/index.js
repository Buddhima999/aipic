import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { storeFile, readFile, deleteFile, connect } from './storage.js';
import path from 'node:path';
import { base, categories, checkConfig } from './config.js';
import { Image, Admin } from './models.js';
const app=express();
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:false,crossOriginResourcePolicy:{policy:'same-origin'}}));
app.use(cors({origin:process.env.CLIENT_ORIGIN || 'http://localhost:5173'}));
app.use(express.json({limit:'16kb'}));
app.use('/api',rateLimit({windowMs:60000,limit:120,standardHeaders:'draft-8',legacyHeaders:false}));
app.use('/api',async(req,res,next)=>{try{checkConfig();await connect();next();}catch(e){next(e);}});
app.get('/uploads/:name',async(req,res,next)=>{try{await connect();const file=await readFile(req.params.name);if(!file)return res.status(404).end();res.set({'Content-Type':'image/webp','Cache-Control':'public, max-age=86400'}).send(file);}catch(e){next(e);}});
const loginLimit=rateLimit({windowMs:15*60000,limit:10});
function auth(req,res,next){try{const token=req.headers.authorization?.split(' ');if(token?.[0]!=='Bearer') throw Error();const data=jwt.verify(token[1],process.env.JWT_SECRET,{algorithms:['HS256']});if(data.role!=='admin') throw Error();req.admin=data;next();}catch{res.status(401).json({message:'Please sign in as admin.'});}}
function validId(req,res,next){if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:'Invalid image ID'});next();}
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:4*1024*1024,files:1,fields:5},fileFilter(req,file,cb){cb(null,['image/jpeg','image/png','image/webp'].includes(file.mimetype));}});
app.get('/api/health',(req,res)=>res.json({status:'ok'}));
app.get('/api/categories',(req,res)=>res.json(categories));
app.post('/api/auth/login',loginLimit,async(req,res)=>{
 const {email,password}=req.body;
 if(typeof email!=='string'||typeof password!=='string'||password.length>200) return res.status(400).json({message:'Enter email and password'});
 const configuredEmail=process.env.ADMIN_EMAIL.toLowerCase();
 let admin=await Admin.findOne({email:email.toLowerCase()});
 if(!admin&&email.toLowerCase()===configuredEmail&&password===process.env.ADMIN_PASSWORD){
 const hash=await bcrypt.hash(password,12);
 admin=await Admin.findOneAndUpdate({email:configuredEmail},{$setOnInsert:{email:configuredEmail,passwordHash:hash}},{upsert:true,new:true});
 }
 if(!admin||!await bcrypt.compare(password,admin.passwordHash)) return res.status(401).json({message:'Incorrect email or password'});
 res.json({token:jwt.sign({role:'admin'},process.env.JWT_SECRET,{subject:admin.id,expiresIn:'2h',algorithm:'HS256'})});
});
app.get('/api/images',async(req,res)=>{
 const page=Math.max(1,Math.min(10000,parseInt(req.query.page)||1)),limit=12;
 const filter={};
 if(req.query.category && categories.includes(req.query.category)) filter.category=req.query.category;
 const q=String(req.query.q||'').trim().slice(0,100);
 if(q){const safe=q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');filter.$or=[{title:{$regex:safe,$options:'i'}},{tags:{$regex:safe,$options:'i'}}];}
 if(req.query.orientation==='portrait') filter.$expr={$gt:['$height','$width']};
 if(req.query.orientation==='landscape') filter.$expr={$gte:['$width','$height']};
 const sort=req.query.sort==='popular'?{downloads:-1,_id:-1}:{createdAt:-1,_id:-1};
 const [items,total]=await Promise.all([Image.find(filter).sort(sort).skip((page-1)*limit).limit(limit).lean(),Image.countDocuments(filter)]);
 res.json({items,total,page,pages:Math.ceil(total/limit)});
});
app.get('/api/images/:id/download',validId,async(req,res,next)=>{
 const item=await Image.findById(req.params.id);if(!item) return res.status(404).json({message:'Image not found'});
 const file=await readFile(item.filename);if(!file) return res.status(404).json({message:'File unavailable'});
 await Image.updateOne({_id:item.id},{$inc:{downloads:1}});
 res.set({'Content-Type':'image/webp','Content-Disposition':`attachment; filename="${item.title.replace(/[^a-z0-9_-]/gi,'-')}.webp"`}).send(file);
});
app.post('/api/images',auth,upload.single('image'),async(req,res)=>{
 const title=String(req.body.title||'').trim(),category=req.body.category;
 if(!title||title.length>120||!categories.includes(category)||!req.file) return res.status(400).json({message:'Provide a title, category and JPG, PNG or WebP image (maximum 4 MB)'});
 const description=String(req.body.description||'').slice(0,1000),tags=[...new Set(String(req.body.tags||'').split(',').map(t=>t.trim().slice(0,40)).filter(Boolean))].slice(0,15);
 const id=randomUUID(),filename=`${id}.webp`,thumbnail=`${id}-thumb.webp`;
 try {
 const buffer=await sharp(req.file.buffer,{limitInputPixels:40000000}).rotate().webp({quality:92}).toBuffer();
 const meta=await sharp(buffer).metadata();
 if(buffer.length>4*1024*1024) return res.status(400).json({message:'Converted image exceeds 4 MB. Compress your image first.'});
 const thumb=await sharp(buffer).resize({width:600,height:600,fit:'inside',withoutEnlargement:true}).webp({quality:80}).toBuffer();
 await storeFile(filename,buffer);await storeFile(thumbnail,thumb);
 const item=await Image.create({title,category,description,tags,filename,thumbnail,width:meta.width,height:meta.height,bytes:buffer.length});
 res.status(201).json(item);
 } catch(error){await Promise.all([filename,thumbnail].map(f=>deleteFile(f).catch(()=>{})));if(error.name==='ValidationError') throw error;res.status(400).json({message:'Upload failed. Use a valid image under 40 megapixels; check server logs if this persists.'});console.error(error.message);}
});
app.delete('/api/images/:id',auth,validId,async(req,res)=>{
 const item=await Image.findById(req.params.id);if(!item) return res.status(404).json({message:'Image not found'});
 await Image.deleteOne({_id:item.id});
 await Promise.all([item.filename,item.thumbnail].map(f=>deleteFile(f).catch(e=>console.error(e.message))));
 res.json({message:'Image deleted'});
});
app.use('/api',(req,res)=>res.status(404).json({message:'API route not found'}));
if(process.env.NODE_ENV==='production'){
 app.use(express.static(path.join(base,'../client/dist')));
 app.get('/{*splat}',(req,res)=>res.sendFile(path.join(base,'../client/dist/index.html')));
}
app.use((err,req,res,next)=>{console.error(err.message);if(res.headersSent) return next(err);res.status(err instanceof multer.MulterError?400:500).json({message:err instanceof multer.MulterError?'Upload exceeds allowed limits':'Something went wrong. Please try again.'});});
export default app;
if(!process.env.VERCEL){
 checkConfig();await connect();
 const server=app.listen(Number(process.env.PORT)||5000,()=>console.log(`AIpiC API running on port ${process.env.PORT||5000}`));
 for(const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>server.close(async()=>{await mongoose.disconnect();process.exit(0);}));
}
