import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg shadow-sm">
      <Clock className="w-6 h-6 text-blue-500" />
      <span className="text-xl font-mono">
        {time.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
    </div>
  );
};

export default DigitalClock;
