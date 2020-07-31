import React from "react";
import Switch from "react-switch";
import {
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
} from "@material-ui/core";
import {
  AiOutlineHome,
  AiOutlineBarChart,
  AiOutlineSetting,
} from "react-icons/ai";
import "../styles/Home.css";
import "../styles/Chart.css";

import CurrentChart from "./CurrentChart";
import HistoryChart from "./HistoryChart";
import Settings from "./Settings";

//DEV
const serverIp = "http://localhost:5252";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      isOn: false,
      currentTemperature: 0,
      historyTemperatures: [],
      currentPage: "Home",
      nextChangeText: "",
      lastChangeText: "Jeszcze nie przełączono!",
      settings: {
        onTime: "",
        offTime: "",
        ip: "",
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
      this.setState({ isLoaded: true, ...dataObj }, this.forceUpdate);
    }
  }

  navigationChange(event, newValue) {
    this.setState({ currentPage: newValue });
  }

  async toogleLight(e) {
    this.setState({ isOn: e });
    await fetch(`${serverIp}/toogleLight?on=${e}`);

    //Get the current time in HH:MM:SS format
    let time = new Date()
      .toTimeString()
      .replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    //Remove seconds from the value
    time = time.substring(0, time.length - 3);
    //Set the time to the state (after the request, this is why this setState for switch is earlier)
    this.setState({ lastChangeText: `Ostatnie przełączenie: ${time}` });
  }

  render() {
    if (this.state.isLoaded) {
      switch (this.state.currentPage) {
        case "Home":
          return (
            <div className="container">
              <CurrentChart temperature={this.state.currentTemperature} />
              <div className="switch">
                <Switch
                  checked={this.state.isOn}
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
          break;
        case "Chart":
          return (
            <div className="container">
              <HistoryChart data={this.state.historyTemperatures} />
              <div className="nextChange">
                <span className="nextChangeSpan">
                  {this.state.nextChangeText}
                </span>
              </div>
              <div className="switch">
                <Switch
                  checked={this.state.isOn}
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
                <span className="lastChangeSpan">
                  {this.state.lastChangeText}
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
