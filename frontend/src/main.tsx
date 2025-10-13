import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Leaflet CSS (debe ir antes del App para que los estilos se carguen correctamente)
import 'leaflet/dist/leaflet.css';

// Fix de íconos de Leaflet para Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
