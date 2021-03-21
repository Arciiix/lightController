const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const sqlite = require("sqlite3").verbose();
let db = new sqlite.Database("./db.db", (err) => {
  if (err) {
    console.log(
      `[${parseDate(new Date())}] Eror while connecting to the db: ${err}`
    );
  } else {
    console.log(
      `[${parseDate(
        new Date()
      )}] App has connected to the database successfully`
    );
  }
});

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

app.use(express.static(path.join(__dirname, "build")));

const schedule = require("node-schedule");
let onSchedule, offSchedule, temperatureInterval;

const PORT = 5252;

//Default settings, the real settings are fetched from the JSON file
let options = {
  onTime: "8:00",
  offTime: "22:00",
  ip: "192.168.0.110",
  tableName: "temperature",
  temperatureInterval: 15, //In minutes,
  targetTemperature: 22,
  temperatureReserve: 1,
  heaterTableName: "heaterLogs",
};

let isOn = false;
let isHeaterOn = false;
let isControlledHeaterEnabled = true;
let currentTemperature = 0.0;
let lightLastChangeText = "Jeszcze nie przełączono!";
let heaterLastChangeText = "Jeszcze nie przełączono!";

//The UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/getData", async (req, res) => {
  let historyTemperatures = await fetchTheTable();
  let nextChangeText = getTheNextChange();
  res.send(
    JSON.stringify({
      isOn: isOn,
      currentTemperature: currentTemperature,
      historyTemperatures: historyTemperatures,
      nextChangeText: nextChangeText,
      lastChangeText: lightLastChangeText,
      settings: options,
      heaterLastChangeText: heaterLastChangeText,
      isHeating: isHeaterOn,
      isHeatControllerEnabled: isControlledHeaterEnabled,
    })
  );

  console.log(`[${parseDate(new Date())}] Sent the data`);
});

app.get("/updateSettings", (req, res) => {
  updateSettings(req.query);
});

app.get("/toogleLight", async (req, res) => {
  if (req.query.on == "true") {
    await toogleTheLight(true);
  } else {
    await toogleTheLight(false);
  }

  res.sendStatus(200);
});

app.get("/toogleHeater", async (req, res) => {
  if (req.query.on == "true") {
    await toogleTheHeater(true);
    await saveTheHeaterLogs(true);
  } else {
    await toogleTheHeater(false);
    await saveTheHeaterLogs(false);
  }

  res.sendStatus(200);
});

app.get("/toogleControlledHeater", (req, res) => {
  if (req.query.on == "true") {
    isControlledHeaterEnabled = true;
    console.log(`[${parseDate(new Date())}] Turned on the controlled heater`);
  } else {
    isControlledHeaterEnabled = false;
    toogleTheHeater(false);
    console.log(`[${parseDate(new Date())}] Turned off the controlled heater`);
  }

  res.sendStatus(200);
});

/*
FOR ESP EASY
app.get("/temperature", async (req, res) => {
  currentTemperature = parseFloat(req.query.value);
  console.log(
    `[${parseDate(new Date())}] Got new temperature: ${currentTemperature}`
  );
  res.sendStatus(200);
  await saveTempToDb(req.query.value);
});
*/

//For Tasmota
async function getTemperature() {
  let request = await fetch(`http://${options.ip}/cm?cmnd=Status%2010`);
  let data = await request.json();

  currentTemperature = parseFloat(data.StatusSNS.DS18B20.Temperature);
  console.log(
    `[${parseDate(new Date())}] Got new temperature: ${currentTemperature}`
  );

  saveTempToDb(currentTemperature);

  if (isControlledHeaterEnabled) {
    if (
      currentTemperature <
      parseFloat(options.targetTemperature) -
        parseFloat(options.temperatureReserve)
    ) {
      if (!isHeaterOn) {
        toogleTheHeater(true);
      } else {
        console.log(
          `[${parseDate(
            new Date()
          )}] The temperature is higher than the target one but the heater is already on`
        );
      }
    } else if (
      currentTemperature >
      parseFloat(options.targetTemperature) +
        parseFloat(options.temperatureReserve)
    ) {
      if (isHeaterOn) {
        toogleTheHeater(false);
      }
    }
  }
}

async function toogleTheHeater(isOn) {
  if (isOn) {
    //DEV
    //Turn the heater on and add a log to the database

    console.log(`[${parseDate(new Date())}] The heater has been turned on`);
    isHeaterOn = true;
  } else {
    //DEV
    //Turn the heater off and add a log to the database
    console.log(`[${parseDate(new Date())}] The heater has been turned off`);
    isHeaterOn = false;
  }
  //Update the lastChange
  let lastChange = parseDate(new Date());
  //Remove seconds from the lastChange string
  lastChange = lastChange.substring(0, lastChange.length - 3);
  heaterLastChangeText = `Ostatnie przełączenie: ${lastChange}`;
}

