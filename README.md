# 🌧️ Delhi Flood Watch - Smart Urban Flood Management System

A predictive, time-aware, and action-oriented urban flood management system that enables city authorities to anticipate water-logging, assess ward-level risk with confidence, and take preventive action before disruption occurs.

## 🎯 Project Vision

This system moves beyond flood visualization to become a decision-support and operations-assist platform for monsoon management. It provides:

- **Predictive Risk Assessment**: Time-based flood risk predictions (30 min, 1 hour, 3 hours)
- **Ward-Level Granularity**: Detailed risk assessment for each Delhi ward
- **Confidence Scoring**: Each prediction includes a confidence level to help authorities judge reliability
- **Actionable Insights**: Converts alerts into task tickets with specific recommendations
- **Vulnerability-Aware**: Considers population density, hospitals, schools, and metro stations

## 🛠️ Technology Stack

### Frontend
- **React.js** - Component-based UI framework
- **Tailwind CSS** - Utility-first CSS framework for modern styling
- **Leaflet.js** (via react-leaflet) - Open-source map visualization
- **React Hooks** - State management and side effects

### Backend
- **FastAPI** - High-performance Python web framework
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - ASGI server

### Data Processing
- **GeoJSON** - Geographic data format for ward boundaries
- **Risk Engine** - Configurable risk scoring pipeline

## 📁 Project Structure

```
flood-frontend/
├── src/
│   ├── components/
│   │   ├── TopBar.jsx          # Top navigation bar with time and weather
│   │   ├── ControlPanel.jsx    # Left panel with controls and filters
│   │   ├── MapView.jsx         # Center map with ward visualization
│   │   └── ActionPanel.jsx     # Right panel with task tickets and preparedness
│   ├── data/
│   │   └── delhi_wards.geojson # Ward boundaries and properties
│   ├── utils/
│   │   ├── riskEngine.js       # Risk calculation engine
│   │   └── loadWards.js         # Ward data loader
│   ├── App.js                  # Main application component
│   ├── index.js                # Application entry point
│   └── index.css               # Global styles with Tailwind
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── risk_engine.py          # Backend risk calculation
│   ├── requirements.txt        # Python dependencies
│   └── README.md               # Backend documentation
├── public/
│   └── index.html              # HTML template
├── package.json                # Node.js dependencies
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Python 3.8+ (for backend)
- pip (Python package manager)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
python main.py
```

Or using uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🎮 Features

### 1. Command Center Dashboard

A "Mission Control" interface designed for quick decisions:

- **Top Bar**: Project title, real-time date/time, weather widget
- **Left Panel**: Controls for rainfall simulation, time horizon, filters, and replay mode
- **Center Map**: Interactive ward-level map with color-coded risk visualization
- **Right Panel**: Action center with task tickets, preparedness score, and recommendations

### 2. Risk Scoring Pipeline

The system uses a configurable risk scoring formula:

```
Risk Score = (Rainfall × w1) + (Elevation Factor × w2) + (Drain Blockage × w3)
Final Risk = Risk Score × Time Multiplier × Vulnerability Index
```

- **Configurable Weights**: Adjustable per ward based on local conditions
- **Time-Based Prediction**: Risk calculated for 30 min, 1 hour, or 3 hours ahead
- **Confidence Scoring**: Each prediction includes a confidence percentage
- **Vulnerability Adjustment**: Considers infrastructure and population density

### 3. Task Ticket System

Instead of generic alerts, the system generates actionable task tickets:

- **Location**: Specific ward name
- **Severity**: Critical, High, Medium, or Low
- **Recommended Action**: Specific steps to take
- **Time Window**: When action is needed
- **Risk Score & Confidence**: Data to support decision-making

### 4. Preparedness Score

City-wide preparedness visualization:
- Donut chart showing overall preparedness percentage
- Risk distribution across all wards
- Real-time updates based on current conditions

### 5. Interactive Map Features

- **Color-Coded Wards**: Visual risk indication (Red=Critical, Orange=High, Yellow=Medium, Green=Low)
- **Click for Details**: Detailed popup with risk metrics, confidence, and recommendations
- **Hover Effects**: Enhanced interactivity
- **Filter by Risk**: Show only high-risk wards
- **Legend**: Clear visual guide for risk levels

