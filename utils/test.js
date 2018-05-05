var encoding = require('./encoding.js')
var orderInfo = '小程序测试打印';
function str2ab(str) {
  // 19968-40869
  
  let buffer1 = new ArrayBuffer(5)
  let dataView1 = new DataView(buffer1)
  dataView1.setUint8(0, 27);
  dataView1.setUint8(1, 64);
  //倍高 0x1d 0x21 0x01
  dataView1.setUint8(2, 29); 
  dataView1.setUint8(3, 33);
  dataView1.setUint8(4, 1);

  var buffer = new ArrayBuffer(str.length * 2+5)
  var dataView = new Uint8Array(buffer);
  dataView = dataView1;
  // dataView1 = [33,100,47,41,1];
  // dataView = [27, 64, 39, 33, 1];
  // console.log(dataView);
  for (var i = 0, j = 5; i < str.length; i++) {
      var uniStr = str.charCodeAt(i)
      var iStr = str.charAt(i)
      console.log('unistr = ' + uniStr + ',' + iStr)
      if (uniStr >= 18868 && uniStr <= 40869) {
          // 如果是中文
          let uint8array  = new encoding.TextEncoder("gb2312", { NONSTANDARD_allowLegacyEncoding: true }).encode(iStr);
          console.log(uint8array);
          dataView[j] = uint8array[0];
          dataView[j+1] = uint8array[1];
          j+=2;
      } else {
        dataView[j] = uniStr;
        j++;
      }
  }
  console.log("dataView1", dataView1)
  console.log("buffer1", buffer1)
  console.log("dataView", dataView)
  console.log("buffer", buffer)
  return buffer;
}
function str2ab1(str) {
  // 19968-40869
  const RESET = [27, 64];
  const HEIGHT = [29, 33, 1];
  var buffer = new ArrayBuffer(str.length * 2+5)
  var dataView = new Uint8Array(buffer);
  let output = new encoding.TextEncoder("gb2312", { NONSTANDARD_allowLegacyEncoding: true }).encode(str);
  let uint8array = RESET.concat(HEIGHT, output)
  dataView.set(uint8array)
  
  console.log("dataView", dataView)
  console.log("buffer", buffer)
  return buffer;
}
str2ab1(orderInfo);