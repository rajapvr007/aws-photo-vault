const cognitoClient = require("../config/cognito");

const {
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
// signup function
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
      ],
    });

    const response = await cognitoClient.send(command);

    return res.status(201).json({
      success: true,
      message: "User created successfully. Check your email for the verification code.",
      data: response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// confirm signup function
exports.confirmSignup = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });

    await cognitoClient.send(command);

    return res.status(200).json({
      success: true,
      message: "User account verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Confirm Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: error.name,
      error: error.message,
    });
  }
};

// login function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      expiresIn: response.AuthenticationResult.ExpiresIn,
      tokenType: response.AuthenticationResult.TokenType,
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(401).json({
      success: false,
      message: error.name,
      error: error.message,
    });
  }
};

// get user profile function
exports.getMe = async (req, res) => {
  try {
    const accessToken = req.token;

    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);

    const user = {
      username: response.Username,
    };

    response.UserAttributes.forEach((attr) => {
      user[attr.Name] = attr.Value;
    });

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Get User Error:", error);

    return res.status(500).json({
      success: false,
      message: error.name,
      error: error.message,
    });
  }
};

// forgot password function
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const command = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
    });

    await cognitoClient.send(command);

    return res.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.name,
      error: error.message,
    });
  }
};
// reset password function
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const command = new ConfirmForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);

    return res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.name,
      error: error.message,
    });
  }
};