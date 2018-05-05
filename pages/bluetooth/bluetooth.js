// import encoding
var encoding = require('../../utils/encoding.js')
var app = getApp()
var temp = []
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    isopen: false,
    disabled: false,
    connected: false,
    //
    connectedDeviceId: '',
    serviceId: '',
    characteristicId: '',
  },
  switchChange: function () {
    var that = this
    that.setData({
      isopen: !that.data.isopen,
      errmsg: ""
    })
    if (that.data.isopen) {
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log(res)
          that.setData({
            errmsg: "功能已启用"
          })
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log("蓝牙适配器状态变化", res)
            that.setData({
              actioninfo: res.available ? "蓝牙适配器可用" : "蓝牙适配器不可用",
              searchingstatus: res.discovering ? "正在搜索" : "搜索可用"
            })
          })
          wx.onBluetoothDeviceFound(function (res) {
            if(res.devices[0].name) {
              let data = res;
              let dateIn = false;
              for (let i = 0; i < temp.length; i++) {
                if (temp[i].deviceId == data.devices[0].deviceId) {
                  dateIn = true;
                  break;
                }
              }
              if (!dateIn) {
                console.log(data)
                temp.push(data.devices[0])
                that.setData({
                  devices: temp
                })
                console.log('发现新蓝牙设备')
                console.log('设备id' + data.devices[0].deviceId)
                console.log('设备name' + data.devices[0].name)
              }
            }
          })
        },
        fail: function (res) {
          console.log(res)
          that.setData({
            errmsg: "请检查手机蓝牙是否打开"
          })
        }
      })
    } else {
      wx.closeBluetoothAdapter({
        success: function (res) {
          console.log(res)
          that.setData({
            errmsg: "功能已关闭"
          })
        },
        fail: function (res) {
          console.log(res)
          that.setData({
            errmsg: "请检查手机蓝牙是否打开"
          })
        }
      })
    }
    console.log('bluetooth is open :' + that.data.isopen)
  },
  searchbluetooth: function () {
    var that = this
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("开始搜索附近蓝牙设备")
        console.log(res)
      }
    })
  },
  connectTO: function (e) {
    var that = this
    console.log(e)
    wx.createBLEConnection({
      deviceId: e.currentTarget.id,
      //deviceId: "98:D3:32:30:B0:4E",
      success: function (res) {
        console.log("连接设备成功")
        console.log(res)
        that.setData({
          connected: true,
          connectedDeviceId: e.currentTarget.id
        })
      },
      fail: function (res) {
        console.log("连接设备失败")
        console.log(res)
        that.setData({
          connected: false
        })
      }
    })
    wx.stopBluetoothDevicesDiscovery(function () {

    })
  },
  showbluetooth: function () {
    wx.getBluetoothDevices({
      success: function (res) {
        console.log("显示所有蓝牙设备")
        console.log(res)
      }
    })
  },
  checkbluetooth: function () {
    var that = this
    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log(res)
        that.setData({
          actioninfo: res.available ? "蓝牙适配器可用" : "蓝牙适配器不可用",
          searchingstatus: res.discovering ? "正在搜索" : "搜索可用"
        })
      },
      fail: function (res) {
        console.log(res)
        that.setData({
          errmsg: "获取蓝牙适配器信息失败"
        })
      }
    })
  },
  stopsearch: function () {
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("停止蓝牙搜索")
        console.log(res)
      }
    })
  },

  sendtoequ: function (e) {
    var that = this
    console.log("发送消息到:deviceId" + that.data.connectedDeviceId);
    console.log("serviceId:" + that.data.serviceId);
    console.log("characteristicId:" + that.data.characteristicId);

    var orderInfo;
    orderInfo = '小程序测试打印';
    // orderInfo += '名称　　　　　 单价  数量 金额';
    // orderInfo += '------------------------------';
    // orderInfo += '饭　　　　　 　10.0   10  10.0';
    // orderInfo += '炒饭　　　　　 10.0   10  10.0';
    // orderInfo += '蛋炒饭　　　　 10.0   100 100.0';
    // orderInfo += '鸡蛋炒饭　　　 100.0  100 100.0';
    // orderInfo += '西红柿炒饭　　 1000.0 1   100.0';
    // orderInfo += '西红柿蛋炒饭　 100.0  100 100.0';
    // orderInfo += '西红柿鸡蛋炒饭 15.0   1   15.0';
    // orderInfo += '备注：加辣';
    // orderInfo += '--------------------------------';
    // orderInfo += '合计：xx.0元';
    // orderInfo += '送货地点：广州市南沙区xx路xx号';
    // orderInfo += '联系电话：13888888888888';
    // orderInfo += '订餐时间：2014-08-08 08:08:08';
    // orderInfo += '<QR>http://www.dzist.com</QR>';

    // let list = breakString(orderInfo, 1);
    // console.log(list)
    // for(let i=0; i<list.length;i++) {
      // let _value = new encoding.TextEncoder("gb2312", { NONSTANDARD_allowLegacyEncoding: true }).encode(orderInfo).buffer;
      let _value = (orderInfo);
      wx.writeBLECharacteristicValue({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
        deviceId: that.data.connectedDeviceId,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
        serviceId: that.data.serviceId,
        // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
        characteristicId: that.data.characteristicId,
        // 这里的value是ArrayBuffer类型
        value: _value,
        success: function (res) {
          console.log(res)
        }
      })
    // }
  },
  inputTextchange: function (e) {
    console.log("数据变化")
    console.log(e)
    this.setData({
      inputValue: e.detail.value
    })
  },
  getAllservice: function (e) {
    var that = this
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: this.data.connectedDeviceId,
      success: function (res) {
        console.log('device services:', res.services)
        that.setData({
          services: res.services
        })
      }
    })
  },
  linkto: function (e) {
    var that = this;
    let _serviceId = e.currentTarget.dataset["uuid"];
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: _serviceId,
      success: function (res) {
        console.log('device getBLEDeviceCharacteristics:', res)
        let index = null;
        for(let i=0;i<res.characteristics.length;i++) {
          if(res.characteristics[i].properties.read&&res.characteristics[i].properties.notify&&res.characteristics[i].properties.indicate&&res.characteristics[i].properties.write) {
            index = i;
            break;
          }
        }
        if(index!=null) {
          that.setData({
            characteristicId: res.characteristics[index].uuid,
            serviceId: _serviceId
          })
          that.notifyBLECharacteristicValueChanged();
        } else {
          console.log("该服务不支持write:", e.currentTarget.id);        
        }
      }
    })
  },
  notifyBLECharacteristicValueChanged: function () {
    var that = this;    
    wx.notifyBLECharacteristicValueChanged({
      state: true, // 启用 notify 功能
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.serviceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.data.characteristicId,
      success: function (res) {
        console.log('notifyBLECharacteristicValueChanged success', res.errMsg)
      }
    })
  },
  recieveequ: function (e) {
    var that = this
    wx.onBLECharacteristicValueChange(function (characteristic) {
      console.log('characteristic value comed:')
      let buffer = characteristic.value
      let dataView = new DataView(buffer)
      console.log("接收字节长度:" + dataView.byteLength)
      console.log("接收:", ab2str(buffer))
      that.setData({
        recieve: ab2str(buffer)
      });
    })
    wx.readBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.serviceId,
      characteristicId: that.data.characteristicId,
      success: function (res) {
        console.log('readBLECharacteristicValue:')
        console.log(res)
      }
    })
  }
})
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
  // 19968-40869
  var buffer = new ArrayBuffer(str.length * 2+5)
  var dataView = new Uint8Array(buffer);
  const RESET = [27, 64];
  const HEIGHT = [29, 33, 1];
  let output = new encoding.TextEncoder("gb2312", { NONSTANDARD_allowLegacyEncoding: true }).encode(str);
  let uint8array = RESET.concat(HEIGHT)
  let uint8array1 = uint8array.concat(output)
  dataView.set(uint8array1, 0)
  
  console.log("dataView", dataView)
  console.log("buffer", buffer)
  return buffer;
}