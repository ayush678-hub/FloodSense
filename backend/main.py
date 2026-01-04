"""
FastAPI Backend for FloodSense
Provides risk prediction endpoints and data processing
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime
from risk_engine import calculate_risk_score, generate_ward_risks, calculate_preparedness

app = FastAPI(
    title="FloodSense API",
    description="Smart Urban Flood Management System - Backend API",
    version="1.0.0"
)

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class RiskRequest(BaseModel):
    rainfall: float
    time_horizon: str  # "30m", "1h", "3h"
    ward_id: Optional[int] = None

class WardData(BaseModel):
    ward_id: int
    elevation: float
    drain_blockage: float
    vulnerability: float
    population_density: float
    has_hospitals: bool
    has_schools: bool
    has_metro: bool

class RiskResponse(BaseModel):
    score: int
    level: str
    confidence: int
    action: str
    priority: str
    rainfall: float
    drain_blockage: int
    elevation_factor: int
    vulnerability_index: str
    time_horizon: str

class WardRiskResponse(BaseModel):
    ward_id: int
    ward_name: str
    risk: RiskResponse

class PreparednessResponse(BaseModel):
    score: int
    label: str
    total_wards: int
    critical_wards: int
    high_wards: int
    medium_wards: int
    low_wards: int

# Load ward data (in production, this would come from a database)
def load_ward_data():
    import os
    # Try multiple paths to find the GeoJSON file
    possible_paths = [
        "../src/data/delhi_wards.geojson",
        "src/data/delhi_wards.geojson",
        os.path.join(os.path.dirname(__file__), "../src/data/delhi_wards.geojson")
    ]
    
    for path in possible_paths:
        try:
            with open(path, "r") as f:
                data = json.load(f)
                return data.get("features", [])
        except (FileNotFoundError, OSError):
            continue
    
    # Return mock data if file not found
    return []

@app.get("/")
async def root():
    return {
        "message": "FloodSense API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/risk/calculate", response_model=RiskResponse)
async def calculate_risk(request: RiskRequest):
    """
    Calculate flood risk for a specific ward or general risk
    """
    try:
        ward_data = None
        
        if request.ward_id:
            wards = load_ward_data()
            ward = next((w for w in wards if w["properties"].get("ward_id") == request.ward_id), None)
            if ward:
                props = ward["properties"]
                ward_data = {
                    "elevation_factor": props.get("elevation", 25),
                    "drain_blockage": props.get("drain_blockage", 40),
                    "vulnerability_index": props.get("vulnerability", 1.0),
                    "population_density": props.get("population_density", 0.5),
                    "has_hospitals": props.get("has_hospitals", False),
                    "has_schools": props.get("has_schools", False),
                    "has_metro": props.get("has_metro", False),
                    "ward_id": request.ward_id
                }
        
        risk_result = calculate_risk_score(
            request.rainfall,
            request.time_horizon,
            ward_data
        )
        
        return RiskResponse(**risk_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/risk/wards", response_model=List[WardRiskResponse])
async def calculate_ward_risks(request: RiskRequest):
    """
    Calculate flood risk for all wards
    """
    try:
        wards = load_ward_data()
        if not wards:
            raise HTTPException(status_code=404, detail="Ward data not found")
        
        ward_risks = generate_ward_risks(
            request.rainfall,
            request.time_horizon,
            wards
        )
        
        response = []
        for ward_risk in ward_risks:
            props = ward_risk.get("properties", {})
            risk = ward_risk.get("risk", {})
            
            response.append(WardRiskResponse(
                ward_id=props.get("ward_id", 0),
                ward_name=props.get("name", "Unknown"),
                risk=RiskResponse(**risk)
            ))
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/preparedness", response_model=PreparednessResponse)
async def get_preparedness(request: RiskRequest):
    """
    Calculate city-wide preparedness score
    """
    try:
        wards = load_ward_data()
        if not wards:
            raise HTTPException(status_code=404, detail="Ward data not found")
        
        ward_risks = generate_ward_risks(
            request.rainfall,
            request.time_horizon,
            wards
        )
        
        prep_result = calculate_preparedness(ward_risks)
        
        return PreparednessResponse(**prep_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/wards")
async def get_wards():
    """
    Get all ward information
    """
    try:
        wards = load_ward_data()
        return {
            "wards": [
                {
                    "ward_id": w["properties"].get("ward_id"),
                    "name": w["properties"].get("name"),
                    "elevation": w["properties"].get("elevation"),
                    "drain_blockage": w["properties"].get("drain_blockage"),
                    "vulnerability": w["properties"].get("vulnerability"),
                    "population_density": w["properties"].get("population_density"),
                    "has_hospitals": w["properties"].get("has_hospitals", False),
                    "has_schools": w["properties"].get("has_schools", False),
                    "has_metro": w["properties"].get("has_metro", False)
                }
                for w in wards
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

