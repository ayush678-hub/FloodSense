export default function ControlPanel({
  rainfall,
  setRainfall,
  timeHorizon,
  setTimeHorizon,
  showHighRiskOnly,
  setShowHighRiskOnly,
  replayMode,
  setReplayMode
}) {
  return (
    <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto custom-scrollbar">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b-2 border-blue-500 pb-2">
        ⚙️ Control Center
      </h2>

      {/* Rainfall Simulation */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🌧️ Rainfall Simulation
        </label>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">0 mm</span>
          <span className="text-lg font-bold text-blue-600">{rainfall} mm</span>
          <span className="text-xs text-gray-500">200 mm</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          value={rainfall}
          onChange={(e) => setRainfall(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="mt-2 text-xs text-gray-600">
          {rainfall < 20 && "☀️ Light rain - Low risk"}
          {rainfall >= 20 && rainfall < 50 && "🌦️ Moderate rain - Monitor"}
          {rainfall >= 50 && rainfall < 100 && "🌧️ Heavy rain - High alert"}
          {rainfall >= 100 && "⛈️ Extreme rain - Critical alert"}
        </div>
      </div>

      {/* Time Horizon Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ⏱️ Prediction Time Horizon
        </label>
        <div className="space-y-2">
          {["30m", "1h", "3h"].map((horizon) => {
            const labels = {
              "30m": "Next 30 minutes",
              "1h": "Next 1 hour",
              "3h": "Next 3 hours"
            };
            return (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`w-full py-2 px-4 rounded-lg text-left transition-all ${
                  timeHorizon === horizon
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {labels[horizon]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          🔍 Filters
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHighRiskOnly}
              onChange={(e) => setShowHighRiskOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show only high-risk wards</span>
          </label>
        </div>
      </div>

      {/* Replay Mode */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          📹 Replay Mode
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={replayMode}
            onChange={(e) => setReplayMode(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Enable past event playback</span>
        </label>
        {replayMode && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            ⚠️ Replay mode: Simulating historical flood event
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ System Status</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>✅ Real-time monitoring active</li>
          <li>✅ Risk engine operational</li>
          <li>✅ GIS data loaded</li>
        </ul>
      </div>
    </div>
  );
}

