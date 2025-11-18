const { z } = require('zod');
const Round = require('../models/Round');
const asyncHandler = require('../middleware/asyncHandler');
const { createRoundArtifacts, ROWS } = require('../services/gameEngine');

const verifySchema = z.object({
  serverSeed: z.string().min(10),
  clientSeed: z.string().min(1),
  nonce: z.string().min(1),
  dropColumn: z.coerce.number().int().min(0).max(ROWS),
  roundId: z.string().optional()
});

const verifyRound = asyncHandler(async (req, res) => {
  const parsed = verifySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(422).json({ message: 'Invalid query parameters', issues: parsed.error.flatten() });
  }

  const { serverSeed, clientSeed, nonce, dropColumn, roundId } = parsed.data;

  const artifacts = createRoundArtifacts({
    serverSeed,
    clientSeed,
    nonce,
    dropColumn
  });

  let roundComparison = null;

  if (roundId) {
    const round = await Round.findById(roundId);
    if (round) {
      roundComparison = {
        roundId,
        commitMatch: round.commitHex === artifacts.commitHex,
        pegMapHashMatch: round.pegMapHash === artifacts.pegMapHash,
        binIndexMatch: round.binIndex === artifacts.binIndex,
        combinedSeedMatch: round.combinedSeed === artifacts.combinedSeed,
        status: round.status
      };
    }
  }

  res.json({
    commitHex: artifacts.commitHex,
    combinedSeed: artifacts.combinedSeed,
    pegMapHash: artifacts.pegMapHash,
    binIndex: artifacts.binIndex,
    payoutMultiplier: artifacts.payoutMultiplier,
    path: artifacts.path,
    adjustedBias: artifacts.adjustedBias,
    roundComparison
  });
});

module.exports = { verifyRound };

