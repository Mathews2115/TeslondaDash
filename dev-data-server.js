// CRUDE ADD DEV TEST DATA SERVER THING - I just copy and paste shit into here.
// by no means is this production ready, good lord no


const inputVMax = 404;         // Input voltage (traction power)	240-404V DC (Limits configurable)
const inputVLogicMax = 16;     // Input voltage (logic)	10.5-16V DC
const inputALogicMax = 5;      // Input current (logic)	< 5A (max) (10A fuse suggested)
const inputCurrentMax = 1150;  // Input current (HV, peak)	1150A DC
const inputPowerMax = 400;        // Input power (peak)	400 kW (536 HP)
const p2w = '1.842 HP per lb'; // Power to weight (peak)
const rpmMax = 15200;          // Motor speed (max)	15,200 RPM
const torqueMax = 600;         // Torque (peak output)	600 Nm (~443 ft/lb)
const torqueRegenMax = 110;    // Torque (regenerative braking, peak)	110 Nm
const regenMax = 70;           // Output power (regenerative braking, peak)	70 kW
const regenAMax = 250;         // Output current (regenerative braking, peak)	250A
const inputPowerContinous = 35;// Input power (continuous)	35 kW (approximate)
const inputPower15min = 90;    // Input power (15 minute)	90 kW (approximate)

const HERTZ = []
HERTZ['100'] = 10;
HERTZ['10'] = 100;
HERTZ['1'] = 1000;

const express = require('express'),
  app = express(),
  server = require('http').createServer(app);
io = require('socket.io')(server);

let timerId = null,
  powerTimerId = null,
  speedTimerId = null,
  maxPowerTimerId = null,
  limitsId = null,
  generalStatesId = null,
  tempDataID = null,
  maxTempDataID = null,
  voltageDataID = null,
  pedalID = null,

  db = Array(10000),
  keys = new Set(),
  sockets = new Set();

const max_temp = 200;

app.use(express.static(__dirname + '/dist'));

io.on('connection', socket => {
  sockets.add(socket);
  console.log(`Socket ${socket.id} added`);
  if (!timerId) {
    startPacketSending();
  }

  socket.on('hsr-update', data => {
    console.log(data);
  });


  socket.on('disconnect', () => {
    console.log(`Deleting socket: ${socket.id}`);
    sockets.delete(socket);
    console.log(`Remaining sockets: ${sockets.size}`);
    if (!sockets.size) {
      clearInterval(timerId);
      timerId = null;
    }
  });

});

function sendFakeCANMsg(id, data) {
  data = Buffer.from(data);
  db[id] = data
  if (!keys.has(id)) keys.add(id)
}

function startPacketSending() {
  timerId = setInterval(() => {
    // data we will be sending up - it will be combined into a single packet
    let buffers = [];

    //  total length of packet
    let totalLength = 0;

    // get all the datas!
    keys.forEach((key, value, set) => {
      const buf = Buffer.allocUnsafe(3 + Buffer.byteLength(db[key]));

      // can ID
      buf.writeUInt16BE(key, 0);

      // can length
      buf.writeUInt8(Buffer.byteLength(db[key]), 2);

      // copy can data
      db[key].copy(buf, 3, 0);


      buffers.push(buf);
      totalLength += buf.length;
    })

    let packet = Buffer.concat(buffers, totalLength);
    keys.clear();

    // send that shit up to anyone connected to us
    for (const s of sockets) {
      s.emit('update', packet);
    }

  }, 16);
}

// HSR_torquePowerData
// ● Default CAN ID: 0x116
// ● Default frequency: 100 Hz
// ● Length: 4 bytes
function startTorqueTest() {
  const offset = 4;
  let storedPower = 0;
  let adjustValue = 1;
  let count = 0;
  // prepare data
  var buffer = new ArrayBuffer(4);
  var canData = new DataView(buffer);

  powerTimerId = setInterval(() => {

    canData.setUint16(0, (666*offset) );  // torque
    canData.setUint16(2, (storedPower*offset) ); // voltage

    // send data
    sendFakeCANMsg(0x116, canData.buffer);


    // adjust value
    if (count <= 0) {
      storedPower = storedPower + adjustValue;
      if (storedPower >= inputPowerMax) {
        storedPower = inputPowerMax
        adjustValue = -1
      } else if (storedPower <= -regenMax) {
        storedPower = -regenMax
        adjustValue = 1
      }
      count = getRandomInt(1,5); // change value every half a second
    }
    count--;

  }, HERTZ['100']);
}

