"""
Risk Engine for Flood Prediction
Implements the risk scoring pipeline with configurable weights
"""

import random
from typing import Optional, Dict, List

def calculate_risk_score(
    rainfall: float,
    time_horizon: str,
    ward_data: Optional[Dict] = None
) -> Dict:
    """
    Calculate flood risk score for a ward
    
    Args:
        rainfall: Rainfall in mm
        time_horizon: "30m", "1h", or "3h"
        ward_data: Optional ward-specific data
    
    Returns:
        Dictionary with risk assessment
    """
    # Default ward data if not provided
    if ward_data is None:
        ward_data = {}
    
    elevation_factor = ward_data.get("elevation_factor", random.random() * 40)
    drain_blockage = ward_data.get("drain_blockage", random.random() * 60)
    vulnerability_index = ward_data.get("vulnerability_index", 1.0)
    population_density = ward_data.get("population_density", 0.5)
    has_hospitals = ward_data.get("has_hospitals", False)
    has_schools = ward_data.get("has_schools", False)
    has_metro = ward_data.get("has_metro", False)
    
    # Configurable weights
    w1 = 0.5  # Rainfall weight
    w2 = 0.2  # Elevation weight
    w3 = 0.3  # Drain blockage weight
    
    # Base risk calculation
    base_risk = (
        (rainfall * w1) +
        (elevation_factor * w2) +
        (drain_blockage * w3)
    )
    
    # Time-based multiplier
    time_multiplier = {
        "30m": 0.9,
        "1h": 1.0,
        "3h": 1.15
    }.get(time_horizon, 1.0)
    
    # Vulnerability adjustment
    vulnerability_multiplier = vulnerability_index
    
    # Increase risk if critical infrastructure present
    if has_hospitals:
        vulnerability_multiplier += 0.15
    if has_schools:
        vulnerability_multiplier += 0.1
    if has_metro:
        vulnerability_multiplier += 0.1
    if population_density > 0.7:
        vulnerability_multiplier += 0.1
    
    # Final risk score
    final_risk = min(100, round(base_risk * time_multiplier * vulnerability_multiplier))
    
    # Confidence calculation
    confidence = 85
    if time_horizon == "3h":
        confidence -= 10
    elif time_horizon == "30m":
        confidence += 5
    
    if not ward_data.get("ward_id"):
        confidence -= 5
    
    confidence = max(60, min(95, confidence + (random.random() * 10 - 5)))
    
    # Risk level classification
    level = "Low"
    action = "Monitoring only"
    priority = "low"
    
    if final_risk >= 70:
        level = "Critical"
        priority = "critical"
        action = "Deploy 2 pumps & barricade roads immediately"
    elif final_risk >= 50:
        level = "High"
        priority = "high"
        action = "Deploy 1 pump, inspect drains, prepare barricades"
    elif final_risk >= 30:
        level = "Medium"
        priority = "medium"
        action = "Inspect drains, keep pumps on standby"
    
    return {
        "score": final_risk,
        "level": level,
        "confidence": round(confidence),
        "action": action,
        "priority": priority,
        "rainfall": rainfall,
        "drain_blockage": round(drain_blockage),
        "elevation_factor": round(elevation_factor),
        "vulnerability_index": f"{vulnerability_multiplier:.2f}",
        "time_horizon": time_horizon
    }

def generate_ward_risks(
    rainfall: float,
    time_horizon: str,
    wards: List[Dict]
) -> List[Dict]:
    """
    Generate risk assessments for multiple wards
    """
    ward_risks = []
    
    for ward in wards:
        props = ward.get("properties", {})
        ward_data = {
            "ward_id": props.get("ward_id") or props.get("id"),
            "elevation_factor": props.get("elevation", random.random() * 40),
            "drain_blockage": props.get("drain_blockage", random.random() * 60),
            "vulnerability_index": props.get("vulnerability", 1.0),
            "population_density": props.get("population_density", random.random()),
            "has_hospitals": props.get("has_hospitals", random.random() > 0.7),
            "has_schools": props.get("has_schools", random.random() > 0.5),
            "has_metro": props.get("has_metro", random.random() > 0.8),
        }
        
        risk = calculate_risk_score(rainfall, time_horizon, ward_data)
        
        ward_risks.append({
            **ward,
            "risk": risk
        })
    
    return ward_risks

def calculate_preparedness(ward_risks: List[Dict]) -> Dict:
    """
    Calculate city-wide preparedness score
    """
    if not ward_risks:
        return {
            "score": 0,
            "label": "Unknown",
            "total_wards": 0,
            "critical_wards": 0,
            "high_wards": 0,
            "medium_wards": 0,
            "low_wards": 0
        }
    
    total_wards = len(ward_risks)
    critical_wards = sum(1 for w in ward_risks if w.get("risk", {}).get("level") == "Critical")
    high_wards = sum(1 for w in ward_risks if w.get("risk", {}).get("level") == "High")
    medium_wards = sum(1 for w in ward_risks if w.get("risk", {}).get("level") == "Medium")
    low_wards = sum(1 for w in ward_risks if w.get("risk", {}).get("level") == "Low")
    
    # Preparedness decreases with more high-risk wards
    risk_penalty = (critical_wards * 20) + (high_wards * 10) + (medium_wards * 5)
    preparedness = max(0, min(100, 100 - (risk_penalty / total_wards)))
    
    score = round(preparedness)
    
    if score >= 80:
        label = "Excellent"
    elif score >= 60:
        label = "Good"
    elif score >= 40:
        label = "Fair"
    else:
        label = "Critical"
    
    return {
        "score": score,
        "label": label,
        "total_wards": total_wards,
        "critical_wards": critical_wards,
        "high_wards": high_wards,
        "medium_wards": medium_wards,
        "low_wards": low_wards
    }

