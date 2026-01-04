// Risk scoring pipeline with configurable weights and vulnerability adjustments

/**
 * Generate flood risk score for a ward
 * @param {number} rainfall - Rainfall in mm
 * @param {string} timeHorizon - "30m", "1h", or "3h"
 * @param {Object} wardData - Ward-specific data (elevation, drainBlockage, vulnerability)
 * @returns {Object} Risk assessment with score, level, confidence, and action
 */
export function generateRisk(rainfall, timeHorizon, wardData = {}) {
  // Default ward data if not provided
  const {
    elevationFactor = Math.random() * 40,
    drainBlockage = Math.random() * 60,
    vulnerabilityIndex = 1.0,
    populationDensity = 0.5,
    hasHospitals = false,
    hasSchools = false,
    hasMetro = false,
    wardId = null
  } = wardData;

  // Configurable weights per ward (can be tuned based on local conditions)
  const w1 = 0.5; // Rainfall weight
  const w2 = 0.2; // Elevation weight
  const w3 = 0.3; // Drain blockage weight

  // Base risk calculation
  const baseRisk = 
    (rainfall * w1) + 
    (elevationFactor * w2) + 
    (drainBlockage * w3);

  // Time-based multiplier
  const timeMultiplier = 
    timeHorizon === "30m" ? 0.9 :
    timeHorizon === "1h" ? 1.0 : 
    timeHorizon === "3h" ? 1.15 : 1.0;

  // Vulnerability adjustment
  let vulnerabilityMultiplier = vulnerabilityIndex;
  
  // Increase risk if critical infrastructure present
  if (hasHospitals) vulnerabilityMultiplier += 0.15;
  if (hasSchools) vulnerabilityMultiplier += 0.1;
  if (hasMetro) vulnerabilityMultiplier += 0.1;
  if (populationDensity > 0.7) vulnerabilityMultiplier += 0.1;

  // Final risk score
  const finalRisk = Math.min(100, Math.round(baseRisk * timeMultiplier * vulnerabilityMultiplier));

  // Confidence calculation (higher for shorter time horizons and consistent data)
  let confidence = 85;
  if (timeHorizon === "3h") confidence -= 10;
  if (timeHorizon === "30m") confidence += 5;
  
  // Reduce confidence if data is incomplete
  if (!wardId) confidence -= 5;
  
  confidence = Math.max(60, Math.min(95, confidence + (Math.random() * 10 - 5)));

  // Risk level classification
  let level = "Low";
  let action = "Monitoring only";
  let priority = "low";

  if (finalRisk >= 70) {
    level = "Critical";
    priority = "critical";
    action = "Deploy 2 pumps & barricade roads immediately";
  } else if (finalRisk >= 50) {
    level = "High";
    priority = "high";
    action = "Deploy 1 pump, inspect drains, prepare barricades";
  } else if (finalRisk >= 30) {
    level = "Medium";
    priority = "medium";
    action = "Inspect drains, keep pumps on standby";
  }

  return {
    score: finalRisk,
    level,
    confidence: Math.round(confidence),
    action,
    priority,
    rainfall,
    drainBlockage: Math.round(drainBlockage),
    elevationFactor: Math.round(elevationFactor),
    vulnerabilityIndex: vulnerabilityMultiplier.toFixed(2),
    timeHorizon
  };
}

/**
 * Generate risk for multiple wards
 */
export function generateWardRisks(rainfall, timeHorizon, wards) {
  return wards.map(ward => {
    const wardData = {
      wardId: ward.properties?.ward_id || ward.properties?.id,
      elevationFactor: ward.properties?.elevation || Math.random() * 40,
      drainBlockage: ward.properties?.drain_blockage || Math.random() * 60,
      vulnerabilityIndex: ward.properties?.vulnerability || 1.0,
      populationDensity: ward.properties?.population_density || Math.random(),
      hasHospitals: ward.properties?.has_hospitals || Math.random() > 0.7,
      hasSchools: ward.properties?.has_schools || Math.random() > 0.5,
      hasMetro: ward.properties?.has_metro || Math.random() > 0.8,
    };
    
    return {
      ...ward,
      risk: generateRisk(rainfall, timeHorizon, wardData)
    };
  });
}

/**
 * Calculate city-wide preparedness score
 */
export function calculatePreparednessScore(wardRisks) {
  if (!wardRisks || wardRisks.length === 0) return 0;
  
  const totalWards = wardRisks.length;
  const criticalWards = wardRisks.filter(w => w.risk?.level === "Critical").length;
  const highWards = wardRisks.filter(w => w.risk?.level === "High").length;
  const mediumWards = wardRisks.filter(w => w.risk?.level === "Medium").length;
  
  // Preparedness decreases with more high-risk wards
  const riskPenalty = (criticalWards * 20) + (highWards * 10) + (mediumWards * 5);
  const preparedness = Math.max(0, Math.min(100, 100 - (riskPenalty / totalWards)));
  
  return Math.round(preparedness);
}

/**
 * Generate task tickets from high-risk wards
 */
export function generateTaskTickets(wardRisks) {
  const tickets = [];
  
  wardRisks.forEach(ward => {
    const risk = ward.risk;
    if (risk && (risk.level === "Critical" || risk.level === "High")) {
      const wardName = ward.properties?.name || `Ward ${ward.properties?.ward_id || 'Unknown'}`;
      
      tickets.push({
        id: `ticket-${ward.properties?.ward_id || Date.now()}-${Math.random()}`,
        wardName,
        location: wardName,
        severity: risk.level,
        priority: risk.priority,
        action: risk.action,
        timeWindow: risk.timeHorizon === "30m" ? "30 minutes" : 
                   risk.timeHorizon === "1h" ? "1 hour" : "3 hours",
        riskScore: risk.score,
        confidence: risk.confidence,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Sort by priority (critical first, then by risk score)
  return tickets.sort((a, b) => {
    if (a.severity === "Critical" && b.severity !== "Critical") return -1;
    if (a.severity !== "Critical" && b.severity === "Critical") return 1;
    return b.riskScore - a.riskScore;
  });
}
