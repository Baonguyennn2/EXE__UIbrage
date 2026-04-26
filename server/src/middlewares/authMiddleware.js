const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
require('dotenv').config();

const client = jwksRsa({
  jwksUri: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, getKey, {
    issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token', error: err.message });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded['cognito:username'],
      role: decoded['custom:role'] || 'customer'
    };
    next();
  });
};

module.exports = authMiddleware;
