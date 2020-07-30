const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const PORT = 5252;
let options = {
  onTime: "8:00",
  offTime: "22:00",
  ip: "192.168.0.110",
};

let isOn = false;
let currentTemperature;
let nextChangeText = "";
let lastChangeText = "Jeszcze nie przełączono!";

app.get("/temperature", (req, res) => {
  currentTemperature = parseFloat(req.query.value);
  console.log(
    `[${parseDate(new Date())}] Got new temperature: ${currentTemperature}`
  );
  res.sendStatus(200);
});

app.get("/getData", (req, res) => {
  //DEV
  currentTemperature = 25.2;
  let historyTemperatures = [
    { time: "12:35", value: 23 },
    { time: "12:40", value: 25 },
    { time: "12:45", value: 25 },
    { time: "12:50", value: 21 },
    { time: "12:55", value: 23.5 },
  ];

  res.send(
    JSON.stringify({
      isOn: isOn,
      currentTemperature: currentTemperature,
      historyTemperatures: historyTemperatures,
      nextChangeText: nextChangeText,
      lastChangeText: lastChangeText,
      settings: options,
    })
  );

  console.log(`[${parseDate(new Date())}] Sent the data`);
});

app.get("/toogleLight", async (req, res) => {
  if (req.query.on == "true") {
    //DEV
    //Turn on the light
    console.log(`[${parseDate(new Date())}] Turned the light on`);
  } else {
    //DEV
    //Turn off the light
    console.log(`[${parseDate(new Date())}] Turned the light off`);
  }

  let lastChange = parseDate(new Date());
  //Remove seconds from the lastChange string
  lastChange = lastChange.substring(0, lastChange.length - 3);

  lastChangeText = `Ostatnie przełączenie: ${lastChange}`;

  isOn = req.query.on;
  res.sendStatus(200);
});

function parseDate(date) {
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

const server = app.listen(PORT, () => {
  console.log(`[${parseDate(new Date())}] App has started on port ${PORT}`);
});
