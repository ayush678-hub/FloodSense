import { useMemo } from "react";
import { generateTaskTickets, calculatePreparednessScore } from "../utils/riskEngine";

export default function ActionPanel({ wardRisks, selectedWard }) {
  const taskTickets = useMemo(() => {
    if (!wardRisks || wardRisks.length === 0) return [];
    return generateTaskTickets(wardRisks);
  }, [wardRisks]);

  const preparednessScore = useMemo(() => {
    if (!wardRisks || wardRisks.length === 0) return 0;
    return calculatePreparednessScore(wardRisks);
  }, [wardRisks]);

  const getPreparednessColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPreparednessLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Critical";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 border-red-300 text-red-800";
      case "high":
        return "bg-orange-100 border-orange-300 text-orange-800";
      case "medium":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      Critical: "bg-red-500",
      High: "bg-orange-500",
      Medium: "bg-yellow-500",
      Low: "bg-green-500"
    };
    return colors[severity] || "bg-gray-500";
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!wardRisks || wardRisks.length === 0) {
      return { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
    }
    
    return {
      critical: wardRisks.filter(w => w.risk?.level === "Critical").length,
      high: wardRisks.filter(w => w.risk?.level === "High").length,
      medium: wardRisks.filter(w => w.risk?.level === "Medium").length,
      low: wardRisks.filter(w => w.risk?.level === "Low").length,
      total: wardRisks.length
    };
  }, [wardRisks]);

  return (
    <div className="w-96 bg-white shadow-lg p-6 overflow-y-auto custom-scrollbar">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b-2 border-blue-500 pb-2">
        🎯 Action Center
      </h2>

      {/* City-Wide Preparedness Score */}
      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">City-Wide Preparedness</h3>
        <div className="flex items-center justify-center mb-3">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={preparednessScore >= 80 ? "#10b981" : preparednessScore >= 60 ? "#f59e0b" : "#ef4444"}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - preparednessScore / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getPreparednessColor(preparednessScore)}`}>
                  {preparednessScore}%
                </div>
                <div className="text-xs text-gray-600">{getPreparednessLabel(preparednessScore)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-600 text-center">
          Based on {stats.total} wards monitored
        </div>
      </div>

      {/* Risk Summary */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Risk Distribution</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Critical: {stats.critical}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>High: {stats.high}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Medium: {stats.medium}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Low: {stats.low}</span>
          </div>
        </div>
      </div>

      {/* Task Tickets */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          📋 Task Tickets ({taskTickets.length})
        </h3>
        {taskTickets.length === 0 ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="text-green-600 text-2xl mb-2">✅</div>
            <div className="text-sm text-green-700 font-medium">No critical actions required</div>
            <div className="text-xs text-green-600 mt-1">All systems monitoring normally</div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {taskTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 border-2 rounded-lg ${getPriorityColor(ticket.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${getSeverityBadge(ticket.severity)}`}></span>
                    <span className="font-semibold text-sm">{ticket.location}</span>
                  </div>
                  <span className="text-xs font-medium bg-white bg-opacity-50 px-2 py-1 rounded">
                    {ticket.severity}
                  </span>
                </div>
                <div className="text-sm mb-2 font-medium">{ticket.action}</div>
                <div className="flex items-center justify-between text-xs opacity-90">
                  <span>⏱️ {ticket.timeWindow}</span>
                  <span>Risk: {ticket.riskScore}/100</span>
                </div>
                <div className="mt-2 text-xs opacity-75">
                  Confidence: {ticket.confidence}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* What Should Be Done Now */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 What Should Be Done Now?</h3>
        {taskTickets.length === 0 ? (
          <ul className="text-xs text-blue-700 space-y-1">
            <li>✅ Continue monitoring all wards</li>
            <li>✅ Maintain standard preparedness levels</li>
            <li>✅ Review drainage maintenance schedules</li>
          </ul>
        ) : (
          <ul className="text-xs text-blue-700 space-y-1">
            {taskTickets.slice(0, 3).map((ticket, idx) => (
              <li key={idx}>
                {idx + 1}. {ticket.action} at {ticket.location}
              </li>
            ))}
            {taskTickets.length > 3 && (
              <li className="text-blue-600 font-medium">
                + {taskTickets.length - 3} more tasks...
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Selected Ward Details */}
      {selectedWard && selectedWard.risk && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            📍 Selected Ward Details
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              <strong>Name:</strong> {selectedWard.properties?.name || "Unknown"}
            </div>
            <div>
              <strong>Risk:</strong>{" "}
              <span style={{ color: selectedWard.risk.level === "Critical" ? "#d32f2f" : 
                                      selectedWard.risk.level === "High" ? "#f57c00" : 
                                      selectedWard.risk.level === "Medium" ? "#fbc02d" : "#43a047" }}>
                {selectedWard.risk.level}
              </span>
            </div>
            <div>
              <strong>Score:</strong> {selectedWard.risk.score}/100
            </div>
            <div>
              <strong>Confidence:</strong> {selectedWard.risk.confidence}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
