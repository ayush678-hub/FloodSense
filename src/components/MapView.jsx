import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { generateWardRisks } from "../utils/riskEngine";
import { loadWards } from "../utils/loadWards";

// Component to update map when filters change
function MapUpdater({ showHighRiskOnly, wardRisks }) {
  const map = useMap();
  
  useEffect(() => {
    if (showHighRiskOnly && wardRisks) {
      const highRiskWards = wardRisks.filter(w => 
        w.risk && (w.risk.level === "High" || w.risk.level === "Critical")
      );
      
      if (highRiskWards.length > 0) {
        // Fit bounds to high-risk wards
        const bounds = highRiskWards.map(ward => {
          const coords = ward.geometry.coordinates[0];
          return coords.map(coord => [coord[1], coord[0]]);
        }).flat();
        
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  }, [showHighRiskOnly, wardRisks, map]);
  
  return null;
}

const getColor = (level) => {
  switch (level) {
    case "Critical":
      return "#d32f2f"; // Red
    case "High":
      return "#f57c00"; // Orange
    case "Medium":
      return "#fbc02d"; // Yellow
    case "Low":
      return "#43a047"; // Green
    default:
      return "#9e9e9e"; // Gray
  }
};

const getRiskIcon = (level) => {
  switch (level) {
    case "Critical":
      return "🔴";
    case "High":
      return "🟠";
    case "Medium":
      return "🟡";
    case "Low":
      return "🟢";
    default:
      return "⚪";
  }
};

export default function MapView({ 
  rainfall, 
  timeHorizon, 
  showHighRiskOnly,
  onWardClick,
  onAlert 
}) {
  // Load and calculate risks for all wards
  const wardsData = useMemo(() => loadWards(), []);
  
  const wardRisks = useMemo(() => {
    if (!wardsData || !wardsData.features) return [];
    return generateWardRisks(rainfall, timeHorizon, wardsData.features);
  }, [rainfall, timeHorizon, wardsData]);

  // Filter wards based on showHighRiskOnly
  const filteredWards = useMemo(() => {
    if (!showHighRiskOnly) return wardRisks;
    return wardRisks.filter(ward => 
      ward.risk && (ward.risk.level === "High" || ward.risk.level === "Critical")
    );
  }, [wardRisks, showHighRiskOnly]);

  // Trigger alerts for high-risk wards
  useEffect(() => {
    if (onAlert) {
      wardRisks.forEach(ward => {
        if (ward.risk && (ward.risk.level === "High" || ward.risk.level === "Critical")) {
          const wardName = ward.properties?.name || `Ward ${ward.properties?.ward_id || 'Unknown'}`;
          onAlert({
            wardName,
            risk: ward.risk,
            wardId: ward.properties?.ward_id || ward.properties?.id
          });
        }
      });
    }
  }, [wardRisks, onAlert]);

  const handleFeatureClick = (feature, layer) => {
    const ward = wardRisks.find(w => 
      w.properties?.ward_id === feature.properties?.ward_id ||
      w.properties?.id === feature.properties?.id
    );
    
    if (ward && ward.risk) {
      const risk = ward.risk;
      const wardName = feature.properties?.name || `Ward ${feature.properties?.ward_id || 'Unknown'}`;
      
      // Enhanced popup with detailed information
      const popupContent = `
        <div style="min-width: 250px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: ${getColor(risk.level)}; font-size: 16px; font-weight: bold;">
            ${getRiskIcon(risk.level)} ${wardName}
          </h3>
          <div style="border-top: 2px solid #e0e0e0; padding-top: 8px; margin-top: 8px;">
            <div style="margin: 5px 0;">
              <strong>Risk Level:</strong> <span style="color: ${getColor(risk.level)};">${risk.level}</span>
            </div>
            <div style="margin: 5px 0;">
              <strong>Risk Score:</strong> ${risk.score}/100
            </div>
            <div style="margin: 5px 0;">
              <strong>Confidence:</strong> ${risk.confidence}%
            </div>
            <div style="margin: 5px 0;">
              <strong>Rainfall:</strong> ${risk.rainfall} mm
            </div>
            <div style="margin: 5px 0;">
              <strong>Drain Blockage:</strong> ${risk.drainBlockage}%
            </div>
            <div style="margin: 5px 0;">
              <strong>Elevation Factor:</strong> ${risk.elevationFactor}
            </div>
            <div style="margin: 5px 0;">
              <strong>Vulnerability Index:</strong> ${risk.vulnerabilityIndex}
            </div>
            <div style="margin: 10px 0; padding: 8px; background: #f5f5f5; border-radius: 4px;">
              <strong>Recommended Action:</strong><br/>
              <span style="color: #333;">${risk.action}</span>
            </div>
            <div style="margin: 5px 0; font-size: 12px; color: #666;">
              Time Horizon: ${risk.timeHorizon === "30m" ? "30 minutes" : risk.timeHorizon === "1h" ? "1 hour" : "3 hours"}
            </div>
          </div>
        </div>
      `;
      
      layer.bindPopup(popupContent).openPopup();
      
      if (onWardClick) {
        onWardClick(ward);
      }
    }
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg shadow-lg"
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <GeoJSON
          data={{
            ...wardsData,
            features: filteredWards.map(ward => ({
              ...ward,
              properties: {
                ...ward.properties,
                riskLevel: ward.risk?.level || "Low"
              }
            }))
          }}
          onEachFeature={(feature, layer) => {
            const ward = wardRisks.find(w => 
              w.properties?.ward_id === feature.properties?.ward_id ||
              w.properties?.id === feature.properties?.id
            );
            
            const risk = ward?.risk;
            const riskLevel = risk?.level || "Low";

            layer.setStyle({
              fillColor: getColor(riskLevel),
              fillOpacity: riskLevel === "Critical" ? 0.8 : 
                          riskLevel === "High" ? 0.7 : 
                          riskLevel === "Medium" ? 0.6 : 0.5,
              color: "#333",
              weight: riskLevel === "Critical" ? 2 : 1,
              opacity: 0.8
            });

            layer.on({
              click: () => handleFeatureClick(feature, layer),
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  weight: 3,
                  fillOpacity: 0.9
                });
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle({
                  weight: riskLevel === "Critical" ? 2 : 1,
                  fillOpacity: riskLevel === "Critical" ? 0.8 : 
                              riskLevel === "High" ? 0.7 : 
                              riskLevel === "Medium" ? 0.6 : 0.5
                });
              }
            });
          }}
        />

        <MapUpdater showHighRiskOnly={showHighRiskOnly} wardRisks={wardRisks} />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-[1000]">
        <h4 className="text-sm font-bold mb-2 text-gray-700">Risk Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#d32f2f" }}></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f57c00" }}></div>
            <span>High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#fbc02d" }}></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#43a047" }}></div>
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
