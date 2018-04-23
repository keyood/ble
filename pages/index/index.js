var app = getApp()
var temp = []
// var serviceId = "0000ffe0-0000-1000-8000-00805f9b34fb"
// var characteristicId = "0000ffe1-0000-1000-8000-00805f9b34fb"
var DEVICEID = "16B5FA16-612D-4871-840D-18051612107A";

//deviceId: "02:2E:DC:2C:80:3B", mac 地址
//uuid E7810A71-73AE-499D-8C15-FAA9AEF0C3F2
Page({
  data: {
    isbluetoothready: false,
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: false,
    loading: false,
    searchingstatus: false,
    receivedata: '',
    onreceiving: false,
    devices:[]
  },
  onLoad: function () {
    // var str = "A13";
    // // var code = str.charCodeAt();
    // console.log(str.length)
    // console.log(str.charAt(0))
    // wx.showToast({
    //     title: '连接成功',
    //     icon: 'success',
    //     duration: 2000
    // })
    // let buffer = new ArrayBuffer(16)
    // let dataView = new DataView(buffer)
    // dataView.setUint8(1, 6)
    //console.log(dataView.getUint8(1))
  },
  // ArrayBuffer转16进度字符串示例
  ab2hex: function (buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function(bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },
  clearData: function() {
    this.setData({
      devices: [],
      isbluetoothready: false,
      deviceconnected: false
    })
  },
  switchBlueTooth: function () {
    var that = this

    that.setData({
      isbluetoothready: !that.data.isbluetoothready,
    })

    if (that.data.isbluetoothready) {
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log("初始化蓝牙适配器成功")
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log("蓝牙适配器状态变化", res)
            that.setData({
              isbluetoothready: res.available,
              searchingstatus: res.discovering
            })
          })
          wx.onBluetoothDeviceFound(function (res) {
            let data = res;
            let dateIn = false;
            for(let i=0;i<temp.length;i++) {
              if(temp[i].deviceId==data.devices[0].deviceId) {
                dateIn = true;
                break;
              }
            }
            if(!dateIn) {
              console.log(data)
              temp.push(data.devices[0])
              that.setData({
                devices: temp
              })
              console.log('发现新蓝牙设备')
              console.log('设备id' + data.devices[0].deviceId)
              console.log('设备name' + data.devices[0].name)
            }
          })
          wx.onBLECharacteristicValueChange(function (characteristic) {
            console.log('characteristic value comed:')
            let buffer = characteristic.value
            let dataView = new DataView(buffer)
            console.log("接收字节长度:" + dataView.byteLength)
            var str = ""
            for (var i = 0; i < dataView.byteLength; i++) {
              str += String.fromCharCode(dataView.getUint8(i))
            }
            str=getNowFormatDate()+"收到数据:"+str;
            that.setData({
              receivedata: that.data.receivedata + "\n" + str,
              onreceiving: true
            })
          })
        },
        fail: function (res) {
          console.log("初始化蓝牙适配器失败")
          wx.showModal({
            title: '提示',
            content: '请检查手机蓝牙是否打开',
            success: function (res) {
              that.setData({
                isbluetoothready: false,
                searchingstatus: false
              })
            }
          })
        }
      })
    } else {
      temp = []
      //先关闭设备连接
      wx.closeBLEConnection({
        deviceId: that.data.connectedDeviceId,
        complete: function (res) {
          console.log(res)
          that.setData({
            deviceconnected: false,
            connectedDeviceId: ""
          })
        }
      })
      wx.closeBluetoothAdapter({
        success: function (res) {
          console.log(res)
          that.setData({
            isbluetoothready: false,
            deviceconnected: false,
            devices: [],
            searchingstatus: false,
            receivedata: ''
          })
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '请检查手机蓝牙是否打开',
            success: function (res) {
              that.setData({
                isbluetoothready: false
              })
            }
          })
        }
      })
    }
  },
  searchbluetooth: function () {
    temp = []
    var that = this
    if (!that.data.searchingstatus) {
      var that = this
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("开始搜索附近蓝牙设备")
          console.log(res)
          that.setData({
            searchingstatus: !that.data.searchingstatus
          })
        }
      })
    } else {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("停止蓝牙搜索")
          console.log(res)
        }
      })
    }
  },
  stopsSearchbluetooth: function() {
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("停止蓝牙搜索")
        console.log(res)
      }
    })
  },
  getBLEDeviceServices(e) {
    let that = this;
    wx.showLoading({
      title: '获取Services设备中...',
    })
    console.log("获取Services设备 ", e.currentTarget.id)
    let _index = e.currentTarget.dataset.index;
    console.log(_index)
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: e.currentTarget.id,
      success: function (res) {
        wx.hideLoading();
        console.log('device services:', res.services)
        temp[_index].services = res.services;
        console.log(temp)
        that.setData({
          devices: temp
        })
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: '获取Services失败',
          icon: 'success',
          duration: 1000
        })
        console.log("获取Services失败")
        console.log(res)
      }
    })
  },
  connectTO: function (e) {
    var that = this

    if (that.data.deviceconnected) {
      wx.notifyBLECharacteristicValueChanged({
        state: false, // 停用notify 功能
        deviceId: that.data.connectedDeviceId,
        serviceId: serviceId,
        characteristicId: characteristicId,
        success: function (res) {
          console.log("停用notify 功能")
        }
      })
      wx.closeBLEConnection({
        deviceId: e.currentTarget.id,
        complete: function (res) {
          console.log("断开设备")
          console.log(res)
          that.setData({
            deviceconnected: false,
            connectedDeviceId: "",
            receivedata: ""
          })
        }
      })
    } else {
      wx.showLoading({
        title: '连接蓝牙设备中...',
      })
      wx.createBLEConnection({
        deviceId: e.currentTarget.id,
        success: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '连接成功',
            icon: 'success',
            duration: 1000
          })
          console.log("连接设备成功")
          console.log(res)
          that.setData({
            deviceconnected: true,
            connectedDeviceId: e.currentTarget.id
          })
          wx.notifyBLECharacteristicValueChanged({
            state: true, // 启用 notify 功能
            deviceId: that.data.connectedDeviceId,
            serviceId: serviceId,
            characteristicId: characteristicId,
            success: function (res) {
              console.log("启用notify")
            }
          })
        },
        fail: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '连接设备失败',
            icon: 'success',
            duration: 1000
          })
          console.log("连接设备失败", res)
          that.setData({
            connected: false
          })
        }
      })
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("停止蓝牙搜索")
          console.log(res)
        }
      })
    }
  },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value.senddata)
    var senddata = e.detail.value.senddata;
    var that = this
    let buffer = new ArrayBuffer(senddata.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < senddata.length; i++) {
      dataView.setUint8(i, senddata.charAt(i).charCodeAt())
    }
    wx.writeBLECharacteristicValue({
      deviceId: that.data.connectedDeviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: buffer,
      success: function (res) {
        console.log(res)
        console.log('writeBLECharacteristicValue success', res.errMsg)
      }
    })
  },
  formReset: function () {
    console.log('form发生了reset事件')
  }
})



function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + date.getHours() + seperator2 + date.getMinutes()
    + seperator2 + date.getSeconds();
  return currentdate;
}