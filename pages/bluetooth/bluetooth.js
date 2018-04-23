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

    // let buffer = new ArrayBuffer(1)
    // let dataView = new DataView(buffer)
    // dataView.setUint8(0, 6)
    let _value = str2ab(that.data.inputValue);
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.serviceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.data.characteristicId,
      // 这里的value是ArrayBuffer类型
      value: _value,
      // value: buffer,
      success: function (res) {
        console.log(res)
        console.log('writeBLECharacteristicValue success', ab2str(_value))
      }
    })
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
          if(res.characteristics[i].properties.write) {
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
      console.log(dataView.getUint8(0))
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
  var buf = new ArrayBuffer(str.length*4); // 4 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
// if(uniStr>=18868&&uniStr<=40869) {
//       //中文
//     }
