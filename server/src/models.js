import mongoose from 'mongoose';
export const Image = mongoose.model('Image',new mongoose.Schema({
 title:{type:String,required:true,maxlength:120},category:{type:String,required:true},
 tags:[String],description:{type:String,maxlength:1000},filename:{type:String,required:true},thumbnail:{type:String,required:true},
 width:Number,height:Number,bytes:Number,downloads:{type:Number,default:0},order:{type:Number,default:0},trending:{type:Boolean,default:false},featuredNewest:{type:Boolean,default:false},featuredPopular:{type:Boolean,default:false}
},{timestamps:true}));
export const Admin = mongoose.model('Admin',new mongoose.Schema({email:{type:String,unique:true,required:true},passwordHash:{type:String,required:true}}));
export const Category = mongoose.model('Category',new mongoose.Schema({name:{type:String,required:true,unique:true,trim:true,maxlength:40},active:{type:Boolean,default:true}},{timestamps:true}));
export const TrendingSnapshot = mongoose.model('TrendingSnapshot',new mongoose.Schema({key:{type:String,unique:true,required:true},imageIds:[mongoose.Schema.Types.ObjectId],refreshedAt:{type:Date,required:true}}));
