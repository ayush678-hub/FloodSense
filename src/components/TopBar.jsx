import { useState, useEffect } from "react";

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 13, condition: "Partly Cloudy" });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock weather data (in production, this would come from an API)
  useEffect(() => {
    // Simulate weather updates
    const weatherTimer = setInterval(() => {
      setWeather({
        temp: 10 + Math.floor(Math.random() * 6), // Range: 10-15°C
        condition: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"][Math.floor(Math.random() * 4)]
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(weatherTimer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">🌧️ Delhi Flood Watch</h1>
            <span className="text-sm opacity-90">Smart Urban Flood Management System</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm opacity-90">{formatDate(currentTime)}</div>
              <div className="text-lg font-semibold">{formatTime(currentTime)}</div>
            </div>
            
            <div className="flex items-center space-x-2 bg-blue-500 bg-opacity-30 px-4 py-2 rounded-lg">
              <span className="text-2xl">🌤️</span>
              <div>
                <div className="text-sm opacity-90">{weather.condition}</div>
                <div className="text-lg font-semibold">{weather.temp}°C</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