async function saveTheHeaterLogs(isOn) {
  return new Promise(async (resolve, reject) => {
    //Get the current time
    let currTime = new Date().getTime();
    //Calculate the expiration time
    let expirationTime = currTime + 604800000; //604800000 miliseconds are equal to 1 week
    //Save the log to the database
    let query = `INSERT INTO ${options.heaterTableName} (id, date, action, expires) VALUES (?, ?, ?, ?)`;
    //Add the row to the database
    await new Promise((resolve, reject) => {
      db.run(query, [null, currTime, isOn ? 1 : 0, expirationTime], (err) => {
        if (err) {
          console.log(
            `[${parseDate(
              new Date()
            )}] Error while trying to add a heater log (${
              isOn ? "on" : "off"
            }) to the database: ${err}`
          );
          reject(err);
        } else {
          console.log(
            `[${parseDate(new Date())}] Added a heater log (${
              isOn ? "on" : "off"
            }) to the table`
          );
          resolve();
        }
      });
    });
    deleteExpiredLogs();
  });
}

async function deleteExpiredLogs() {
  return new Promise(async (resolve, reject) => {
    //Get the current time
    let currTime = new Date().getTime();
    let query = `DELETE FROM ${options.heaterTableName} WHERE expires<?`;
    //Remove all of the expired entries
    await new Promise((resolve, reject) => {
      db.run(query, [currTime], (err) => {
        if (err) {
          console.log(
            `[${parseDate(
              new Date()
            )}] Error while trying to remove expired heater logs: ${err}`
          );
          reject(err);
        } else {
          console.log(`[${parseDate(new Date())}] Removed expired heater logs`);
          resolve();
        }
      });
    });
  });
}

async function fetchTheTable() {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM ${options.tableName}`;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.log(
          `[${parseDate(
            new Date()
          )}] Error while trying to fetch the table: ${err}`
        );
      } else {
        resolve(rows);
      }
    });
  });
}

async function toogleTheLight(shouldTurnOn) {
  if (shouldTurnOn) {
    await fetch(`http://${options.ip}/cm?cmnd=Power1%20On`);
    //Because the light sometimes doesn't go on after the first request, turn it off and on again after some time
    setTimeout(async () => {
      await fetch(`http://${options.ip}/cm?cmnd=Power1%20Off`);
      setTimeout(async () => {
        await fetch(`http://${options.ip}/cm?cmnd=Power1%20On`);
        console.log(`[${parseDate(new Date())}] Turned the light on`);
      }, 3000);
    }, 3000);
    isOn = "true";
  } else {
    await fetch(`http://${options.ip}/cm?cmnd=Power1%20Off`);
    console.log(`[${parseDate(new Date())}] Turned the light off`);
    isOn = "false";
  }

  //Update the lastChange
  let lastChange = parseDate(new Date());
  //Remove seconds from the lastChange string
  lastChange = lastChange.substring(0, lastChange.length - 3);
  lightLastChangeText = `Ostatnie przełączenie: ${lastChange}`;
}

function getTheNextChange() {
  let onTimeDate = parseStringToDate(options.onTime);
  let offTimeDate = parseStringToDate(options.offTime);

  let currentTimeDate = new Date(null);
  let now = new Date();
  currentTimeDate.setHours(now.getHours());
  currentTimeDate.setMinutes(now.getMinutes());

  if (currentTimeDate < onTimeDate) {
    let parsedOnTimeDate = parseDate(onTimeDate);
    //Remove seconds from this string
    parsedOnTimeDate = parsedOnTimeDate.substring(
      0,
      parsedOnTimeDate.length - 3
    );
    return `Włączenie o ${parsedOnTimeDate}`;
  } else if (offTimeDate > currentTimeDate && onTimeDate <= currentTimeDate) {
    let parsedOffTimeDate = parseDate(offTimeDate);
    //Remove seconds from this string
    parsedOffTimeDate = parsedOffTimeDate.substring(
      0,
      parsedOffTimeDate.length - 3
    );
    return `Wyłączenie o ${parsedOffTimeDate}`;
  } else if (offTimeDate <= currentTimeDate) {
    let parsedOnTimeDate = parseDate(onTimeDate);
    //Remove seconds from this string
    parsedOnTimeDate = parsedOnTimeDate.substring(
      0,
      parsedOnTimeDate.length - 3
    );
    return `Włączenie o ${parsedOnTimeDate}`;
  }
}

function parseTimeString(string) {
  let colonIndex = string.indexOf(":");
  let hours = string.substring(0, colonIndex);
  let minutes = string.substring(colonIndex + 1, string.length);
  return { hours: parseInt(hours), minutes: parseInt(minutes) };
}

