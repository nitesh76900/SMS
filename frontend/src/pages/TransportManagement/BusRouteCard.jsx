import React, { useState } from "react";
import "./BusRouteCard.css";

const BusRouteCard = ({ route, onEdit, onDelete }) => {
  const [selectedStop, setSelectedStop] = useState(null);

  const handleStopClick = (index) => {
    setSelectedStop(index);
  };

  return (
    <div className="bus-route-card">
      {/* Route Visualization */}
      <div className="route-visual-horizontal">
        <div className="route-line-horizontal"></div>
        {route.stops.map((stop, index) => {
          // Determine the color based on the selected stop
          let color = "lightblue";
          if (selectedStop !== null) {
            if (index < selectedStop) color = "red";
            else if (index === selectedStop) color = "green";
          }

          return (
            <div
              key={index}
              className="stop-point-horizontal"
              style={{ left: `${(index / (route.stops.length - 1)) * 90}%` }}
            >
              <div
                className="stop-dot"
                style={{ backgroundColor: color }}
              ></div>
              <div className="stop-label-horizontal">{stop.name}</div>
            </div>
          );
        })}
      </div>
      <hr />

      {/* Information Section */}
      <div className="route-info">
        <h3>Bus Info</h3>
        <p>
          <strong>Bus No:</strong> {route.busNo}
        </p>
        <p>
          <strong>Total Stops:</strong> {route.stops.length}
        </p>
        <p>
          <strong>Total Distance:</strong> {route.totalKm} km
        </p>
        <h4>Stops:</h4>
        <ul>
          {route.stops.map((stop, index) => (
            <li key={index} onClick={() => handleStopClick(index)}>
              {stop.name}{" "}
              {index === selectedStop && <strong>(Current Stop)</strong>}
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="card-buttons">
        <button className="edit-btn" onClick={onEdit}>
          Edit
        </button>
        <button className="delete-btn" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default BusRouteCard;
