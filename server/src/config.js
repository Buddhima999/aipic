import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({path:path.join(base,'.env')});
export const categories = ['Nature','Space','Abstract','Animals','City','Minimal','Gaming','Cars'];
export function checkConfig(){
 for(const key of ['MONGO_URI','JWT_SECRET','ADMIN_EMAIL','ADMIN_PASSWORD']) if(!process.env[key] || process.env[key].startsWith('replace-')) throw new Error(`Set ${key} in server/.env first`);
 if(process.env.JWT_SECRET.length<32) throw new Error('JWT_SECRET must have at least 32 characters');
 if(process.env.ADMIN_PASSWORD.length<12) throw new Error('ADMIN_PASSWORD must have at least 12 characters');
}
