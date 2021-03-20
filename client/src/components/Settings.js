import React from "react";
import "../styles/Settings.css";
import {
  BottomNavigation,
  BottomNavigationAction,
  TextField,
  Button,
} from "@material-ui/core";

import { MdHome, MdInsertChart, MdSettings } from "react-icons/md";

//DEV
//const serverIp = "";
const serverIp = "http://192.168.0.107:5252";

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onTime: "",
      offTime: "",
      ip: "",
      temperatureInterval: "",
      targetTemperature: "",
      temperatureReserve: "",
      errors: {
        onTime: false,
        offTime: false,
        ip: false,
        temperatureInterval: false,
        targetTemperature: false,
        temperatureReserve: false,
      },
    };
  }
  componentDidMount() {
    this.setState(this.props.currentSettings);
  }
  handleInputChange(fieldName, e) {
    let value = e.target.value;
    let state = this.state;
    state[fieldName] = value;
    this.setState(state);
  }

  async updateSettings() {
    if (!this.validate(this.state)) return;
    let request = await fetch(
      `${serverIp}/updateSettings?onTime=${this.state.onTime}&offTime=${this.state.offTime}&ip=${this.state.ip}&temperatureInterval=${this.state.temperatureInterval}&targetTemperature=${this.state.targetTemperature}&temperatureReserve=${this.state.temperatureReserve}`
    );
    this.setState({
      onTime: "",
      offTime: "",
      ip: "",
      temperatureInterval: "",
      targetTemperature: "",
      temperatureReserve: "",
    });
  }

  validate({
    onTime,
    offTime,
    ip,
    temperatureInterval,
    targetTemperature,
    temperatureReserve,
  }) {
    //Get the state and get the values of all of the inputs
    let errors = this.state.errors;

    //Regular expression for validation
    let regExpTime = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    let regExpIp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

    //Replace the error object with the new one (while validating)
    errors = this.matchTheRegExp(onTime, regExpTime, "onTime", errors);
    errors = this.matchTheRegExp(offTime, regExpTime, "offTime", errors);
    errors = this.matchTheRegExp(ip, regExpIp, "ip", errors);
    errors.temperatureInterval =
      !isNaN(temperatureInterval) &&
      parseInt(temperatureInterval) == temperatureInterval &&
      temperatureInterval != 0
        ? false
        : true;

    errors.targetTemperature = !(
      !isNaN(targetTemperature) && targetTemperature > 0
    );

    errors.temperatureReserve = !(
      !isNaN(temperatureReserve) && temperatureReserve > 0
    );

    //Update the error object globally, and if there's an error, return false, otherwise - return true
    this.setState({ errors: errors });

    let isValid = true;
    for (let item in errors) {
      if (errors[item]) isValid = false;
    }
    return isValid;
  }

  matchTheRegExp(value, regExp, fieldName, errorObject) {
    errorObject[fieldName] = !regExp.test(value) ? true : false;
    return errorObject;
  }

  render() {
    return (
      <div className="settingsContainer">
        <span className="header">Ustawienia</span>
        <div className="fields">
          <div className="fieldDiv">
            <TextField
              label="Godzina włączania"
              className={"field"}
              onChange={this.handleInputChange.bind(this)}
              placeholder={"8:00"}
              value={this.state.onTime}
              onChange={this.handleInputChange.bind(this, "onTime")}
              error={this.state.errors.onTime}
              required
            />
          </div>
          <div className="fieldDiv">
            <TextField
              label="Godzina wyłączania"
              className={"field"}
              placeholder={"22:00"}
              value={this.state.offTime}
              onChange={this.handleInputChange.bind(this, "offTime")}
              error={this.state.errors.offTime}
              required
            />
          </div>
          <div className="fieldDiv">
            <TextField
              label="IP"
              className={"field"}
              placeholder={"192.168.0.110"}
              value={this.state.ip}
              onChange={this.handleInputChange.bind(this, "ip")}
              error={this.state.errors.ip}
              required
            />
          </div>
          <div className="fieldDiv">
            <TextField
              label="Interwał odczytów"
              className={"field"}
              placeholder={"15"}
              value={this.state.temperatureInterval}
              onChange={this.handleInputChange.bind(
                this,
                "temperatureInterval"
              )}
              error={this.state.errors.temperatureInterval}
              required
            />
          </div>
          <div className="fieldDiv">
            <TextField
              label="Target temp. [°C]"
              className={"field"}
              placeholder={"21"}
              value={this.state.targetTemperature}
              onChange={this.handleInputChange.bind(this, "targetTemperature")}
              error={this.state.errors.targetTemperature}
              required
            />
          </div>
          <div className="fieldDiv">
            <TextField
              label="Zapas temp. [°C] (1-5)"
              className={"field"}
              placeholder={"2"}
              value={this.state.temperatureReserve}
              onChange={this.handleInputChange.bind(this, "temperatureReserve")}
              error={this.state.errors.temperatureReserve}
              required
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={this.updateSettings.bind(this)}
          >
            Zapisz
          </Button>
        </div>
        <div className="navbar">
          <BottomNavigation
            style={{ backgroundColor: "#111413" }}
            value={"Settings"}
            onChange={this.props.onNavigationStateChange.bind(this.props.that)}
          >
            <BottomNavigationAction
              style={{ color: "white" }}
              label="Główna"
              value="Home"
              icon={<MdHome size={40} color={"white"} />}
            />
            <BottomNavigationAction
              style={{ color: "white" }}
              label="Wykres"
              value="Chart"
              icon={<MdInsertChart size={40} color={"white"} />}
            />
            <BottomNavigationAction
              style={{ color: "white" }}
              label="Ustawienia"
              value="Settings"
              icon={<MdSettings size={40} color={"white"} />}
            />
          </BottomNavigation>
        </div>
      </div>
    );
  }
}

export default Settings;
