const crypto = require('crypto');
const { z } = require('zod');

const Round = require('../models/Round');
const RoundStatus = require('../constants/roundStatus');
const asyncHandler = require('../middleware/asyncHandler');
const { createRoundArtifacts, ROWS } = require('../services/gameEngine');

const startSchema = z.object({
  clientSeed: z.string().min(3).max(128),
  betCents: z.number().int().min(1).max(1_000_000),
  dropColumn: z.number().int().min(0).max(ROWS)
});

const commitRound = asyncHandler(async (req, res) => {
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const nonce = crypto.randomUUID();
  const commitHex = crypto
    .createHash('sha256')
    .update(`${serverSeed}:${nonce}`)
    .digest('hex');

  const round = await Round.create({
    serverSeed,
    nonce,
    commitHex,
    status: RoundStatus.CREATED
  });

  res.status(201).json({
    roundId: round.id,
    commitHex,
    nonce
  });
});

const startRound = asyncHandler(async (req, res) => {
  const round = await Round.findById(req.params.id).select('+serverSeed');
  if (!round) {
    return res.status(404).json({ message: 'Round not found' });
  }
  if (round.status !== RoundStatus.CREATED) {
    return res.status(409).json({ message: 'Round already started' });
  }

  const parsed = startSchema.safeParse({
    clientSeed: req.body?.clientSeed,
    betCents: Number(req.body?.betCents),
    dropColumn: Number(req.body?.dropColumn)
  });

  if (!parsed.success) {
    return res.status(422).json({ message: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const { clientSeed, betCents, dropColumn } = parsed.data;

  const artifacts = createRoundArtifacts({
    serverSeed: round.serverSeed,
    clientSeed,
    nonce: round.nonce,
    dropColumn
  });

  round.clientSeed = clientSeed;
  round.combinedSeed = artifacts.combinedSeed;
  round.pegMap = artifacts.pegMap;
  round.pegMapHash = artifacts.pegMapHash;
  round.path = artifacts.path;
  round.binIndex = artifacts.binIndex;
  round.dropColumn = dropColumn;
  round.betCents = betCents;
  round.payoutMultiplier = artifacts.payoutMultiplier;
  round.payoutCents = Math.round(betCents * artifacts.payoutMultiplier);
  round.rows = ROWS;
  round.status = RoundStatus.STARTED;
  round.startedAt = new Date();

  await round.save();

  res.json({
    roundId: round.id,
    pegMapHash: round.pegMapHash,
    rows: ROWS,
    binIndex: round.binIndex,
    payoutMultiplier: round.payoutMultiplier,
    path: round.path,
    combinedSeed: round.combinedSeed
  });
});

const revealRound = asyncHandler(async (req, res) => {
  const round = await Round.findById(req.params.id).select('+serverSeed');
  if (!round) {
    return res.status(404).json({ message: 'Round not found' });
  }
  if (round.status === RoundStatus.CREATED) {
    return res.status(409).json({ message: 'Round has not started yet' });
  }
  if (round.status === RoundStatus.REVEALED) {
    return res.json({ serverSeed: round.serverSeed });
  }

  round.status = RoundStatus.REVEALED;
  round.revealedAt = new Date();
  await round.save();

  res.json({ serverSeed: round.serverSeed });
});

const getRound = asyncHandler(async (req, res) => {
  const round = await Round.findById(req.params.id).select('+serverSeed');
  if (!round) {
    return res.status(404).json({ message: 'Round not found' });
  }

  const payload = round.toObject();
  if (payload.status !== RoundStatus.REVEALED) {
    delete payload.serverSeed;
  }

  res.json(payload);
});

module.exports = {
  commitRound,
  startRound,
  revealRound,
  getRound
};

