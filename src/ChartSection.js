import React from "react";
import { Bar, Line } from "react-chartjs-2";

export function ChartSection({ chartData, lineChartData }) {
  return (
    <div className="charts">
      <div className="chart">
        <h3>Bar Chart</h3>
        <Bar
          data={chartData}
          options={{ responsive: true, scales: { x: { stacked: true }, y: { stacked: true } } }}
        />
      </div>
      <div className="chart">
        <h3>Line Chart</h3>
        <Line data={lineChartData} />
      </div>
    </div>
  );
}
