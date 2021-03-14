const jwt = require("jsonwebtoken");
const key = require("../config/keys");

module.exports = (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization.split(" ")[1],
      key.secretORKey
    );
    req.userData = decode;
    next();
  } catch (error) {
    console.log({error});
    return res.status(401).json({ success:false,msg: "Login Required" });
  }
};
