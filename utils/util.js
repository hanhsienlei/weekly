require("dotenv").config();
const User = require("../server/models/user_model");
const { TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require("jsonwebtoken");
const getDateYMD = require("./date_converter")

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

const authentication = (roleId) => {
  return async function (req, res, next) {
    let accessToken = req.get("Authorization");
    if (!accessToken) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    accessToken = accessToken.replace("Bearer ", "");
    if (accessToken == "null") {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    try {
      const user = jwt.verify(accessToken, TOKEN_SECRET);
      req.user = user;
      if (roleId == null) {
        next();
      } else {
        let userDetail;
        if (roleId == User.USER_ROLE.ALL) {
          userDetail = await User.getUserDetail(user.email);
        } else {
          userDetail = await User.getUserDetail(user.email, roleId);
        }
        if (!userDetail) {
          res.status(403).send({ error: "Forbidden" });
        } else {
          req.user.id = userDetail.id;
          req.user.role_id = userDetail.role_id;
          next();
        }
      }
      return;
    } catch (err) {
      res.status(403).send({ error: "Forbidden" });
      return;
    }
  };
};

module.exports = {
  wrapAsync,
  authentication
}