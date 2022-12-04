const mongoose = require('mongoose');
const _ = require('underscore');
const { codeRegExps, defaultCodeBase } = require('../../client/puzzle.js');

let PuzzleModel = {};

const setTitle = (title) => _.escape(title).trim();

const PuzzleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    set: setTitle,
  },
  creatorName: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
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

PuzzleSchema.statics.toAPI = (doc) => ({
  title: doc.title,
  creatorName: doc.creatorName,
  creatorId: doc.creatorId,
  createdDate: doc.createdDate,
  code: doc.code,
});

PuzzleSchema.statics.findByCodeAndCreator = (code, username, callback) => {
  const search = {
    creatorName: username,
    code,
  };

  return PuzzleModel.findOne(search).select('title createdDate').lean().exec(callback);
};

PuzzleSchema.statics.getAll = (callback) => PuzzleModel.find({}).select('title creatorName creatorId createdDate code').lean().exec(callback);

PuzzleModel = mongoose.model('Puzzle', PuzzleSchema);

module.exports = PuzzleModel;
