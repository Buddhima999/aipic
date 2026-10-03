import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
let pending;
export async function connect(){
 if(mongoose.connection.readyState===1)return;
 if(!pending)pending=mongoose.connect(process.env.MONGO_URI,{serverSelectionTimeoutMS:10000}).catch(e=>{pending=undefined;throw e;});
 await pending;
}
function bucket(){return new GridFSBucket(mongoose.connection.db,{bucketName:'wallpapers'});}
export async function storeFile(name,buffer){await pipeline(Readable.from(buffer),bucket().openUploadStream(name,{metadata:{contentType:'image/webp'}}));}
export async function readFile(name){
 if(!/^[a-zA-Z0-9-]+\.webp$/.test(name))return null;
 const b=bucket(),file=await b.find({filename:name}).next();if(!file)return null;
 const chunks=[];for await(const chunk of b.openDownloadStream(file._id))chunks.push(chunk);return Buffer.concat(chunks);
}
export async function deleteFile(name){const b=bucket();for await(const file of b.find({filename:name}))await b.delete(file._id);}
