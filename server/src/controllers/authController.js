const AWS = require('aws-sdk');
const { User } = require('../models/mysql');

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.COGNITO_REGION
});

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
        { Name: 'preferred_username', Value: username || email.split('@')[0] }
      ]
    };

    const cognitoUser = await cognito.signUp(params).promise();

    // Create user in MySQL as well
    const newUser = await User.create({
      id: cognitoUser.UserSub,
      email,
      username: username || email.split('@')[0],
      fullName,
      role: 'customer'
    });

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: newUser
    });
  } catch (error) {
    console.error('Registration Error:', error);
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
        PASSWORD: password
      }
    };

    const response = await cognito.initiateAuth(params).promise();
    
    // Fetch user details from MySQL
    const user = await User.findOne({ where: { email } });

    res.json({
      token: response.AuthenticationResult.IdToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      user
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(401).json({ error: 'Invalid email or password' });
  }
};
