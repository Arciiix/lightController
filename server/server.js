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
const { isBuffer } = require("util");

const PORT = 5252;

//Default settings, the real settings are fetched from the JSON file
let options = {
  onTime: "8:00",
  offTime: "22:00",
  ip: "192.168.0.110",
  tableName: "temperature",
};

let isOn = false;
let currentTemperature = 0.0;
let lastChangeText = "Jeszcze nie przełączono!";

app.get("/temperature", async (req, res) => {
  currentTemperature = parseFloat(req.query.value);
  console.log(
    `[${parseDate(new Date())}] Got new temperature: ${currentTemperature}`
  );
  res.sendStatus(200);
  await saveTempToDb(req.query.value);
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
      lastChangeText: lastChangeText,
      settings: options,
    })
  );

  console.log(`[${parseDate(new Date())}] Sent the data`);
});

app.get("/updateSettings", (req, res) => {
  updateSettings(req.query);
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

function parseStringToDate(string) {
  let colonIndex = string.indexOf(":");
  let hours = string.substring(0, colonIndex);
  let minutes = string.substring(colonIndex + 1, string.length);

  let date = new Date(null);
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
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
  fs.readFile("./settings.json", (err, data) => {
    if (err) {
      console.log(
        `[${parseDate(
          new Date()
        )}] Error while trying to get the settings: ${err}`
      );
    } else {
      options = JSON.parse(data);
      console.log(`[${parseDate(new Date())}] Fetched the settings`);
    }
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
    }
  });
}

function parseDate(date) {
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

const server = app.listen(PORT, () => {
  console.log(`[${parseDate(new Date())}] App has started on port ${PORT}`);
});

//Fetch the settings from the file
getSettings();
