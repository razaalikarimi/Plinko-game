const { Router } = require('express');
const { verifyRound } = require('../controllers/verifyController');

const router = Router();

router.get('/', verifyRound);

module.exports = router;

