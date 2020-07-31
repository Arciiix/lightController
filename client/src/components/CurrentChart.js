import React from "react";
import ApexCharts from "react-apexcharts";

class CurrentChart extends React.Component {
  parseToPercent(value) {
    //I give the value by percent of 10
    //For e.g. 50% means 50% of 10 = 5
    //The minimal value is 20, and the maximal - 30, and this is why that's the percent of 10 (30 - 20)
    //So I do 20 + 50% of 10 = 25
    //It means that the current temperature is 25

    //I subtract 20 from the value (look above) and then calculate, how many percent of 10 (30 - 20) is that value
    value -= 20;
    value /= 10;
    return value * 100;
  }

  parsePercentToFloat(value) {
    //I do opposite of earlier calculations
    value /= 10;
    value += 20;
    return value;
  }
  render() {
    return (
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
                  formatter: (val) => {
                    //I get the value by percent of 10
                    //For e.g. 50% means 50% of 10 = 5
                    //The minimal value is 20, and the maximal - 30, and this is why that's the percent of 10 (30 - 20)
                    //So I do 20 + 50% of 10 = 25
                    //It means that the current temperature is 25
                    let value =
                      parseFloat(this.parsePercentToFloat(val)) + "°C";
                    return value;
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
        //I give the value by percent of 10
        //For e.g. 50% means 50% of 10 = 5
        //The minimal value is 20, and the maximal - 30, and this is why that's the percent of 10 (30 - 20)
        //So I do 20 + 50% of 10 = 25
        //It means that the current temperature is 25
        series={[this.parseToPercent(this.props.temperature)]}
        type="radialBar"
        width={"100%"}
      />
    );
  }
}

export default CurrentChart;
