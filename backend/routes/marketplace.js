import {Router} from 'express'; const r=Router();
r.get('/',(req,res)=>res.json({module:'marketplace',ok:true,data:[]}));
r.post('/',(req,res)=>res.json({ok:true,source:req.body}));
export default r;
