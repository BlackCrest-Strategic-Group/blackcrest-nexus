const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  title: String,
  sourceFileName: String,
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String
}, { timestamps: true });

module.exports = mongoose.model('Proposal', ProposalSchema);
