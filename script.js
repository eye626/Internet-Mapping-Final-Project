// Initialize Leaflet map
const map = L.map('map').setView([43.2407075, -79.8668676], 18);
// Add OpenStreetMap basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
//taken from arcgis onlino: https://mohawkarcgis.maps.arcgis.com/home/item.html?sortField=modified&sortOrder=desc&view=table&folder=5b17fb97b9ea4c4f8311f70f81332a7b&id=f951627da7fb4ec88d4990b01788a780
const baseUrl = 'https://services7.arcgis.com/AHJOWTX3sFcnmA9U/arcgis/rest/services/Final_Project_Web_Layers/FeatureServer';
const layerGroups = {};

//point layers
const pointLayers = [
  { id: 0, name: 'Addresses',                key: 'addresses',   color: '#e74c3c', emoji: '📍', hidden: true  },
  { id: 1, name: 'Bike Parking',             key: 'bikeParking', color: '#3498db', emoji: '🚲', hidden: true  },
  { id: 2, name: 'Development Applications', key: 'devApps',     color: '#9b59b6', emoji: '🏗️', hidden: false },
  { id: 3, name: 'HSR Bus Stops',            key: 'busStops',    color: '#e67e22', emoji: '🚌', hidden: true  }
];

pointLayers.forEach(layer => {
  const emojiIcon = L.divIcon({
    html: `<span style="font-size:18px;line-height:1;">${layer.emoji}</span>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  //popup info
  fetch(`${baseUrl}/${layer.id}/query?where=1%3D1&outFields=*&f=geojson`)
    .then(response => response.json())
    .then(data => {
      console.log(`${layer.name} properties:`, data.features[0]?.properties);
      const geoLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => L.marker(latlng, { icon: emojiIcon }),
        onEachFeature: (feature, mapLayer) => {
          const p = feature.properties;
          let popupContent = '';
          //takes the stright json array and formates it properly for each layer
          if (layer.key === 'addresses') {
            popupContent = `
              <h3>📍 Address</h3>
              <p>
                <strong>Street:</strong> ${p.FULL_STREE || 'N/A'}<br>
                <strong>Unit:</strong> ${p.UNIT_NUMBE?.trim() || 'N/A'}<br>
                <strong>Community:</strong> ${p.COMMUNITY?.trim() || 'N/A'}<br>
                <strong>Settlement:</strong> ${p.SETTLEMENT?.trim() || 'N/A'}<br>
                <strong>Municipality:</strong> ${p.MUNICIPALI?.trim() || 'N/A'}<br>
                <strong>Postal Code:</strong> ${p.POSTAL_COD?.trim() || 'N/A'}<br>
                <strong>Province:</strong> ${p.PROVINCE || 'N/A'}<br>
                <strong>Country:</strong> ${p.COUNTRY || 'N/A'}
              </p>
            `;
          } else if (layer.key === 'bikeParking') {
            popupContent = `
              <h3>🚲 Bike Parking</h3>
              <p>
                <strong>Location:</strong> ${p.LOCATION_N || 'N/A'}<br>
                <strong>Rack Type:</strong> ${p.RACK_TYPE || 'N/A'}<br>
                <strong>Owner:</strong> ${p.RACK_OWNER || 'N/A'}<br>
                <strong>Total Capacity:</strong> ${p.TOTAL_CAPA || 'N/A'}<br>
                <strong>Racks Installed:</strong> ${p.RACKS_INST || 'N/A'}<br>
                <strong>Covered:</strong> ${p.COVERED || 'N/A'}<br>
                <strong>Nearby Lighting:</strong> ${p.NEARBY_LIG || 'N/A'}<br>
                <strong>Ward:</strong> ${p.WARD || 'N/A'}
              </p>
            `;
          } else if (layer.key === 'devApps') {
            popupContent = `
              <h3>🏗️ Development Application</h3>
              <p>
                <strong>File Number:</strong> ${p.FILE_NUM || 'N/A'}<br>
                <strong>File Type:</strong> ${p.FILE_TYPE || 'N/A'}<br>
                <strong>Year:</strong> ${p.FILE_YEAR || 'N/A'}<br>
                <strong>Address:</strong> ${p.ADDRESS?.trim() || 'N/A'}<br>
                <strong>Description:</strong> ${p.DESCRIP || 'N/A'}
              </p>
            `;
          } else if (layer.key === 'busStops') {
            popupContent = `
              <h3>🚌 HSR Bus Stop</h3>
              <p>
                <strong>Stop Name:</strong> ${p.STOP_NAME || 'N/A'}<br>
                <strong>Stop Number:</strong> ${p.STOP_NUMBE || 'N/A'}<br>
                <strong>On Street:</strong> ${p.ON_STREET || 'N/A'}<br>
                <strong>At Street:</strong> ${p.AT_STREET || 'N/A'}<br>
                <strong>Routes:</strong> ${p.ROUTES_AND || 'N/A'}<br>
                <strong>Shelter:</strong> ${p.SHELTER || 'N/A'}<br>
                <strong>Bench:</strong> ${p.BENCH || 'N/A'}<br>
                <strong>Bike Rack:</strong> ${p.BICYCLE_RA || 'N/A'}<br>
                <strong>Washroom:</strong> ${p.WASHROOM || 'N/A'}
              </p>
            `;
          }
          mapLayer.bindPopup(popupContent);
        }
      });
      if (!layer.hidden) {
        geoLayer.addTo(map);
      }
      layerGroups[layer.key] = geoLayer;
    })
});

//line layers
const lineLayers = [
  { id: 4, name: 'Bikeways',       key: 'bikeways',  color: '#3498db', weight: 2 },
  { id: 5, name: 'HSR Bus Routes', key: 'busRoutes', color: '#e67e22', weight: 3 },
  { id: 6, name: 'Trails',         key: 'trails',    color: '#2ecc71', weight: 2 }
];

//line infor
lineLayers.forEach(layer => {
  fetch(`${baseUrl}/${layer.id}/query?where=1%3D1&outFields=*&f=geojson`)
    .then(response => response.json())
    .then(data => {
      console.log(`${layer.name} properties:`, data.features[0]?.properties);
      const geoLayer = L.geoJSON(data, {
        style: {
          color: layer.color,
          weight: layer.weight,
          opacity: 0.8
        },
        onEachFeature: (feature, mapLayer) => {
          const p = feature.properties;
          let popupContent = '';
          if (layer.key === 'busRoutes') {
            popupContent = `
              <h3>🚍 HSR Bus Route</h3>
              <p>
                <strong>Route Number:</strong> ${p.LINE_NUMBE || 'N/A'}<br>
                <strong>Route Name:</strong> ${p.LINE_NAME || 'N/A'}
              </p>
            `;
          } else {
            popupContent = `<h3>${layer.name}</h3>`;
          }
          mapLayer.bindPopup(popupContent);
        }
      }).addTo(map);
      layerGroups[layer.key] = geoLayer;
    })
});

//polygon layers
fetch(`${baseUrl}/8/query?where=1%3D1&outFields=*&f=geojson`)
  .then(response => response.json())
  .then(data => {
    console.log('Zoning properties:', data.features[0]?.properties);
    const geoLayer = L.geoJSON(data, {
      style: {
        color: '#1abc9c',
        fillColor: '#1abc9c',
        fillOpacity: 0.3,
        weight: 2
      },
      onEachFeature: (feature, mapLayer) => {
        const p = feature.properties;
        mapLayer.bindPopup(`
          <h3>🗺️ Zoning By-law Boundary</h3>
          <p>
            <strong>Zoning Code:</strong> ${p.ZONING_COD || 'N/A'}<br>
            <strong>Zoning Description:</strong> ${p.ZONING_DES || 'N/A'}
          </p>
        `);
      }
    }).addTo(map);
    layerGroups['zoning'] = geoLayer;
  })
  .then(() => {
    return fetch(`${baseUrl}/7/query?where=1%3D1&outFields=*&f=geojson`);
  })
  .then(response => response.json())
  .then(data => {
    console.log('Upper Wellington properties:', data.features[0]?.properties);
    const geoLayer = L.geoJSON(data, {
      style: {
        color: '#f39c12',
        fillColor: '#f39c12',
        fillOpacity: 0.3,
        weight: 2
      },
      onEachFeature: (feature, mapLayer) => {
        const p = feature.properties;
        mapLayer.bindPopup(`
          <h3>🏢 500 Upper Wellington</h3>
          <p>
            <strong>Area:</strong> ${p.Shape__Area ? p.Shape__Area.toFixed(2) + ' m²' : 'N/A'}<br>
            <strong>Perimeter:</strong> ${p.Shape__Length ? p.Shape__Length.toFixed(2) + ' m' : 'N/A'}<br>
            <strong>Description:</strong> To demolish the existing structure and development of 6-storey
            multi use 264 residential units with commercial along Upper Wellington and 2-levels of structured
            parking accomodating 257 parking spaces<br>
            <strong>Current Status:</strong> Construction was approved and is nearing completion
          </p>
        `);
      }
    }).addTo(map);
    layerGroups['upperWellington'] = geoLayer;
  })

//hide buttons
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.layer;
    const layer = layerGroups[key];
    if (!layer) return;
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
      btn.classList.add('inactive');
      btn.textContent = 'Show';
      btn.closest('.legend-item').classList.add('inactive');
    } else {
      map.addLayer(layer);
      btn.classList.remove('inactive');
      btn.textContent = 'Hide';
      btn.closest('.legend-item').classList.remove('inactive');
    }
  });
});