const crypto = require('crypto');

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = {
  sha256Hex
};

