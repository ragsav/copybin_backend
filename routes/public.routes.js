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


router.post("/public/generateLink",generateLink);
router.post("/public/updateLink", updateLink);
router.get("/public/tapLink/:tid",tapLink);
router.post("/public/openLink/",openLinkWithPassword);
router.get("/public/getLatestPosts", getLatestPosts);


module.exports = router;
