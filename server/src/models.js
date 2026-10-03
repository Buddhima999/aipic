import mongoose from 'mongoose';
import { categories } from './config.js';
export const Image = mongoose.model('Image',new mongoose.Schema({
 title:{type:String,required:true,maxlength:120},category:{type:String,enum:categories,required:true},
 tags:[String],description:{type:String,maxlength:1000},filename:{type:String,required:true},thumbnail:{type:String,required:true},
 width:Number,height:Number,bytes:Number,downloads:{type:Number,default:0}
},{timestamps:true}));
export const Admin = mongoose.model('Admin',new mongoose.Schema({email:{type:String,unique:true,required:true},passwordHash:{type:String,required:true}}));
