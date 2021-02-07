const textEntry = require("../models/textEntry.model");

// const Blowfish = require('egoroof-blowfish');
const passwordValidator = require('password-validator');
// const { schema } = require("../models/text10m.model");
// const {bin2String,string2Bin} = require("../helpers/byteDataUtility")
const crypto = require('crypto');
require("dotenv").config({
    path: "./config/config.env",
  });


var passwordSchema = new passwordValidator();
passwordSchema
.is().min(8)                                    
.is().max(8)
.has().not().symbols()                                  
.has().not().spaces();

const base_url = "https://copybinback.herokuapp.com/api/public/tapLink/";
const iv = "whfowihohrrovhhvjqsvhdjjadsllv"
const key = "wlklncwlcnlbvvlrnlnvlkevlsnskvbevldnlsnlndlvvnlsbvevlnlnsv"
const link_key = "wjebcbwcbkweblkcnovldheojlkbwrro";
var keystring = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
var linkKeyString = crypto
  .createHash("sha256")
  .update(String(link_key))
  .digest("base64")
  .substr(0, 32);
var ivstring = iv.toString("hex").slice(0, 16);
  





exports.generateLink = (req, res) => {
    const {text,expiry,isPassword,password} = req.body
    console.log(req.body);
    var encodedText
    if(isPassword){
        if(passwordSchema.validate(password)){
            var passwordstring = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32);
            var password_cipher = crypto.createCipheriv('aes-256-cbc',passwordstring,ivstring);  
            encodedText = password_cipher.update(text, 'utf8', 'hex') + password_cipher.final('hex');
        }else{
            var rules_unfollowed = passwordSchema.validate(password, { list: true })
            return res.json({
                success:false,
                message:rules_unfollowed
            })
        }    
    }else{
        var default_cipher = crypto.createCipheriv(
          "aes-256-cbc",
          keystring,
          ivstring
        );
        encodedText = default_cipher.update(text,'utf8','hex')+default_cipher.final('hex');
    }
    let timeObject = new Date();
    let milliseconds= expiry * 1000; // 10 seconds = 10000 milliseconds
    timeObject = new Date(timeObject.getTime() + milliseconds);
    var textLink = new textEntry({
        encodedText,
        isPassword,
        password,
        expiry:timeObject
      });
    

    
    textLink.save((err,link)=>{
        if(err&&!link){
            return res.json({
                success:false,
                message:err
            })
        }else{
            var link_cipher = crypto.createCipheriv(
              "aes-256-cbc",
              linkKeyString,
              ivstring
            );
            var encodedLink =
              link_cipher.update(link._id.toString(), "utf8", "hex") +
              link_cipher.final("hex");
            return res.json({
              success: true,
              url: base_url + encodedLink,
            });
        }
    });
  };

exports.tapLink = (req,res) =>{
    var link_decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      linkKeyString,
      ivstring
    );

    const tid =
      link_decipher.update(req.params.tid, "hex", "utf8") +
      link_decipher.final("utf8");
    console.log(tid)
    textEntry.findOne({ _id: tid }).exec((err, text) => {
      if (!err && text) {
        if (text.isPassword) {
          return res.json({
            success: true,
            message: "please enter password",
          });
        } else {
            var default_decipher = crypto.createDecipheriv(
              "aes-256-cbc",
              keystring,
              ivstring
            );
          decodedText =
            default_decipher.update(text.encodedText, "hex", "utf8") +
            default_decipher.final("utf8");
          return res.json({
            success: true,
            message: decodedText,
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
      var link_decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        linkKeyString,
        ivstring
      );

    const { tid_req, password } = req.body;
    const tid =
      link_decipher.update(tid_req, "hex", "utf8") +
      link_decipher.final("utf8");
    var passwordstring = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32);
    var password_decipher = crypto.createDecipheriv('aes-256-cbc',passwordstring,ivstring);
    textEntry.findOne({_id:tid,password:password}).exec((err,text_entry)=>{
                    if(!err&&text_entry){
                        if(text_entry.isPassword){
                            decodedText = password_decipher.update(text_entry.encodedText, 'hex', 'utf8') + password_decipher.final('utf8');
                            return res.json({
                                success:true,
                                message:decodedText
                            });
                        }
                    }else{
                        return res.json({
                            success:false,
                            message:"The document you are trying to access may have been expired"
                        });
                    }
                })
            

  };