/** HSR_speedData
● Default CAN ID: 0x115
● Default frequency: 100 Hz
● Length: 6 bytes
● Data:
*/
function startSpeedTest() {
  let speed = 0;
  let motorRPM = 0
  let maxPower = 95;
  let maxRPM = 15200;
  let adj = 1;
  let rpmAdj = 1;
  let count = HERTZ['100'];

  // prepare data
  var buffer = new ArrayBuffer(6);
  var canData = new DataView(buffer);

  speedTimerId = setInterval(() => {
    canData.setUint16(0, (motorRPM) );  // motorRPM
    canData.setUint16(2, (speed*10) ); // Calculated Vechicle Speed (MPH)
    canData.setUint16(4, (speed*10) ); // Tesla firmware provided Vehicle Speed (MPH)

    // send data
    sendFakeCANMsg(0x115, buffer);

    if (count <= 0) {
      count = HERTZ['100'];
      adj = getAdj(0, maxPower, speed, 1, 2, adj);
      speed = Math.max(Math.min(speed + adj, maxPower), 0);

    }
    rpmAdj = getAdj(0, maxRPM, motorRPM, 1, 8, rpmAdj);
    motorRPM = Math.max(Math.min(motorRPM + rpmAdj, 15200), 0);
    count--;
  }, HERTZ['100']);
}

/**
 * HSR_powerData
● Default CAN ID: 0x120
● Default frequency: 1 Hz
● Length: 8 bytes
 */
function startmaxPowerTest() {
      // prepare data
  var buffer = new ArrayBuffer(8);
  var canData = new DataView(buffer);
  canData.setUint16(0, (250*10) );  /** Max HV charge/regen current (amps) */
  canData.setUint16(2, (1150*10) ); /** Max HV discharge current (amps) */
  canData.setUint16(4, (70*10) ); /** Max HV charge/regen power (kW) */
  canData.setUint16(6, (400*10) ); /** Max HV discharge power (kW) */

  maxPowerTimerId= setInterval(() => {
    // send data
    sendFakeCANMsg(0x120, buffer);

  }, HERTZ['1']);
}

// pedalID
function startPedalTest() {
    // prepare data
  var buffer = new ArrayBuffer(3);
  var canData = new DataView(buffer);
  const UPDATE = HERTZ['10'];
  let pedal = 0;
  let tAdj = getAdj(0, 250, 100, 1, 5, 0);
  let count = 0;

  canData.setUint8(0, (250*10) );
  canData.setUint8(1, (1150*10) );
  canData.setUint8(2, (70*10) );

  pedalID = setInterval(() => {
    if (count == 0) {
      count = getRandomInt(1,10);
      // adjust value
      tAdj = getAdj(0, 250, pedal, 1, 5, tAdj);
      pedal = Math.max(Math.min(pedal + tAdj, 250), 0);

      // set data
      canData.setUint8(0, pedal);
      canData.setUint8(1, 250);
      canData.setUint8(2, 250);
    }
    count--;

    // send data
    sendFakeCANMsg(0x125, buffer);
  }, HERTZ['1']);
}

/**
 * HSR_torqueLimits
● Default CAN ID: 0x122
● Default frequency: 10 Hz
● Length: 3 bytes
 */
function startLimitsTest() {
  const UPDATE = HERTZ['10'];
  let torqueLimit = 0;
  let regenLimit = 0;
  let tAdj = getAdj(0, 250, 100, 1, 5, 0);
  let lAdj = getAdj(0, 250, 100, 1, 5, 0);
  let count = 0;

  // prepare data
  var buffer = new ArrayBuffer(3);
  var canData = new DataView(buffer);

  limitsId = setInterval(() => {

    if (count == 0) {
      count = getRandomInt(1,10);
      // adjust value
      tAdj = getAdj(0, 250, torqueLimit, 1, 5, tAdj);
      lAdj = getAdj(0, 250, regenLimit, 1, 5, lAdj);
      torqueLimit = Math.max(Math.min(torqueLimit + tAdj, 250), 0);
      regenLimit = Math.max(Math.min(regenLimit + lAdj, 250), 0);

      // set data
      canData.setUint8(2, Math.random() >= 0.5); /**  HSR Crude Traction Control Enabled */
      canData.setUint8(0, regenLimit);  /** Regen Torque Percent */
      canData.setUint8(1, torqueLimit); /** Output Torque Percent */
    }
    count--;

    // send data
    sendFakeCANMsg(0x122, buffer);

  }, UPDATE);
}

/**
 * HSR_generalStates
● Default CAN ID: 0x117
● Default frequency: 100 Hz
● Length: 8 bytes
*/
function startGeneralStatesTest(){
  let time = 0;
  // prepare data
  var buffer = new ArrayBuffer(8);
  var canData = new DataView(buffer);

  generalStatesId= setInterval(() => {

    // ugly crude way of only updating once every so often
    // - keep actual sending at 10hz but visually only change stuff every second or so
    if (time === 0) {
      canData.setUint8(0,0);  // raw input
      canData.setUint8(1,0);  // raw output
      canData.setUint8(2, Math.random() >= 0.5);  // brake light
      canData.setUint8(3,0);  // rev light
      canData.setUint8(4,);  // reg brake over brake light threshold
      canData.setUint8(5,Math.random() >= 0.5);  // brake pedal pressed
      canData.setUint8(6,Math.random() >= 0.5);  // trq creep enabled
      canData.setUint8(7, getRandomInt(1,4));  // current accepted gear
      time = HERTZ['100'] * 10;
    }
    time--;

    sendFakeCANMsg(0x117, buffer);
  }, HERTZ['100']);
}

