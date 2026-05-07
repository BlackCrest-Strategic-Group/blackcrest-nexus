import mongoose from 'mongoose';
const schema=new mongoose.Schema({payload:Object},{timestamps:true});
export default mongoose.model('AuditLog',schema);
