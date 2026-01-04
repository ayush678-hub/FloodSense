import { useState, useMemo } from "react";
import TopBar from "./components/TopBar";
import ControlPanel from "./components/ControlPanel";
import MapView from "./components/MapView";
import ActionPanel from "./components/ActionPanel";
import { generateWardRisks } from "./utils/riskEngine";
import { loadWards } from "./utils/loadWards";

export default function App() {
  const [rainfall, setRainfall] = useState(50);
  const [timeHorizon, setTimeHorizon] = useState("1h");
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);
  const [replayMode, setReplayMode] = useState(false);
  const [selectedWard, setSelectedWard] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // Load ward data
  const wardsData = useMemo(() => loadWards(), []);
  
  // Calculate risks for all wards
  const wardRisks = useMemo(() => {
    if (!wardsData || !wardsData.features) return [];
    return generateWardRisks(rainfall, timeHorizon, wardsData.features);
  }, [rainfall, timeHorizon, wardsData]);

  // Handle ward click from map
  const handleWardClick = (ward) => {
    setSelectedWard(ward);
  };

  // Handle alerts from map
  const handleAlert = (alertData) => {
    // Prevent duplicate alerts
    const alertKey = `${alertData.wardId}-${alertData.risk.level}`;
    setAlerts((prev) => {
      const exists = prev.some(a => 
        a.wardId === alertData.wardId && a.risk.level === alertData.risk.level
      );
      if (!exists) {
        return [...prev, { ...alertData, key: alertKey }];
      }
      return prev;
    });
  };

  // Clear alerts when parameters change
  const handleRainfallChange = (value) => {
    setRainfall(value);
    setAlerts([]);
    setSelectedWard(null);
  };

  const handleTimeHorizonChange = (value) => {
    setTimeHorizon(value);
    setAlerts([]);
    setSelectedWard(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <ControlPanel
          rainfall={rainfall}
          setRainfall={handleRainfallChange}
          timeHorizon={timeHorizon}
          setTimeHorizon={handleTimeHorizonChange}
          showHighRiskOnly={showHighRiskOnly}
          setShowHighRiskOnly={setShowHighRiskOnly}
          replayMode={replayMode}
          setReplayMode={setReplayMode}
        />

        {/* Center - Map */}
        <div className="flex-1 p-4">
          <MapView
            rainfall={rainfall}
            timeHorizon={timeHorizon}
            showHighRiskOnly={showHighRiskOnly}
            onWardClick={handleWardClick}
            onAlert={handleAlert}
          />
        </div>

        {/* Right Panel - Action Center */}
        <ActionPanel
          wardRisks={wardRisks}
          selectedWard={selectedWard}
        />
      </div>
    </div>
  );
}
