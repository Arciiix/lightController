import React from "react";
import ApexCharts from "react-apexcharts";
import Switch from "react-switch";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import {
  AiOutlineHome,
  AiOutlineBarChart,
  AiOutlineSetting,
} from "react-icons/ai";
import "../styles/Home.css";
import "../styles/Chart.css";

import HistoryChart from "./HistoryChart";
import Settings from "./Settings";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOn: false,
      currentTemperature: 25, //DEV
      historyTemperatures: [
        { time: "12:35", value: 23 },
        { time: "12:40", value: 25 },
        { time: "12:45", value: 25 },
        { time: "12:50", value: 21 },
        { time: "12:55", value: 23.5 },
      ], //DEV
      currentPage: "Home",
      nextChangeText: "Wyłączenie o 22:00", //DEV
      lastChangeText: "Jeszcze nie przełączono!", //DEV
    };
  }

  navigationChange(event, newValue) {
    this.setState({ currentPage: newValue });
  }

  toogleLight(e) {
    //DEV
    this.setState({ isOn: e });
  }
  render() {
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
          />
        );
        break;
    }
  }
}

export default Home;
