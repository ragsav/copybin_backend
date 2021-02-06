const express = require("express");
const router = express.Router();

// import controller
const {
  generateLink,
  tapLink,
  openLinkWithPassword
} = require('../controllers/public.controller');


router.post("/public/generateLink",generateLink);
router.get("/public/tapLink/:tid",tapLink);
router.post("/public/openLink/",openLinkWithPassword);


module.exports = router;
