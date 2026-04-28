const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, getKey, {
    issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token: ' + err.message });
    
    // Set user info from decoded token
    // Cognito access tokens have 'sub' and 'username'
    // Id tokens have more info. We assume access token here for simplicity, 
    // but we can pass 'user' in the request if needed.
    req.user = {
      id: decoded.sub,
      username: decoded.username,
      role: decoded['cognito:groups']?.includes('admin') ? 'admin' : 'customer'
    };
    next();
  });
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