/**
 * HSR_DI_temperature
● Default CAN ID: 0x506
● Default frequency: 1 Hz
● Length: 8 bytes
*/
function startTempDataTest() {
  let invertorTemp = 100;
  let statorTemp = 100;
  let inlet = 128;
  let staPct = 100;
  let invPct = 100;
  let tempAdj = 5;

  // prepare data
  var buffer = new ArrayBuffer(8);
  var canData = new DataView(buffer);

  tempDataID = setInterval(() => {
    canData.setUint8(0, 0);  // pcb
    canData.setUint8(1, Math.max(invertorTemp+40, 0));  // invertor
    canData.setUint8(2, Math.max(statorTemp+40, 0));  // stator
    canData.setUint8(3, 0);  // dccap
    canData.setUint8(4, 0);  // heatsink
    canData.setUint8(5, Math.max(inlet+40, 0));  // inlet
    canData.setUint8(6, Math.round(invPct / 0.4));  // inv pct
    canData.setUint8(7, Math.round(staPct / 0.4));  // stator pct

    // adjust value
    tempAdj = getAdj(0, max_temp, invertorTemp, 0.1, 2, tempAdj);

    // set values
    invertorTemp = Math.max(Math.min(invertorTemp + tempAdj, max_temp), 0);
    statorTemp = invertorTemp;
    inlet = invertorTemp;
    invPct = (invertorTemp / max_temp) * 100;
    staPct = invPct

    // send data
    sendFakeCANMsg(0x506, buffer);

  }, HERTZ['1']);
}

/**
 * HSR_DI_maxT
● Default CAN ID: 0x516
● Default frequency: 1 Hz
● Length: 5 bytes
 */
function startMaxTempData() {
  // prepare data
  var buffer = new ArrayBuffer(5);
  var canData = new DataView(buffer);
  var time = 1;
  canData.setUint8(1, max_temp+40);            // SG_DI_inverterTMax - Degrees in C
  canData.setUint8(2, max_temp+40);            // SG_DI_statorTMax - Degrees in C
  canData.setUint8(3, max_temp+40);            // SG_DI_dcCapTMax - Degrees in C
  canData.setUint8(4, max_temp+40);            // SG_DI_pcbTMax - Degrees in C

  maxTempDataID= setInterval(() => {
    if (time <= 0) {
      const newValue = Math.random() >= 0.5 ?  127 : 255;
      canData.setUint8(0, newValue);            // SG_DI_noFlowNeeded / inletPassiveTarget
      time = 5;
    }
    time--;

    // console.log(newValue);
    // send data
    sendFakeCANMsg(0x516, buffer);
  }, HERTZ['1']);
}

/**
 * HSR_HVLVdata
● Default CAN ID: 0x119
● Default frequency: 100 Hz
● Length: 5 bytes
 */
function startVoltTest() {
  let hvVolt = {
    adj: 1,
    value: 400
  };
  let hvAmp = {
    adj: 4,
    value: 800
  };
  let hv12v = {
    adj: 0.1,
    value: 9
  };
  let time = 0;

  // prepare data
  var buffer = new ArrayBuffer(5);
  var canData = new DataView(buffer);

  voltageDataID = setInterval(() => {

    if (time === 0) {
      time = 10;
      // adjust value
      hvVolt = updateValue(0, inputVMax, hvVolt.value, hvVolt.adj);
      hvAmp = updateValue(-regenAMax, inputCurrentMax, hvAmp.value, hvAmp.adj);
      hv12v = updateValue(8, 16, hv12v.value, hv12v.adj);

      canData.setUint16(0, (hvVolt.value*8.0) ) // High voltage input voltage * 8.0 (Volts)
      canData.setInt16(2, (hvAmp.value*8.0) )   // High voltage current estimate * 8.0 (Amps)
      canData.setUint8(4, (hv12v.value*8.0) )   // 12V input voltage * 8.0 (Volts)
    }
    time--;

    // send data
    sendFakeCANMsg(0X119, buffer);
  }, HERTZ['100']);
}

/////////////////////////////////
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function getAdj(min, max, current, randomStart, randomEnd, adjustValue) {
  if (current >= max) {
    adjustValue = -getRandomInt(randomStart,randomEnd); // go backwards
  } else if (current <= min) {
    adjustValue = getRandomInt(randomStart,randomEnd);  // go forwards
  }
  return adjustValue;
}

function updateValue(min, max, current, adj) {
  current += adj;
  if (current > max) {
    current = max;
    adj = -adj; // go backwards
  } else if (current < min) {
    current = min;
    adj = -adj;  // go forwards
  }
  return {value: current, adj: adj};
}


startTorqueTest();
startSpeedTest();
startmaxPowerTest();
startGeneralStatesTest();
startLimitsTest();
startTempDataTest();
startMaxTempData();
startVoltTest();
startPedalTest();

server.listen(4000);
console.log('Socket Server on 4000');
