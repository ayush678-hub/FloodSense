# Delhi Flood Watch - Backend API

FastAPI backend for the Smart Urban Flood Management System.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check
- `GET /` - API information
- `GET /health` - Health check endpoint

### Risk Calculation
- `POST /api/risk/calculate` - Calculate risk for a specific ward
- `POST /api/risk/wards` - Calculate risk for all wards
- `POST /api/preparedness` - Get city-wide preparedness score

### Data
- `GET /api/wards` - Get all ward information

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Example Request

```bash
curl -X POST "http://localhost:8000/api/risk/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "rainfall": 75,
    "time_horizon": "1h",
    "ward_id": 1
  }'
```

