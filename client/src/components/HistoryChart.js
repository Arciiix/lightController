import React from "react";
import ApexCharts from "react-apexcharts";
import "../styles/Chart.css";

class HistoryChart extends React.Component {
  constructor(props) {
    super(props);

    let onLogs = this.props.heaterLogs.filter((e) => e.action === 1);
    let offLogs = this.props.heaterLogs.filter((e) => e.action === 0);

    let heaterLogsArr = [];

    let timesArray = this.props.data.map((e) => e.time.toString());

    //The annotations arrays
    onLogs.forEach((e) => {
      heaterLogsArr.push({
        x: this.parseDateIntoStringFormat(
          this.closest(
            timesArray.map((e) => parseInt(e)),
            e.date
          )
        ),
        strokeDashArray: 0,
        borderColor: "#12cc77",
        label: {
          borderColor: "#12cc77",
          style: {
            color: "#fff",
            background: "#12cc77",
          },
          text: "Włączenie grzałki",
        },
      });
    });

    offLogs.forEach((e) => {
      heaterLogsArr.push({
        x: this.parseDateIntoStringFormat(
          this.closest(
            timesArray.map((e) => parseInt(e)),
            e.date
          )
        ),
        strokeDashArray: 0,
        borderColor: "#d40652",
        label: {
          borderColor: "#d40652",
          style: {
            color: "#fff",
            background: "#d40652",
          },
          text: "Wyłączenie grzałki",
        },
      });
    });

    this.state = {
      data: this.props.data.map((e) => e.value),
      timesData: timesArray,
      heaterLogs: this.props.heaterLogs,
      heaterLogsChartAnnotationsArr: heaterLogsArr,
    };
  }
  parseDateIntoStringFormat(date) {
    //Parse date into HH:mm dd.MM.yyyy
    let parsedDate = new Date(parseInt(date));
    return `${this.addZero(parsedDate.getHours())}:${this.addZero(
      parsedDate.getMinutes()
    )} ${this.addZero(parsedDate.getDate())}.${this.addZero(
      parsedDate.getMonth() + 1
    )}.${parsedDate.getFullYear()}`;
  }

  addZero(number) {
    return number < 10 ? `0${number}` : `${number}`;
  }

  closest(array, goal) {
    return array.reduce(function (prev, curr) {
      return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
    });
  }
  render() {
    return (
      <ApexCharts
        options={{
          chart: {
            type: "area",
          },
          colors: ["#0377fc"],
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: "smooth",
          },
          labels: this.state.timesData,
          xaxis: {
            labels: {
              formatter: (value) => {
                return this.parseDateIntoStringFormat(value);
              },
              style: {
                colors: "#111413",
              },
            },
          },
          yaxis: {
            labels: {
              style: {
                colors: "white",
              },
              formatter: function (val) {
                return parseFloat(val).toFixed(2) + "°C";
              },
            },
          },
          annotations: {
            xaxis: this.state.heaterLogsChartAnnotationsArr,
          },
        }}
        series={[
          {
            name: "Temperatura",
            data: this.state.data,
          },
        ]}
        className="historyChart"
        width={"100%"}
        type="area"
        height={"50%"}
      />
    );
  }
}

export default HistoryChart;
