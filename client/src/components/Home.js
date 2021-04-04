import React from "react";
import Switch from "react-switch";
import {
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
} from "@material-ui/core";
import {
  MdHome,
  MdInsertChart,
  MdSettings,
  MdLightbulbOutline,
  MdTrendingUp,
  MdExpandLess,
  MdFlashOn,
} from "react-icons/md";
import "../styles/Home.css";
import "../styles/Chart.css";

import CurrentChart from "./CurrentChart";
import HistoryChart from "./HistoryChart";
import Settings from "./Settings";

const serverIp = "";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      isOn: false,
      disabled: false,
      currentTemperature: 0,
      historyTemperatures: [],
      currentPage: "Home",
      nextChangeText: "",
      lastChangeText: "Jeszcze nie przełączono!",
      heaterLastChangeText: "Jeszcze nie przełączono!",
      isHeatControllerEnabled: false,
      isHeating: false,
      heaterLogs: [],
      settings: {
        onTime: "",
        offTime: "",
        ip: "",
        temperatureInterval: "",
        targetTemperature: "",
        temperatureReserve: "",
      },
    };
  }

  async componentDidMount() {
    let request = await fetch(`${serverIp}/getData`);

    if (request.status === 200) {
      let dataObj = await request.json();

      //isOn is stored by string, so I parse it into the boolean
      if (dataObj.isOn === "true") {
        dataObj.isOn = true;
      } else {
        dataObj.isOn = false;
      }
      console.log(dataObj.isHeating);
      this.setState({ isLoaded: true, ...dataObj }, this.forceUpdate);
    }
  }

  navigationChange(event, newValue) {
    this.setState({ currentPage: newValue });
  }

  async toogleLight(e) {
    this.setState({ isOn: e, disabled: e });
    await fetch(`${serverIp}/toogleLight?on=${e}`);

    //If user turns on the light, wait for 6 seconds (6,5 due the delay), because sometimes light doesn't turn off by first request, so server makes 2
    if (e) {
      setTimeout(() => {
        this.setState({ disabled: false });
      }, 6500);
    }

    //Get the current time in HH:MM:SS format
    let time = new Date()
      .toTimeString()
      .replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    //Remove seconds from the value
    time = time.substring(0, time.length - 3);
    //Set the time to the state (after the request, this is why this setState for switch is earlier)
    this.setState({ lastChangeText: `Ostatnie przełączenie: ${time}` });
  }

  async toogleHeatingControl(e) {
    //Toogle the heating control
    let request = await fetch(
      `${serverIp}/toogleControlledHeater?on=${e === true ? "true" : "false"}`
    );
    this.setState({
      isHeatControllerEnabled: e,
    });
    if (e === false) {
      this.setState({ isHeating: false });
    }
  }

  async toogleHeater(e) {
    //Toogle the heater
    let request = await fetch(
      `${serverIp}/toogleHeater?on=${e === true ? "true" : "false"}`
    );

    //Get the current time in HH:MM:SS format
    let time = new Date()
      .toTimeString()
      .replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    //Remove seconds from the value
    time = time.substring(0, time.length - 3);
    this.setState({
      isHeating: e,
      heaterLastChangeText: `Ostatnie przełączenie: ${time}`,
    });
  }

  render() {
    if (this.state.isLoaded) {
      switch (this.state.currentPage) {
        case "Home":
          return (
            <div className="container">
              <CurrentChart temperature={this.state.currentTemperature} />
              <div className="switch">
                <div className="switchChild">
                  <MdLightbulbOutline size={80} color={"#ffffff"} />
                  <Switch
                    checked={this.state.isOn}
                    disabled={this.state.disabled}
                    onChange={this.toogleLight.bind(this)}
                    offColor="#ad1d25"
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    handleDiameter={70}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={50}
                    width={100}
                  />
                </div>
              </div>
              <div className="switch">
                <div className="switchChild">
                  <MdFlashOn size={80} color={"#ffffff"} />
                  <Switch
                    checked={this.state.isHeating}
                    onChange={this.toogleHeater.bind(this)}
                    offColor="#ad1d25"
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    handleDiameter={70}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={50}
                    width={100}
                  />
                </div>
              </div>
              <div className="navbar">
                <BottomNavigation
                  style={{ backgroundColor: "#111413" }}
                  value={this.state.currentPage}
                  onChange={this.navigationChange.bind(this)}
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
          break;
        case "Chart":
          return (
            <div className="chartContainer">
              <HistoryChart
                data={this.state.historyTemperatures}
                heaterLogs={this.state.heaterLogs}
                settings={this.state.settings}
              />
              <div className="nextChange">
                <span className="nextChangeSpan">
                  {this.state.nextChangeText}
                </span>
              </div>
              <div className="switch">
                <div>
                  <MdLightbulbOutline size={80} color={"#ffffff"} />
                  <Switch
                    checked={this.state.isOn}
                    disabled={this.state.disabled}
                    onChange={this.toogleLight.bind(this)}
                    offColor="#ad1d25"
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    handleDiameter={70}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={50}
                    width={100}
                  />
                </div>
                <span className="lastChangeSpan">
                  {this.state.lastChangeText}
                </span>
              </div>
              <div className="switch">
                <div className="switchChild">
                  <MdTrendingUp size={80} color={"#ffffff"} />
                  <Switch
                    checked={this.state.isHeatControllerEnabled}
                    onChange={this.toogleHeatingControl.bind(this)}
                    offColor="#ad1d25"
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    handleDiameter={70}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={50}
                    width={100}
                  />
                  <MdExpandLess
                    size={80}
                    color={this.state.isHeating ? "#1466c9" : "#9aa2ab"}
                  />
                </div>
                <span className="lastChangeSpan">
                  {this.state.heaterLastChangeText}
                </span>
              </div>
              <div className="navbar">
                <BottomNavigation
                  style={{ backgroundColor: "#111413" }}
                  value={this.state.currentPage}
                  onChange={this.navigationChange.bind(this)}
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
          break;
        case "Settings":
          return (
            <Settings
              onNavigationStateChange={this.navigationChange}
              that={this}
              currentSettings={this.state.settings}
            />
          );
          break;
      }
    } else {
      return (
        <div className="container">
          <div className="spinner">
            <CircularProgress size={150} color="inherit" />
            <span>Ładowanie...</span>
          </div>
        </div>
      );
    }
  }
}

export default Home;
