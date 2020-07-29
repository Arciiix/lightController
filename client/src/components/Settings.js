import React from "react";
import "../styles/Settings.css";
import {
  BottomNavigation,
  BottomNavigationAction,
  TextField,
  Button,
} from "@material-ui/core";

import {
  AiOutlineHome,
  AiOutlineBarChart,
  AiOutlineSetting,
} from "react-icons/ai";

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onTime: "",
      offTime: "",
      ip: "",
      defaultOnTime: "8:00", //DEV - should fetch the current value
      defaultOffTime: "22:00", //DEV - should fetch the current value
      defaultIp: "192.168.0.110", //DEV - should fetch the current value
    };
  }
  handleInputChange(fieldName, e) {
    let value = e.target.value;
    let state = this.state;
    state[fieldName] = value;
    this.setState(state);
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
              placeholder={this.state.defaultOnTime}
              value={this.state.onTime}
              onChange={this.handleInputChange.bind(this, "onTime")}
            />
          </div>
          <div className="fieldDiv">
            <TextField
              label="Godzina wyłączania"
              className={"field"}
              placeholder={this.state.defaultOffTime}
              value={this.state.offTime}
              onChange={this.handleInputChange.bind(this, "offTime")}
            />
          </div>
          <div className="fieldDiv">
            <TextField
              label="IP"
              className={"field"}
              placeholder={this.state.defaultIp}
              value={this.state.ip}
              onChange={this.handleInputChange.bind(this, "ip")}
            />
          </div>
          <Button variant="contained" color="primary" size="large">
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
              icon={<AiOutlineHome size={40} color={"white"} />}
            />
            <BottomNavigationAction
              style={{ color: "white" }}
              label="Wykres"
              value="Chart"
              icon={<AiOutlineBarChart size={40} color={"white"} />}
            />
            <BottomNavigationAction
              style={{ color: "white" }}
              label="Ustawienia"
              value="Settings"
              icon={<AiOutlineSetting size={40} color={"white"} />}
            />
          </BottomNavigation>
        </div>
      </div>
    );
  }
}

export default Settings;
