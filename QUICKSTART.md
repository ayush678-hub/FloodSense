# 🚀 Quick Start Guide

## Frontend Setup (5 minutes)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - You should see the Delhi Flood Watch dashboard

## Backend Setup (Optional - 5 minutes)

The frontend works standalone, but you can also run the backend API:

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server:**
   ```bash
   python main.py
   ```

4. **Access API documentation:**
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## Using the Dashboard

### Basic Controls

1. **Rainfall Slider** (Left Panel)
   - Adjust from 0-200 mm to simulate different rainfall scenarios
   - Watch the map update in real-time

2. **Time Horizon** (Left Panel)
   - Select prediction window: 30 min, 1 hour, or 3 hours
   - Shorter horizons have higher confidence

3. **High-Risk Filter** (Left Panel)
   - Toggle to show only critical and high-risk wards
   - Map automatically zooms to high-risk areas

4. **Map Interaction**
   - Click any ward to see detailed risk information
   - Hover over wards for quick preview
   - Use the legend in bottom-right for reference

### Understanding the Display

**Risk Levels:**
- 🔴 **Critical** (Red): Immediate action required
- 🟠 **High** (Orange): Prepare for action
- 🟡 **Medium** (Yellow): Monitor closely
- 🟢 **Low** (Green): Normal monitoring

**Action Panel (Right Side):**
- **Preparedness Score**: Overall city readiness (0-100%)
- **Task Tickets**: Actionable items for high-risk wards
- **Risk Distribution**: Count of wards by risk level
- **Recommendations**: What should be done now

## Example Scenarios

### Scenario 1: Light Rain (20mm)
- Most wards show Low risk
- Preparedness score: 85-95%
- No critical actions needed

### Scenario 2: Moderate Rain (50mm)
- Some wards show Medium risk
- Preparedness score: 70-85%
- Monitor drains, keep pumps on standby

### Scenario 3: Heavy Rain (100mm)
- Multiple wards show High/Critical risk
- Preparedness score: 40-60%
- Task tickets generated for deployment

### Scenario 4: Extreme Rain (150mm+)
- Many wards show Critical risk
- Preparedness score: 20-40%
- Multiple task tickets with urgent actions

## Troubleshooting

### Map not loading?
- Check browser console for errors
- Ensure Leaflet CSS is loaded (should be automatic)
- Try refreshing the page

### Styling looks broken?
- Verify Tailwind CSS is installed: `npm list tailwindcss`
- Check that `postcss.config.js` exists
- Restart the development server

### Backend not connecting?
- Frontend works standalone - backend is optional
- If using backend, ensure it's running on port 8000
- Check CORS settings in `backend/main.py`

## Next Steps

1. **Customize Ward Data**: Edit `src/data/delhi_wards.geojson` with real Delhi ward boundaries
2. **Adjust Risk Weights**: Modify weights in `src/utils/riskEngine.js`
3. **Connect Real APIs**: Replace mock weather data with real weather API
4. **Add More Wards**: Expand the GeoJSON file with additional wards
5. **Deploy**: Build for production with `npm run build`

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review component code in `src/components/`
- Examine the risk engine in `src/utils/riskEngine.js`

---

**Happy Flood Monitoring! 🌧️**

