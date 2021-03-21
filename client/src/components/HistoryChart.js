import React from "react";
import ApexCharts from "react-apexcharts";
import "../styles/Chart.css";

class HistoryChart extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props.heaterLogs);
    let onLogs = this.props.heaterLogs.filter((e) => e.action === 1);
    let offLogs = this.props.heaterLogs.filter((e) => e.action === 0);

    let heaterLogsArr = [];

    let timesArray = this.props.data.map((e) => e.time.toString());

    //The annotations arrays

    onLogs.forEach((e) => {
      console.log(e);
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

    console.log(heaterLogsArr);

    this.state = {
      data: this.props.data.map((e) => e.value),
      timesData: timesArray,
      heaterLogs: this.props.heaterLogs,
      heaterLogsChartAnnotationsArr: heaterLogsArr,
    };
  }
  parseDateIntoStringFormat(date) {
    //Parse a date into HH:MM
    //Get the current time in HH:MM:SS format
    let parsedDate = new Date(parseInt(date))
      .toTimeString()
      .replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    //Remove seconds from the time
    parsedDate = parsedDate.substring(0, parsedDate.length - 3);

    return parsedDate;
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
