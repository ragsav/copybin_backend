exports.bin2String = (array)=>{
    var result = "";
    for (var i = 0; i < array.length; i++) {
      result += String.fromCharCode(parseInt(array[i], 2));
    }
    return result;
  }

  
exports.string2Bin = (str)=>{
    var result = [];
    for (var i = 0; i < str.length; i=i+2) {
      result.push(parseInt(str.charCodeAt(i)));
    }
    return result;
  }