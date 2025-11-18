const { Schema, model } = require('mongoose');
const RoundStatus = require('../constants/roundStatus');

const pathStepSchema = new Schema(
  {
    row: Number,
    rnd: Number,
    direction: {
      type: String,
      enum: ['L', 'R']
    },
    position: Number,
    pegIndex: Number
  },
  { _id: false }
);

const roundSchema = new Schema(
  {
    commitHex: { type: String, required: true, index: true },
    serverSeed: { type: String, required: true, select: false },
    nonce: { type: String, required: true },
    clientSeed: { type: String },
    combinedSeed: { type: String },
    status: {
      type: String,
      enum: Object.values(RoundStatus),
      default: RoundStatus.CREATED
    },
    betCents: { type: Number },
    payoutMultiplier: { type: Number },
    payoutCents: { type: Number },
    dropColumn: { type: Number },
    pegMapHash: { type: String },
    pegMap: { type: Schema.Types.Mixed },
    leftBias: { type: Number },
    adjustedBias: { type: Number },
    path: [pathStepSchema],
    binIndex: { type: Number },
    rows: { type: Number },
    startedAt: { type: Date },
    revealedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

module.exports = model('Round', roundSchema);

