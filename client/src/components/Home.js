import React from "react";
import ApexCharts from "react-apexcharts";
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
    let request = await fetch(`${serverIp}/toogleLight?on=${e}`);
  }
  render() {
    if (this.state.isLoaded) {
      switch (this.state.currentPage) {
        case "Home":
          return (
            <div className="container">
              <ApexCharts
                className="currChart"
                options={{
                  chart: {
                    id: "currentTemp",
                  },
                  plotOptions: {
                    radialBar: {
                      startAngle: -135,
                      endAngle: 135,
                      hollow: {
                        size: "70%",
                      },

                      dataLabels: {
                        name: {
                          show: false,
                        },
                        value: {
                          formatter: function (val) {
                            return parseFloat(val) + "°C";
                          },
                          color: "#fff",
                          fontSize: "1em",
                        },
                      },
                    },
                  },
                  fill: {
                    type: "gradient",
                    gradient: {
                      shade: "dark",
                      type: "horizontal",
                      shadeIntensity: 0.5,
                      gradientToColors: ["#18cc96"],
                      inverseColors: true,
                      opacityFrom: 1,
                      opacityTo: 1,
                      stops: [0, 100],
                    },
                  },
                  stroke: {
                    lineCap: "round",
                  },
                  labels: ["Percent"],
                  grid: {
                    padding: {
                      bottom: 15,
                      top: 15,
                    },
                  },
                }}
                series={[this.state.currentTemperature]}
                type="radialBar"
                width={"100%"}
              />
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