## 📊 Data Model

### Ward Properties

Each ward in the GeoJSON file includes:

- `ward_id`: Unique identifier
- `name`: Ward name
- `elevation`: Elevation factor (affects flood risk)
- `drain_blockage`: Percentage of blocked drains
- `vulnerability`: Base vulnerability index
- `population_density`: Population density (0-1)
- `has_hospitals`: Boolean flag
- `has_schools`: Boolean flag
- `has_metro`: Boolean flag

### Risk Assessment Output

```javascript
{
  score: 75,              // Risk score (0-100)
  level: "Critical",      // Risk level
  confidence: 85,         // Confidence percentage
  action: "Deploy 2 pumps & barricade roads immediately",
  priority: "critical",   // Priority level
  rainfall: 75,           // Input rainfall (mm)
  drainBlockage: 65,      // Drain blockage percentage
  elevationFactor: 18,    // Elevation factor
  vulnerabilityIndex: "1.50", // Adjusted vulnerability
  timeHorizon: "1h"       // Prediction time window
}
```

## 🔧 Configuration

### Risk Weights

Edit `src/utils/riskEngine.js` to adjust risk calculation weights:

```javascript
const w1 = 0.5; // Rainfall weight
const w2 = 0.2; // Elevation weight
const w3 = 0.3; // Drain blockage weight
```

### Time Multipliers

Adjust time-based risk multipliers:

```javascript
const timeMultiplier = 
  timeHorizon === "30m" ? 0.9 :
  timeHorizon === "1h" ? 1.0 : 
  timeHorizon === "3h" ? 1.15 : 1.0;
```

### Vulnerability Factors

Modify vulnerability adjustments in the risk engine:

```javascript
if (hasHospitals) vulnerabilityMultiplier += 0.15;
if (hasSchools) vulnerabilityMultiplier += 0.1;
if (hasMetro) vulnerabilityMultiplier += 0.1;
if (populationDensity > 0.7) vulnerabilityMultiplier += 0.1;
```

## 📡 API Endpoints

### Risk Calculation

**POST** `/api/risk/calculate`
```json
{
  "rainfall": 75,
  "time_horizon": "1h",
  "ward_id": 1
}
```

**POST** `/api/risk/wards`
```json
{
  "rainfall": 75,
  "time_horizon": "1h"
}
```

### Preparedness

**POST** `/api/preparedness`
```json
{
  "rainfall": 75,
  "time_horizon": "1h"
}
```

### Ward Data

**GET** `/api/wards` - Get all ward information

## 🎨 UI Components

### TopBar
- Real-time clock
- Weather widget (mock data, can be connected to real API)
- Project branding

### ControlPanel
- Rainfall simulation slider (0-200 mm)
- Time horizon selector (30 min / 1 hour / 3 hours)
- High-risk filter toggle
- Replay mode toggle
- System status indicator

### MapView
- Interactive Leaflet map
- GeoJSON ward visualization
- Color-coded risk levels
- Clickable popups with detailed information
- Risk legend
- Auto-zoom to high-risk wards when filtered

### ActionPanel
- Preparedness score (donut chart)
- Risk distribution statistics
- Task tickets list
- "What Should Be Done Now?" summary
- Selected ward details

## 🔮 Future Enhancements

- [ ] Real-time weather API integration
- [ ] Historical flood event replay
- [ ] Database integration (PostgreSQL + PostGIS)
- [ ] User authentication and role-based access
- [ ] Mobile-responsive design
- [ ] Export reports (PDF/Excel)
- [ ] Real-time sensor data integration
- [ ] Machine learning model integration
- [ ] Multi-city support
- [ ] Notification system (SMS/Email)

## 🤝 Contributing

This is a demonstration project. For production use, consider:

1. Adding proper error handling
2. Implementing data validation
3. Adding unit and integration tests
4. Setting up CI/CD pipeline
5. Adding logging and monitoring
6. Implementing caching for better performance
7. Adding database persistence
8. Implementing real-time updates (WebSockets)

## 📝 License

This project is for demonstration purposes.

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Leaflet.js for map visualization
- FastAPI for the backend framework
- React community for excellent tooling

---

**Built with ❤️ for Smart City Management**

