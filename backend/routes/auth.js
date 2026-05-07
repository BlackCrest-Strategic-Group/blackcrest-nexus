import {Router} from 'express';import jwt from 'jsonwebtoken';import bcrypt from 'bcryptjs';const r=Router();const users=[];
r.post('/register',async(req,res)=>{const {name,email,password,role='viewer'}=req.body;users.push({name,email,password:await bcrypt.hash(password,10),role});res.json({ok:true});});
r.post('/login',async(req,res)=>{const u=users.find(x=>x.email===req.body.email);if(!u||!(await bcrypt.compare(req.body.password,u.password))) return res.status(401).json({error:'bad creds'});const token=jwt.sign({email:u.email,role:u.role},process.env.JWT_SECRET,{expiresIn:'1h'});res.json({token,user:{email:u.email,role:u.role}});});
r.post('/refresh',(req,res)=>res.json({token:jwt.sign({sub:'refresh'},process.env.JWT_SECRET,{expiresIn:'1h'})})); export default r;
