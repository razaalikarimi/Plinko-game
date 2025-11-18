const { Router } = require('express');
const {
  commitRound,
  startRound,
  revealRound,
  getRound
} = require('../controllers/roundController');

const router = Router();

router.post('/commit', commitRound);
router.post('/:id/start', startRound);
router.post('/:id/reveal', revealRound);
router.get('/:id', getRound);

module.exports = router;

