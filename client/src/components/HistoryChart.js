import React from "react";
import ApexCharts from "react-apexcharts";
import "../styles/Chart.css";

class HistoryChart extends React.Component {
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
          labels: this.props.data.map((e) => e.time),
          xaxis: {
            labels: {
              show: false,
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
        }}
        series={[
          {
            name: "Temperatura",
            data: this.props.data.map((e) => e.value),
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
