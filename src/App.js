import './App.css';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom marker icon for better UI visibility
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom marker setup
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const unsplashApiKey = 'YOUR_UNSPLASH_API_KEY'; // Replace with your Unsplash API key

  const getLocation = () => {
    const geo = navigator.geolocation;

    if (geo) {
      geo.getCurrentPosition(
        async (position) => {
          let userLatitude = position.coords.latitude;
          let userLongitude = position.coords.longitude;
          setLatitude(userLatitude);
          setLongitude(userLongitude);

          // Fetch the full address using OpenStreetMap's Nominatim API
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLatitude}&lon=${userLongitude}&addressdetails=1`
            );
            const data = await response.json();
            const formattedAddress = data.display_name;
            setAddress(formattedAddress);

            // Extract city name from address components (if available)
            const city = data.address.city || data.address.town || data.address.village || '';
            if (city) {
              // Fetch a photo from Unsplash based on the city name
              const photoResponse = await fetch(
                `https://api.unsplash.com/search/photos?query=${city}&client_id=${unsplashApiKey}`
              );
              const photoData = await photoResponse.json();
              if (photoData.results.length > 0) {
                setPhotoUrl(photoData.results[0].urls.regular);
              } else {
                setPhotoUrl(''); // No photo found
              }
            }
          } catch (error) {
            console.error("Error fetching the address or photo:", error);
            setErrorMessage("Failed to retrieve the address or photo.");
          }
        },
        (error) => {
          setErrorMessage("Error getting location: " + error.message);
          console.error("Error getting location:", error);
        }
      );
    } else {
      setErrorMessage("Geolocation is not supported by this browser.");
      console.log("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Your Current Location</h1>
        <button className="location-button" onClick={getLocation}>
          Get Location
        </button>
        {latitude && longitude ? (
          <>
            <div className="address-card">
              <p><strong>Full Address:</strong> {address}</p>
              {photoUrl && <img src={photoUrl} alt="Current location" className="location-photo" />}
            </div>
            <MapContainer center={[latitude, longitude]} zoom={15} className="map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[latitude, longitude]}>
                <Popup>
                  <strong>You are here:</strong> <br /> {address || "Your current location"}
                </Popup>
              </Marker>
            </MapContainer>
          </>
        ) : (
          <p className="message">{errorMessage || "Press the button to get your current location."}</p>
        )}
      </div>
    </div>
  );
}

export default App;
