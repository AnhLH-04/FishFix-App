import React, { useState, useCallback } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from '../utils/debounce';

/**
 * Address Autocomplete Component
 * Sử dụng OpenStreetMap Nominatim API (Free, không cần API key)
 * Tự động suggest địa chỉ khi user gõ
 * Trả về địa chỉ + lat/lng
 */
export default function GooglePlacesAutocomplete({
    placeholder = 'Nhập địa chỉ...',
    onPlaceSelected,
    initialValue = '',
    style,
}) {
    const [inputValue, setInputValue] = useState(initialValue);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPredictions, setShowPredictions] = useState(false);

    /**
     * Gọi OpenStreetMap Nominatim Autocomplete API
     * Hoàn toàn miễn phí, không cần API key
     */
    const fetchPredictions = async (text) => {
        if (!text || text.length < 3) {
            setPredictions([]);
            return;
        }

        try {
            setLoading(true);
            
            // Use Nominatim API - Free and no API key required
            const url = `https://nominatim.openstreetmap.org/search?` + 
                `q=${encodeURIComponent(text)}&` +
                `countrycodes=vn&` +
                `format=json&` +
                `addressdetails=1&` +
                `limit=5&` +
                `accept-language=vi`;

            console.log('🔍 Searching places:', text);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'FishFixApp/1.0',
                },
            });

            const data = await response.json();

            if (data && data.length > 0) {
                // Transform to common format
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
                setPredictions(predictions);
                setShowPredictions(true);
            } else {
                setPredictions([]);
            }
        } catch (error) {
            console.error('❌ Error fetching predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce để tránh gọi API quá nhiều
    const debouncedFetchPredictions = useCallback(
        debounce((text) => fetchPredictions(text), 500),
        []
    );

    /**
     * Lấy chi tiết place từ prediction
     * Nominatim đã trả lat/lng trong search nên không cần call thêm
     */
    const getPlaceDetails = async (prediction) => {
        try {
            console.log('📍 Processing place:', prediction.description);

            const address = prediction.address || {};
            
            // Parse address components from Nominatim
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

            setInputValue(prediction.description);
            setShowPredictions(false);
            
            if (onPlaceSelected) {
                onPlaceSelected(placeData);
            }
        } catch (error) {
            console.error('❌ Error processing place:', error);
        }
    };

    const handleInputChange = (text) => {
        setInputValue(text);
        debouncedFetchPredictions(text);
    };

    const handleSelectPrediction = (prediction) => {
        getPlaceDetails(prediction);
    };

    const clearInput = () => {
        setInputValue('');
        setPredictions([]);
        setShowPredictions(false);
    };

    return (
        <View style={[styles.container, style]}>
            {/* Input Field */}
            <View style={styles.inputContainer}>
                <Ionicons name="location" size={20} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    onFocus={() => {
                        if (predictions.length > 0) {
                            setShowPredictions(true);
                        }
                    }}
                />
                {loading && <ActivityIndicator size="small" color="#FF6B35" />}
                {inputValue.length > 0 && !loading && (
                    <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Predictions List */}
            {showPredictions && predictions.length > 0 && (
                <View style={styles.predictionsContainer}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        scrollEnabled={true}
                        bounces={false}
                        contentContainerStyle={{ flexGrow: 1 }}
                    >
                        {predictions.map((item) => (
                            <TouchableOpacity
                                key={item.place_id}
                                style={styles.predictionItem}
                                onPress={() => handleSelectPrediction(item)}
                            >
                                <Ionicons name="location-outline" size={20} color="#666" />
                                <View style={styles.predictionText}>
                                    <Text style={styles.mainText} numberOfLines={1}>
                                        {item.structured_formatting.main_text}
                                    </Text>
                                    <Text style={styles.secondaryText} numberOfLines={1}>
                                        {item.structured_formatting.secondary_text}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 1000,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        padding: 5,
    },
    predictionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 12,
        marginTop: 5,
        height: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 1001,
    },
    predictionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    predictionText: {
        flex: 1,
        marginLeft: 10,
    },
    mainText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    secondaryText: {
        fontSize: 13,
        color: '#666',
    },
});
