const mongoose = require('mongoose');
const _ = require('underscore');
const { codeRegExps, defaultCodeBase } = require('../../client/puzzle.js');
const { Account } = require('.');

let PuzzleModel = {};

const setTitle = (title) => _.escape(title).trim();

const PuzzleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    set: setTitle,
  },
  creatorId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  code: {
    type: String,
    required: true,
    trim: true,
    match: codeRegExps[defaultCodeBase],
  },
});

PuzzleSchema.statics.toAPI = async (doc) => {
  const account = await Account.findById(doc.creatorId);
  return {
    title: doc.title,
    creatorName: account.name,
    creatorId: doc.creatorId,
    createdDate: doc.createdDate,
    code: doc.code,
  };
};

PuzzleSchema.statics.findByCodeAndCreator = async (code, username, callback) => {
  const { _id } = await Account.find({ username });
  const search = {
    creatorId: mongoose.Types.ObjectId(_id),
    code,
  };

  return PuzzleModel.find(search).select('title code').lean().exec(callback);
};

PuzzleModel = mongoose.model('Puzzle', PuzzleSchema);

module.exports = PuzzleModel;
