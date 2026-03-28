import apiClient from './apiClient';

/**
 * Location Services using FREE APIs:
 * - Nominatim (OpenStreetMap) for geocoding
 * - OSRM (Open Source Routing Machine) for routing
 * No API key or billing account required!
 */

const googleMapsService = {
    /**
     * Lấy directions (route) từ điểm A đến B
     * Sử dụng OSRM (Free, no API key needed)
     * @param {number} originLat 
     * @param {number} originLng 
     * @param {number} destLat 
     * @param {number} destLng 
     * @returns {Promise<Object>} Route data với distance, duration, và polyline
     */
    getDirections: async (originLat, originLng, destLat, destLng) => {
        try {
            // Use OSRM for routing (free!)
            const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=polyline&steps=true`;
            
            console.log('🗺️ Calling OSRM API:', { origin: `${originLat},${originLng}`, destination: `${destLat},${destLng}` });
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'FishFixApp/1.0',
                },
            });
            const data = await response.json();
            
            if (data.code === 'Ok' && data.routes.length > 0) {
                const route = data.routes[0];
                const leg = route.legs[0];
                
                // Convert meters to km, seconds to minutes
                const distanceKm = (route.distance / 1000).toFixed(1);
                const durationMin = Math.round(route.duration / 60);
                
                console.log('✅ Route found:', `${distanceKm} km`, `${durationMin} phút`);
                
                return {
                    distance: `${distanceKm} km`,
                    distanceValue: Math.round(route.distance), // meters
                    duration: `${durationMin} phút`,
                    durationValue: Math.round(route.duration), // seconds
                    polyline: route.geometry, // encoded polyline
                    steps: leg.steps || [],
                };
            }
            
            throw new Error(`No routes found (${data.code})`);
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
     * Sử dụng OSRM Table service (Free)
     * @param {Array<{lat, lng}>} origins 
     * @param {Array<{lat, lng}>} destinations 
     * @returns {Promise<Object>}
     */
    getDistanceMatrix: async (origins, destinations) => {
        try {
            // OSRM Table service combines sources and destinations
            const coordinates = [...origins, ...destinations]
                .map(coord => `${coord.lng},${coord.lat}`)
                .join(';');
            
            const sourcesIdx = origins.map((_, i) => i).join(';');
            const destinationsIdx = destinations.map((_, i) => i + origins.length).join(';');
            
            const url = `https://router.project-osrm.org/table/v1/driving/${coordinates}?sources=${sourcesIdx}&destinations=${destinationsIdx}`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'FishFixApp/1.0',
                },
            });
            const data = await response.json();
            
            if (data.code === 'Ok') {
                return {
                    status: 'OK',
                    rows: data.durations.map((row, i) => ({
                        elements: row.map((duration, j) => ({
                            distance: {
                                value: data.distances[i][j],
                                text: `${(data.distances[i][j] / 1000).toFixed(1)} km`,
                            },
                            duration: {
                                value: Math.round(duration),
                                text: `${Math.round(duration / 60)} phút`,
                            },
                            status: 'OK',
                        })),
                    })),
                };
            }
            
            throw new Error('Distance matrix request failed');
        } catch (error) {
            console.error('Error getting distance matrix:', error);
            throw error;
        }
    },

    /**
     * Search places using Nominatim (Free, no API key!)
     * @param {string} input - Search query
     * @param {string} country - Country code (default: 'vn')
     * @returns {Promise<Array>} List of predictions
     */
    searchPlaces: async (input, country = 'vn') => {
        try {
            if (!input || input.length < 3) {
                return [];
            }

            const url = `https://nominatim.openstreetmap.org/search?` + 
                `q=${encodeURIComponent(input)}&` +
                `countrycodes=${country}&` +
                `format=json&` +
                `addressdetails=1&` +
                `limit=5&` +
                `accept-language=vi`;

            console.log('🔍 Searching places:', input);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'FishFixApp/1.0',
                },
            });

            const data = await response.json();

            if (data && data.length > 0) {
                const predictions = data.map(place => ({
                    place_id: place.place_id,
                    description: place.display_name,
                    structured_formatting: {
                        main_text: place.name || place.display_name.split(',')[0],
                        secondary_text: place.display_name.split(',').slice(1).join(',').trim(),
                    },
                    lat: parseFloat(place.lat),
                    lon: parseFloat(place.lon),
                    address: place.address,
                }));
                
                console.log('✅ Found', predictions.length, 'predictions');
                return predictions;
            }
            
            return [];
        } catch (error) {
            console.error('Error searching places:', error);
            throw error;
        }
    },

    /**
     * Get place details from Nominatim
     * Since Nominatim returns all data in search, this is simplified
     * @param {Object} prediction - Prediction object from searchPlaces
     * @returns {Promise<Object>} Place details with coordinates and address components
     */
    getPlaceDetails: async (prediction) => {
        try {
            console.log('📍 Processing place details:', prediction.description);

            const address = prediction.address || {};
            
            const placeData = {
                address: prediction.description,
                street: address.road || address.street || prediction.structured_formatting.main_text,
                ward: address.suburb || address.neighbourhood || '',
                district: address.city_district || address.county || '',
                city: address.city || address.state || 'TP. Hồ Chí Minh',
                latitude: prediction.lat,
                longitude: prediction.lon,
                placeId: prediction.place_id?.toString() || '',
            };

            console.log('✅ Place details:', placeData);
            return placeData;
        } catch (error) {
            console.error('Error getting place details:', error);
            throw error;
        }
    },

    /**
     * Reverse geocoding - Get address from lat/lng
     * Sử dụng Nominatim (Free!)
     * @param {number} latitude 
     * @param {number} longitude 
     * @returns {Promise<Object>} Address information
     */
    reverseGeocode: async (latitude, longitude) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?` +
                `format=json&` +
                `lat=${latitude}&` +
                `lon=${longitude}&` +
                `addressdetails=1&` +
                `accept-language=vi`;

            console.log('🔄 Reverse geocoding:', { latitude, longitude });

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'FishFixApp/1.0',
                },
            });
            const data = await response.json();

            if (data && data.address) {
                const address = data.address;

                return {
                    address: data.display_name,
                    street: address.road || address.street || '',
                    ward: address.suburb || address.neighbourhood || '',
                    district: address.city_district || address.county || '',
                    city: address.city || address.state || 'TP. Hồ Chí Minh',
                    latitude: latitude,
                    longitude: longitude,
                };
            } else {
                throw new Error('No results found');
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            throw error;
        }
    },
};

export default googleMapsService;
