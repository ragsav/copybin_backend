const passwordValidator = require("password-validator");

var passwordSchema = new passwordValidator();
passwordSchema
  .is()
  .min(8)
  .is()
  .max(8)
  .has()
  .not()
  .symbols()
  .has()
  .not()
  .spaces();

exports.validatePassword = (req, res, next) => {
  if (req.body.isPassword) {
    if (req.body.password && passwordSchema.validate(req.body.password)) {
      next();
    } else {
      return res.json({
        success: false,
        message: "Enter a valid password",
      });
    }
  } else {
    if (req.body.password) {
      return res.json({
        success: false,
        message: "Incorrect request to server",
      });
    } else {
      next();
    }
  }
};

exports.validateText = (req, res, next) => {
  if (req.body.text) {
    try {
      req.body.text = String(req.body.text);
      next();
    } catch (e) {
      console.error(e);
      return res.json({
        success: false,
        message: "Your text contains script that is not supported",
      });
    }
  } else {
    return res.json({
      success: false,
      message: "Please enter a valid text",
    });
  }
};
