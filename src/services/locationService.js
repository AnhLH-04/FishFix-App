import * as Location from 'expo-location';

/**
 * Location Service - Quản lý vị trí và địa chỉ
 */

const locationService = {
    /**
     * Xin quyền truy cập location
     */
    requestLocationPermission: async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting location permission:', error);
            return false;
        }
    },

    /**
     * Lấy vị trí hiện tại
     * @returns {Promise<{latitude: number, longitude: number}>}
     */
    getCurrentLocation: async () => {
        try {
            const hasPermission = await locationService.requestLocationPermission();
            if (!hasPermission) {
                throw new Error('Không có quyền truy cập vị trí');
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: 15000,
                maximumAge: 10000,
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (error) {
            console.error('Error getting current location:', error);
            throw error;
        }
    },

    /**
     * Chuyển đổi latitude/longitude thành địa chỉ (Reverse Geocoding)
     * @param {number} latitude
     * @param {number} longitude
     * @returns {Promise<Object>}
     */
    reverseGeocode: async (latitude, longitude) => {
        try {
            const results = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (results && results.length > 0) {
                const address = results[0];
                return {
                    fullAddress: formatAddress(address),
                    street: address.street || '',
                    ward: address.subregion || address.district || '',
                    district: address.city || address.subregion || '',
                    city: address.region || 'TP. Hồ Chí Minh',
                    country: address.country || 'Vietnam',
                    latitude,
                    longitude,
                };
            }

            return null;
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            throw error;
        }
    },

    /**
     * Lấy vị trí và địa chỉ hiện tại
     * @returns {Promise<Object>}
     */
    getCurrentLocationWithAddress: async () => {
        try {
            const location = await locationService.getCurrentLocation();
            const address = await locationService.reverseGeocode(
                location.latitude,
                location.longitude
            );
            return address;
        } catch (error) {
            console.error('Error getting location with address:', error);
            
            // Fallback: Dùng location mặc định cho development (Sài Gòn)
            console.log('⚠️ Using default location (HCM City) for development');
            return locationService.getMockLocation();
        }
    },

    /**
     * Mock location cho development/testing (TP.HCM)
     * @returns {Object}
     */
    getMockLocation: () => {
        return {
            fullAddress: '123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh',
            street: '123 Nguyễn Văn Linh',
            ward: 'Phường Tân Phú',
            district: 'Quận 7',
            city: 'TP. Hồ Chí Minh',
            country: 'Vietnam',
            latitude: 10.7329568,
            longitude: 106.7172876,
        };
    },

    /**
     * Tính khoảng cách giữa 2 điểm (km)
     * @param {number} lat1
     * @param {number} lon1
     * @param {number} lat2
     * @param {number} lon2
     * @returns {number} Khoảng cách (km)
     */
    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of Earth in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return Math.round(distance * 10) / 10; // Làm tròn 1 chữ số
    },

    /**
     * Tính thời gian ước tính di chuyển (phút)
     * Dựa trên khoảng cách và tốc độ trung bình
     * @param {number} distanceKm - Khoảng cách (km)
     * @param {number} speedKmPerHour - Tốc độ TB (km/h), default 30km/h (trong thành phố)
     * @returns {number} Thời gian (phút)
     */
    calculateTravelTime: (distanceKm, speedKmPerHour = 30) => {
        const timeInHours = distanceKm / speedKmPerHour;
        const timeInMinutes = timeInHours * 60;
        return Math.round(timeInMinutes);
    },

    /**
     * Format khoảng cách thành chuỗi hiển thị
     * @param {number} distanceKm
     * @returns {string} "1.5 km" hoặc "500 m"
     */
    formatDistance: (distanceKm) => {
        if (distanceKm < 1) {
            const meters = Math.round(distanceKm * 1000);
            return `${meters} m`;
        }
        return `${distanceKm} km`;
    },

    /**
     * Lấy URL Google Maps Direction
     * @param {number} fromLat - Vị trí xuất phát (latitude)
     * @param {number} fromLng - Vị trí xuất phát (longitude)
     * @param {number} toLat - Vị trí đích (latitude)
     * @param {number} toLng - Vị trí đích (longitude)
     * @returns {string} URL để mở Google Maps navigation
     */
    getDirectionsUrl: (fromLat, fromLng, toLat, toLng) => {
        return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=driving`;
    },

    /**
     * Mở Google Maps để xem đường đi
     * @param {number} fromLat
     * @param {number} fromLng
     * @param {number} toLat
     * @param {number} toLng
     */
    openDirections: (fromLat, fromLng, toLat, toLng) => {
        const url = locationService.getDirectionsUrl(fromLat, fromLng, toLat, toLng);
        // Trong React Native, dùng Linking.openURL(url)
        return url;
    },
};

/**
 * Helper function: Format địa chỉ
 */
const formatAddress = (address) => {
    const parts = [];
    
    if (address.street) parts.push(address.street);
    if (address.streetNumber) parts.push(address.streetNumber);
    if (address.district || address.subregion) parts.push(address.district || address.subregion);
    if (address.city) parts.push(address.city);
    if (address.region && address.region !== address.city) parts.push(address.region);
    
    return parts.join(', ') || 'Địa chỉ không xác định';
};

/**
 * Helper function: Convert degrees to radians
 */
const toRad = (value) => {
    return (value * Math.PI) / 180;
};

export default locationService;
