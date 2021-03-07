const textEntry = require("../models/textEntry.model");

// const Blowfish = require('egoroof-blowfish');
const passwordValidator = require('password-validator');
// const { schema } = require("../models/text10m.model");
// const {bin2String,string2Bin} = require("../helpers/byteDataUtility")
const crypto = require('crypto');
require("dotenv").config({
  path: "./config/config.env",
});




const base_url = "https://copybin-5de5c.web.app/";
const iv = "whfowihohrrovhhvjqsvhdjjadsllv"
const key = "wlklncwlcnlbvvlrnlnvlkevlsnskvbevldnlsnlndlvvnlsbvevlnlnsv"
const link_key = "wjebcbwcbkweblkcnovldheojlkbwrro";


  



function encodeText(text,key,iv){
    var ivstring = iv.toString("hex").slice(0, 16);
    var key_string = crypto
      .createHash("sha256")
      .update(String(key))
      .digest("base64")
      .substr(0, 32);
    var cipher = crypto.createCipheriv(
      "aes-256-cbc",
      key_string,
      ivstring
    );
    var encodedString =
      cipher.update(text, "utf8", "hex") + cipher.final("hex");
    return encodedString
}

function decodeText(text, key, iv) {
  var ivstring = iv.toString("hex").slice(0, 16);
   var key_string = crypto
     .createHash("sha256")
     .update(String(key))
     .digest("base64")
     .substr(0, 32);
  var decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key_string,
    ivstring
  );

   var decodedText =
     decipher.update(text, "hex", "utf8") + decipher.final("utf8");

    return decodedText
}

exports.encrypt_decrypt = (req, res) => {
  const { password, file } = req.body;

  console.log(req);
};
exports.generateLink = (req, res) => {
  const {
    text,
    expiry,
    isPassword,
    password,
    editable,
    public,
    title,
  } = req.body;

  console.log(req.body);
  var encodedText =
    isPassword === true
      ? encodeText(text, password, iv)
      : encodeText(text, key, iv);

      
  let timeObject = new Date();
  let milliseconds = expiry * 1000; // 10 seconds = 10000 milliseconds
  timeObject = new Date(timeObject.getTime() + milliseconds);
  var textLink = new textEntry({
    encodedText:public===true?text:encodedText,
    isPassword,
    password,
    expiry: timeObject,
    editable,
    public,
    title,
  });

  textLink.save((err, text_entry) => {
    if (err && !text_entry) {
      return res.json({
        success: false,
        message: err,
      });
    } else {
    //   var encodedLink = encodeText(text_entry._id.toString(), link_key, iv);
      return res.json({
        success: true,
        url: base_url + "viewer/" + text_entry._id,
      });
    }
  });
};;


exports.updateLink = (req, res) => {
  const { text, isPassword, password, tid } = req.body;
//   var tid_decoded = decodeText(tid,link_key,iv)

  var encodedText = isPassword===true?encodeText(text, password, iv):encodeText(text,key,iv) ;


  textEntry
    .findOne({ _id: tid,editable:true})
    .exec((err, text_entry) => {
      if (!err && text_entry) {
        if ((text_entry.isPassword&&text_entry.password===password)||(text_entry.isPassword===false)) {
            
          
          textEntry
            .updateOne(
              { _id: tid },
              { encodedText: text_entry.public ? text : encodedText }
            )
            .exec((err, updated_entry) => {
              if (!err && updated_entry) {
                return res.json({
                  success: true,
                  message: "Updated text",
                });
              } else {
                return res.json({
                  success: false,
                  message: "Something went wrong",
                });
              }
            });
        }
        else{
            return res.json({
              success: false,
              message:
                "Incorrect password",
            });
        }
      } else {
        return res.json({
          success: false,
          message:
            "The document is not editable",
        });
      }
    });
  
  
  
};


exports.tapLink = (req,res) =>{
    // var tid_decoded = decodeText(req.params.tid, link_key, iv);
    console.log(req.params.tid);
    textEntry.findOne({ _id: req.params.tid }).exec((err, text_entry) => {
      if (!err && text_entry) {
        if (text_entry.isPassword) {
          return res.json({
            success: true,
            message: "please enter password",
          });
        } else {
          var decodedText =
            text_entry.public === true
              ? text_entry.encodedText
              : decodeText(text_entry.encodedText, key, iv);

          return res.json({
            success: true,
            message: {
              text: decodedText,
              title: text_entry.title,
              createdAt: text_entry.createdAt,
              updatedAt: text_entry.updatedAt,
            },
            editable: text_entry.editable,
          });
        }
      } else {
        return res.json({
          success: false,
          message:
            "The document you are trying to access may have been expired",
        });
      }
    });
}
  exports.openLinkWithPassword = (req, res) => {
    const { isPassword, password, tid } = req.body;
    // var tid_decoded = decodeText(tid, link_key, iv);
    console.log(tid);

    
    textEntry
      .findOne({ _id: tid, password: password ,isPassword:true})
      .exec((err, text_entry) => {
        if (!err && text_entry) {
          var decodedText =
            text_entry.public === true
              ? text_entry.encodedText
              : decodeText(text_entry.encodedText, password, iv);

          return res.json({
            success: true,
            message: {
              text: decodedText,
              title: text_entry.title,
              createdAt: text_entry.createdAt,
              updatedAt: text_entry.updatedAt,
            },
            editable: text_entry.editable,
          });
        } else {
          return res.json({
            success: false,
            message:
              "The document you are trying to access may have been expired or enter correct password",
          });
        }
      });
  };

  exports.getLatestPosts = (req, res) => {
    textEntry
      .find({ public: true })
      .select(["-password"])

      .sort({ updatedAt: -1 })
      .limit(20)
      .exec(function (err, posts) {
        if (!err && posts) {
          return res.json({
            success: true,
            message: posts,
          });
        } else {
          return res.json({
            success: false,
            message: error,
          });
        }
        // `posts` will be of length 20
      });
  };

