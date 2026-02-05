import apiClient from './apiClient';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCNq3eqK9-9uvzOY0CXtsHnx0oH2eOPdqU';

const googleMapsService = {
    /**
     * Lấy directions (route) từ điểm A đến B
     * @param {number} originLat 
     * @param {number} originLng 
     * @param {number} destLat 
     * @param {number} destLng 
     * @returns {Promise<Object>} Route data với distance, duration, và polyline
     */
    getDirections: async (originLat, originLng, destLat, destLng) => {
        try {
            const origin = `${originLat},${originLng}`;
            const destination = `${destLat},${destLng}`;
            
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;
            
            console.log('🗺️ Calling Directions API:', { origin, destination });
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('📍 Directions API status:', data.status);
            
            if (data.status === 'REQUEST_DENIED') {
                console.error('❌ API Key error:', data.error_message);
                throw new Error(data.error_message || 'Directions API not enabled');
            }
            
            if (data.status === 'OK' && data.routes.length > 0) {
                const route = data.routes[0];
                const leg = route.legs[0];
                
                console.log('✅ Route found:', leg.distance.text, leg.duration.text);
                
                return {
                    distance: leg.distance.text,
                    distanceValue: leg.distance.value, // meters
                    duration: leg.duration.text,
                    durationValue: leg.duration.value, // seconds
                    polyline: route.overview_polyline.points,
                    steps: leg.steps,
                };
            }
            
            throw new Error(`No routes found (${data.status})`);
        } catch (error) {
            console.error('Error getting directions:', error);
            throw error;
        }
    },

    /**
     * Decode polyline thành array of coordinates
     * @param {string} encoded 
     * @returns {Array<{latitude: number, longitude: number}>}
     */
    decodePolyline: (encoded) => {
        const points = [];
        let index = 0;
        const len = encoded.length;
        let lat = 0;
        let lng = 0;

        while (index < len) {
            let b;
            let shift = 0;
            let result = 0;
            
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            
            const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            
            const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            points.push({
                latitude: lat / 1e5,
                longitude: lng / 1e5,
            });
        }

        return points;
    },

    /**
     * Tính distance matrix giữa nhiều origins và destinations
     * @param {Array<{lat, lng}>} origins 
     * @param {Array<{lat, lng}>} destinations 
     * @returns {Promise<Object>}
     */
    getDistanceMatrix: async (origins, destinations) => {
        try {
            const originsStr = origins.map(o => `${o.lat},${o.lng}`).join('|');
            const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
            
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'OK') {
                return data;
            }
            
            throw new Error('Distance matrix request failed');
        } catch (error) {
            console.error('Error getting distance matrix:', error);
            throw error;
        }
    },
};

export default googleMapsService;
