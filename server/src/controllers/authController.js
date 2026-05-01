const axios = require('axios');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models/mysql');

function calculateSecretHash(username, clientId, clientSecret) {
  if (!clientSecret) return undefined;
  return crypto
    .createHmac('SHA256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.COGNITO_REGION
});

exports.googleLogin = async (req, res) => {
  // Strip protocol if it was accidentally included in .env
  let domain = process.env.COGNITO_DOMAIN || '';
  domain = domain.replace('https://', '').replace('http://', '');
  
  const clientId = process.env.COGNITO_CLIENT_ID;
  const redirectUri = process.env.COGNITO_REDIRECT_URI;

  if (!domain || !clientId || !redirectUri) {
    return res.status(500).json({ 
      error: 'Cognito configuration missing in .env (COGNITO_DOMAIN, COGNITO_CLIENT_ID, or COGNITO_REDIRECT_URI)' 
    });
  }
  
  const authUrl = `https://${domain}/oauth2/authorize?identity_provider=Google&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&client_id=${clientId}&scope=email%20openid%20profile`;
  
  res.redirect(authUrl);
};

exports.googleCallback = async (req, res) => {
  const { code } = req.query;
  let domain = (process.env.COGNITO_DOMAIN || '').replace('https://', '').replace('http://', '');
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  const redirectUri = process.env.COGNITO_REDIRECT_URI;
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  if (!code) {
    return res.redirect(`${clientOrigin}/auth/login?error=no_code`);
  }

  try {
    // 1. Exchange the authorization code for Cognito Tokens
    const tokenResponse = await axios.post(`https://${domain}/oauth2/token`, 
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri
      }), 
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { id_token, access_token } = tokenResponse.data;

    // 2. Decode ID Token to get User Info
    const decoded = jwt.decode(id_token);
    const { email, name, sub, "preferred_username": username } = decoded;

    // 3. Sync with local MySQL database
    const groups = decoded['cognito:groups'] || [];
    const role = groups.includes('admin') ? 'admin' : 'customer';

    const [user] = await User.findOrCreate({
      where: { email },
      defaults: {
        id: sub,
        email,
        fullName: name || email.split('@')[0],
        username: username || email.split('@')[0],
        role: role
      }
    });

    // Update role if user already exists but role changed
    if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    // 4. Redirect to frontend with token and user info
    // We stringify the user to pass it easily, or the frontend can fetch it later
    res.redirect(`${clientOrigin}/auth/login/success?token=${id_token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (error) {
    console.error('Google Callback Error:', error.response?.data || error.message);
    res.redirect(`${clientOrigin}/auth/login?error=google_auth_failed`);
  }
};

exports.register = async (req, res) => {
  const { email, password, fullName, username } = req.body;

  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: fullName },
        { Name: 'preferred_username', Value: username || email.split('@')[0] },
        { Name: 'picture', Value: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || email)}&background=random` }
      ],
      SecretHash: calculateSecretHash(email, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET)
    };

    // Only sign up in Cognito. DO NOT save to MySQL yet.
    await cognito.signUp(params).promise();

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.'
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.confirmSignUp = async (req, res) => {
  const { email, code } = req.body;
  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      ConfirmationCode: code,
      Username: email,
      SecretHash: calculateSecretHash(email, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET)
    };
    await cognito.confirmSignUp(params).promise();

    // After successful confirmation, we need to get user attributes from Cognito 
    // to save them into our local MySQL DB.
    const adminParams = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email
    };
    const cognitoUser = await cognito.adminGetUser(adminParams).promise();
    
    const attributes = {};
    cognitoUser.UserAttributes.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });

    // Save to MySQL now that they are verified
    // Note: Cognito attributes usually come back as 'sub', 'email', 'name', etc.
    const sub = cognitoUser.UserAttributes.find(a => a.Name === 'sub')?.Value;

    const newUser = await User.create({
      id: sub || email, 
      email: attributes.email,
      username: attributes.preferred_username || email.split('@')[0],
      fullName: attributes.name || attributes.given_name || email.split('@')[0],
      avatarUrl: attributes.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(attributes.name || email)}&background=random`,
      role: 'customer'
    });

    res.json({ 
      message: 'Email verified and account created successfully.',
      user: newUser 
    });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.resendConfirmationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      SecretHash: calculateSecretHash(email, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET)
    };
    await cognito.resendConfirmationCode(params).promise();
    res.json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    console.error('Resend Code Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: calculateSecretHash(email, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET)
      }
    };

    const response = await cognito.initiateAuth(params).promise();
    const idToken = response.AuthenticationResult.IdToken;
    const decoded = jwt.decode(idToken);
    
    // Determine role from Cognito Groups
    const groups = decoded['cognito:groups'] || [];
    const role = groups.includes('admin') ? 'admin' : 'customer';

    // Fetch user from MySQL or create if missing, and update role if it changed
    let [user] = await User.findOrCreate({ 
      where: { email },
      defaults: {
        id: decoded.sub,
        email,
        username: email.split('@')[0],
        fullName: email.split('@')[0],
        role: role
      }
    });
    
    if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    res.json({
      token: idToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      user
    });
  } catch (error) {
    console.error('Login Error Detailed:', error);
    res.status(401).json({ 
      error: error.message || 'Authentication failed',
      code: error.code 
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      SecretHash: calculateSecretHash(email, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET)
    };
    await cognito.forgotPassword(params).promise();
    res.json({ message: 'Password reset code sent to your email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.confirmForgotPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      ConfirmationCode: code,
      Password: newPassword,
      Username: email,
      SecretHash: calculateSecretHash(email, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET)
    };
    await cognito.confirmForgotPassword(params).promise();
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(400).json({ error: error.message });
  }
};
