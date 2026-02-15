# Godavari River - Historical Floods & Simulation Notes

## Accurate River Path Through Nashik

Based on Wikipedia research and geographic analysis:

### Course Description
- **Origin**: Gangapur Dam (73.72°E, 20.01°N) - 8km upstream from Nashik
- **Terrain**: Rocky bed with chasms creating Gangapur & Someshwar (Dudhsagar) waterfalls
- **Sharp Bend**: About 0.5km south of Nashik, river bends sharply to the east
- **Notable Features**: 
  - Flows past Mughal fort cliff (eroding from floods)
  - Washes base of high cliffs in Nashik
  - Passes through Ram Kund and sacred ghats
  - 4-6m high greyish banks topped with black soil

### Major Flood Events

#### 1986 Flood - Record Breaking
- **Discharge**: 3.6 million cusecs (recorded flood of highest magnitude in India)
- **Impact**: Catastrophic flooding across basin
- **Significance**: Highest recorded flood in Godavari history

#### 2005 Flood - Bhadrachalam
- **Event**: Major flooding in Andhra Pradesh
- **Notable Image**: Bhadrachalam Temple submerged
- **Cause**: Heavy monsoon rainfall

#### 2006 Flood
- **Discharge Data**: Moderate flood year
- **Area Affected**: Multiple districts

#### 2019 Recent Flood
- **Cause**: Above normal monsoon
- **Impact**: Urban flooding in Nashik region

### Annual Flood Patterns
- **Normal Annual Flood**: 1.0 million cusecs
- **Monsoon Dependent**: 50% water availability harnessed
- **Peak Flow**: Typically July-September

## Flood Causes & Factors

### Natural Causes
1. **Monsoon Intensity**
   - Heavy rainfall in Western Ghats catchment
   - Rapid runoff from basalt formations
   - Concentrated rainfall in short duration

2. **Topography**
   - Steep gradients from source (920m) to plains
   - Rocky channel with limited absorption
   - Deccan basalt creates rapid runoff

3. **Basin Characteristics**
   - 312,812 km² drainage area (10% of India)
   - Multiple tributaries converging
   - Limited natural retention areas

### Human Factors
1. **Dam Operations**
   - Gangapur Dam releases during heavy inflow
   - Synchronized releases from multiple dams
   - Limited storage capacity vs. peak flows

2. **Urbanization**
   - Encroachment on floodplains
   - Reduced percolation in urban areas
   - Changed drainage patterns

3. **Deforestation**
   - Reduced forest cover in catchment
   - Increased soil erosion
   - Faster runoff

## Ecological Context

### River Characteristics
- **Width**: Normal 150m, Flood up to 1200m
- **Riverbed Elevation**: ~585m MSL at Nashik
- **Banks**: 4-6m high with deep black soil layer
- **Bed**: Rocky with gravel, exposes flood basalt

### Sacred Significance
- **Ram Kund**: Major bathing ghat (592.5m MSL)
- **Panchvati**: Ancient pilgrimage site (595.3m MSL)
- **Godavari Bridge**: Critical infrastructure (588m MSL)
- **Known as**: Dakshina Ganga (Southern Ganges)

## Simulation Approach

### Professional Methods (HEC-RAS style)
1. **Cross-Section Based**: Define river cross-sections at intervals
2. **Manning's Equation**: Roughness coefficient for flow velocity
3. **DEM Integration**: Digital Elevation Model for terrain
4. **1D/2D Coupling**: Channel flow + overbank flooding

### Our Implementation
1. **River Centerline**: Traced from accurate geographic data
2. **Perpendicular Expansion**: Banks expand perpendicular to flow direction
3. **Depth-Width Relationship**: Exponential growth formula
4. **Visual Realism**: Color coding by severity (cyan → blue → amber → red)

### Key Parameters
- Normal Width: 150m
- Maximum Flood Width: 1200m  
- Riverbed Elevation: 585m MSL
- Critical Flood Level: 600m MSL (15m depth)
- Bank Height: 4-6m

## Risk Assessment

### High Risk Areas (Elevation < 595m MSL)
1. **Tapovan Area** (590.1m) - Lowest elevation, critical risk
2. **Godavari Bridge** (588m) - Infrastructure at risk
3. **Ram Kund** (592.5m) - Sacred site, very high risk

### Moderate Risk (595-600m MSL)
1. **Kalarama Temple** (598.2m)
2. **Panchvati** (595.3m)

### Lower Risk (> 600m MSL)
1. **Nashik City Center** (602.3m)
2. **Upper elevation areas**

## Data Sources
- Wikipedia: Godavari River article
- Central Water Commission: Flow data
- HEC-RAS methodologies
- Geographic coordinates from maps

---

**Note**: This simulation provides visual approximation of flood extent. For critical infrastructure decisions, consult professional hydrological models (HEC-RAS, MIKE FLOOD, etc.) with actual DEM data and field measurements.