function parseStringToDate(string) {
  let { hours, minutes } = parseTimeString(string);
  let date = new Date(null);
  date.setHours(hours);
  date.setMinutes(minutes);
  return date;
}

async function saveTempToDb(value) {
  return new Promise(async (resolve, reject) => {
    //Get the current time in HH:MM:SS format
    let currTime = parseDate(new Date());
    //Remove seconds from the time
    currTime = currTime.substring(0, currTime.length - 3);
    //Save the value to the database
    let query = `INSERT INTO ${options.tableName} (id, time, value) VALUES (?, ?, ?)`;
    //Add the row to the database
    await new Promise((resolve, reject) => {
      db.run(query, [null, currTime.toString(), parseFloat(value)], (err) => {
        if (err) {
          console.log(
            `[${parseDate(
              new Date()
            )}] Error while trying to add a row to the database: ${err}`
          );
          reject(err);
        } else {
          console.log(`[${parseDate(new Date())}] Added a row to the table`);
          resolve();
        }
      });
    });

    //If necessary, delete the first row from the database
    await deleteFirstRow();
  });
}

async function deleteFirstRow() {
  return new Promise(async (resolve, reject) => {
    //Check the count of rows, and if there are more rows than 280 (~3 days), delete the first of them
    let query = `SELECT COUNT(id) FROM ${options.tableName}`;

    let shouldOverwrite = await new Promise((resolve, reject) => {
      db.all(query, [], (err, data) => {
        if (err) {
          console.log(
            `[${parseDate(
              new Date()
            )}] Error while trying to delete the first row: ${err}`
          );
          reject(err);
        } else {
          if (data[0]["COUNT(id)"] > 280) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });

    if (shouldOverwrite) {
      //If the app should overwrite the table, delete the first row
      await db.run(
        `DELETE FROM ${options.tableName} WHERE id IN (SELECT id FROM ${options.tableName} LIMIT 1)`
      );
      console.log(
        `[${parseDate(new Date())}] Deleted the first row of the table`
      );
    }
  });
}

function getSettings() {
  return new Promise((resolve, reject) => {
    fs.readFile("./settings.json", (err, data) => {
      if (err) {
        console.log(
          `[${parseDate(
            new Date()
          )}] Error while trying to get the settings: ${err}`
        );
        reject();
      } else {
        options = JSON.parse(data);
        console.log(`[${parseDate(new Date())}] Fetched the settings`);
        resolve();
      }
    });
  });
}

function updateSettings(newSettings) {
  let newOptions = JSON.stringify({ ...options, ...newSettings });
  if (options === JSON.parse(newOptions)) return;
  options = JSON.parse(newOptions);
  fs.writeFile("./settings.json", newOptions, (err) => {
    if (err) {
      console.log(
        `[${parseDate(
          new Date()
        )}] Error while trying to update the settings: ${err}`
      );
    } else {
      console.log(`[${parseDate(new Date())}] Updated settings successfully`);

      //Reschedule the jobs
      //Parse the on and off time
      let parsedOnTime = parseTimeString(options.onTime);
      let parsedOffTime = parseTimeString(options.offTime);

      //Recreate the jobs (reschedule function doesn't work)
      schedule.cancelJob(onSchedule);
      schedule.cancelJob(offSchedule);
      scheduleJobs(parsedOnTime, parsedOffTime);

      //Recreate the interval
      clearInterval(temperatureInterval);
      temperatureInterval = setInterval(async () => {
        await getTemperature();
      }, options.temperatureInterval * 60000);
    }
  });
}

function parseDate(date) {
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

const server = app.listen(PORT, () => {
  console.log(`[${parseDate(new Date())}] App has started on port ${PORT}`);
});

function parseTimeToRule({ hours, minutes }) {
  let rule = new schedule.RecurrenceRule();
  rule.hour = hours;
  rule.minute = minutes;
  return rule;
}

function scheduleJobs(parsedOnTime, parsedOffTime) {
  onSchedule = schedule.scheduleJob(parseTimeToRule(parsedOnTime), async () => {
    console.log(`[${parseDate(new Date())}] Schedule:`);
    await toogleTheLight(true);
  });

  offSchedule = schedule.scheduleJob(
    parseTimeToRule(parsedOffTime),
    async () => {
      console.log(`[${parseDate(new Date())}] Schedule:`);
      await toogleTheLight(false);
    }
  );
}

async function init() {
  //Fetch the settings from the file
  await getSettings();
  //Schedule the on and off events

  //Parse the on and off time
  let parsedOnTime = parseTimeString(options.onTime);
  let parsedOffTime = parseTimeString(options.offTime);

  //Create the jobs
  scheduleJobs(parsedOnTime, parsedOffTime);

  //Create an interval for fetching the temperature and fetch it
  temperatureInterval = setInterval(async () => {
    await getTemperature();
  }, options.temperatureInterval * 60000);

  await getTemperature();
}

init();
