import React, { useRef, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

export function ChartSection({ chartData, lineChartData }) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const canvases = document.querySelectorAll("canvas");
  
    const updateZoomCursor = (event) => {
      canvases.forEach((canvas) => {
        if (event.deltaY < 0) {
          canvas.style.cursor = "zoom-in"; 
        } else {
          canvas.style.cursor = "zoom-out"; 
        }
      });
  
      setTimeout(() => {
        canvases.forEach((canvas) => {
          canvas.style.cursor = "grab"; 
        });
      }, 1000);
    };
  
    canvases.forEach((canvas) => {
      canvas.addEventListener("wheel", updateZoomCursor);
    });
  
    return () => {
      canvases.forEach((canvas) => {
        canvas.removeEventListener("wheel", updateZoomCursor);
      });
    };
  }, []);
  

  return (
    <div className="charts" ref={chartContainerRef}>
      <div className="chart">
        <h3>Bar Chart</h3>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            scales: { x: { stacked: true }, y: { stacked: true } },
            maintainAspectRatio: false,
            plugins: {
              zoom: {
                pan: { enabled: true, mode: "xy" },
                zoom: {
                  wheel: { enabled: true },
                  pinch: { enabled: true },
                  mode: "xy",
                },
              },
            },
          }}
        />
      </div>

      <div className="chart">
        <h3>Line Chart </h3>
        <Line
          data={lineChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              zoom: {
                pan: { enabled: true, mode: "xy" },
                zoom: {
                  wheel: { enabled: true },
                  pinch: { enabled: true },
                  mode: "xy",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
