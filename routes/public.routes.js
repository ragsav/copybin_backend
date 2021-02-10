const express = require("express");
const router = express.Router();

// import controller
const {
  generateLink,
  tapLink,
  openLinkWithPassword,
  updateLink,
  getLatestPosts,
} = require("../controllers/public.controller");

const { validatePassword, validateText } = require("../controllers/validation");


router.post(
  "/public/generateLink",
  validateText,
  validatePassword,
  generateLink
);
router.post("/public/updateLink", validateText, validatePassword, updateLink);
router.get("/public/tapLink/:tid",tapLink);
router.post(
  "/public/openLink/",
  validateText,
  validatePassword,
  openLinkWithPassword
);
router.get("/public/getLatestPosts", getLatestPosts);


module.exports = router;
