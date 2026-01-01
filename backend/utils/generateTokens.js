const jwt = require("jsonwebtoken");

const generateToken = (user, userType) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,     // regularPlayer | captain | owner | admin
      type: userType,     // player | owner | admin
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );
};

module.exports = generateToken;
