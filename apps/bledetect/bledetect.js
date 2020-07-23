let menu = {
  "": { "title": "BLE Detector" },
  "RE-SCAN":  () => scan()
};

function showMainMenu() {
  menu["< Back"] =  () => load();
  return E.showMenu(menu);
}

function showDeviceInfo(device){
  const deviceMenu = {
    "": { "title": "Device Info" },
    "name": {
      value: device.name
    },
    "rssi": {
      value: device.rssi
    },
    "manufacturer": {
      value: device.manufacturer
    },
    "data": {
      value: "No Data"
    }
  };

  deviceMenu[device.id] = () => {};
  deviceMenu["< Back"] =  () => showMainMenu();
  deviceMenu["Connect"] = () => connectBB8(device.id);
  deviceMenu["Disconnect"] = () => disconnectBB8();
  return E.showMenu(deviceMenu);
}

function disconnectBB8() {
  NRF.Disconnect();
}

function connectBB8(device_address) {
  let device;
  NRF.connect(device_address).then(function(d) {
    device = d;
    return d.getPrimaryService("22bb746f2ba075542d6f726568705327");
  }).then(function(s) {
    console.log("Service ",s);
    return s.getCharacteristic("22bb746f2ba175542d6f726568705327");
  }).then(function(c) {
    let roll = 0x30;
    let preamble = [0xFF,0xFF,device,roll,0x00];
    let data = [0x88, 0x10,0x01];
    let dlen = data.length+1;
    let checksum = 0x00;
    preamble.concat(dlen).concat(data);
    //make checksum
    checksum = checksum(preamble);
    preamble.push(checksum);
    return c.writeValue(preamble);
  }).then(function(d) {
    setTimeout(function() {device.disconnect(); },4000);
  }).catch(function() {
    console.log("Something's broken.");
  });
}

function checksum(data) {
  var isBuffer = Buffer.isBuffer(data),
      value = 0x00;

  for (var i = 0; i < data.length; i++) {
    value += isBuffer ? data.readUInt8(i) : data[i];
  }

  return (value % 256) ^ 0xFF;
}

/*
Adaptor.BLEService = "22bb746f2bb075542d6f726568705327";
Adaptor.WakeCharacteristic = "22bb746f2bbf75542d6f726568705327";
Adaptor.TXPowerCharacteristic = "22bb746f2bb275542d6f726568705327";
Adaptor.AntiDosCharacteristic = "22bb746f2bbd75542d6f726568705327";
Adaptor.RobotControlService = "22bb746f2ba075542d6f726568705327";
Adaptor.CommandsCharacteristic = "22bb746f2ba175542d6f726568705327";
Adaptor.ResponseCharacteristic = "22bb746f2ba675542d6f726568705327";
*/

function scan() {
  menu = {
    "": { "title": "BLE Detector" },
    "RE-SCAN":  () => scan()
  };

  waitMessage();

  NRF.findDevices(devices => {
    devices.forEach(device =>{
      let deviceName = device.id.substring(0,17);

      if (device.name) {
        deviceName = device.name;
      }

      menu[deviceName] = () => showDeviceInfo(device);
    });
    showMainMenu(menu);
  }, { active: true });
}

function waitMessage() {
  E.showMenu();
  E.showMessage("scanning");
}

scan();
waitMessage();