const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { codeRegExps, defaultCodeBase } = require('../../common/puzzle.js');

const saltRounds = 10;

let AccountModel = {};

const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  password: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  hintBalance: {
    type: Number,
    default: 0,
  },
  purchasedHints: [{
    code: {
      type: String,
      required: true,
      trim: true,
      match: codeRegExps[defaultCodeBase],
    },
    hint: {
      from: {
        x: Number,
        y: Number,
      },
      to: {
        x: Number,
        y: Number,
      },
    },
    unsolvable: Boolean,
  }],
  completedPuzzles: [{
    type: String,
    trim: true,
    match: codeRegExps[defaultCodeBase],
    sparse: true,
  }],
});

AccountSchema.statics.toAPI = (doc) => ({
  username: doc.username,
  hintBalance: doc.hintBalance,
  purchasedHints: doc.purchasedHints,
  completedPuzzles: doc.completedPuzzles,
  _id: doc._id,
});

AccountSchema.statics.generateHash = (password) => bcrypt.hash(password, saltRounds);

AccountSchema.statics.authenticate = async (username, password, callback) => {
  try {
    const doc = await AccountModel.findOne({ username }).exec();
    if (!doc) {
      return callback();
    }

    const match = await bcrypt.compare(password, doc.password);
    if (match) {
      return callback(null, doc);
    }
    return callback();
  } catch (err) {
    return callback(err);
  }
};

AccountModel = mongoose.model('Account', AccountSchema);
module.exports = AccountModel;
