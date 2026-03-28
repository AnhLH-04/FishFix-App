import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/jobService';
import locationService from '../../services/locationService';
import googleMapsService from '../../services/googleMapsService';

const JobMapScreen = ({ navigation, route }) => {
    const { categoryId } = route.params || {};
    const { userLocation } = useAuth();
    const mapRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);
    const [technicianLocation, setTechnicianLocation] = useState(null);

    const toNumber = (value) => {
        const n = typeof value === 'string' ? parseFloat(value) : value;
        return Number.isFinite(n) ? n : null;
    };

    const isValidCoordinate = (latitude, longitude) => {
        const lat = toNumber(latitude);
        const lng = toNumber(longitude);

        if (lat === null || lng === null) return false;
        if (lat < -90 || lat > 90) return false;
        if (lng < -180 || lng > 180) return false;
        return true;
    };

    const normalizeCoordinate = (latitude, longitude) => {
        if (!isValidCoordinate(latitude, longitude)) return null;
        return {
            latitude: toNumber(latitude),
            longitude: toNumber(longitude),
        };
    };

    useEffect(() => {
        initMap();
    }, []);

    const initMap = async () => {
        try {
            setLoading(true);
            
            // Lấy vị trí thợ
            const rawLocation = userLocation || locationService.getMockLocation();
            const location = normalizeCoordinate(rawLocation?.latitude, rawLocation?.longitude)
                ? {
                    ...rawLocation,
                    ...normalizeCoordinate(rawLocation.latitude, rawLocation.longitude),
                }
                : locationService.getMockLocation();
            
            console.log('🗺️ JobMapScreen - Technician location:', {
                source: userLocation ? 'Real GPS' : 'Mock Location',
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.fullAddress || 'N/A',
            });
            
            const techCoordinate = normalizeCoordinate(location.latitude, location.longitude);
            setTechnicianLocation(techCoordinate);

            // Lấy danh sách jobs
            await fetchNearbyJobs(location);
        } catch (error) {
            console.error('Error initializing map:', error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const fetchNearbyJobs = async (location) => {
        try {
            const availableJobs = await jobService.getAvailableJobs({ categoryId });

            console.log(`📍 Found ${availableJobs.length} jobs`);

            const formattedJobs = availableJobs
                .map(job => {
                    const coordinate = normalizeCoordinate(job.latitude, job.longitude);

                    if (!coordinate) {
                        console.warn(`⚠️ Skip job without valid coordinate: ${job.title} (${job.latitude}, ${job.longitude})`);
                        return null;
                    }

                    const distance = locationService.calculateDistance(
                        location.latitude,
                        location.longitude,
                        coordinate.latitude,
                        coordinate.longitude
                    );

                    console.log(`📍 Job "${job.title}": ${coordinate.latitude}, ${coordinate.longitude} → Distance: ${distance.toFixed(2)} km`);

                    return {
                        ...job,
                        latitude: coordinate.latitude,
                        longitude: coordinate.longitude,
                        distance,
                        distanceText: locationService.formatDistance(distance),
                        coordinate,
                    };
                })
                .filter(Boolean)
                .sort((a, b) => a.distance - b.distance);

            setJobs(formattedJobs);

            // Fit map to show all markers - prioritize jobs location over technician mock location
            if (formattedJobs.length > 0) {
                // Nếu có jobs, center map vào jobs
                const allCoordinates = formattedJobs
                    .map(j => j.coordinate)
                    .filter(c => isValidCoordinate(c?.latitude, c?.longitude));
                
                // Chỉ thêm technician location nếu không phải mock location
                if (
                    userLocation &&
                    userLocation.latitude !== 10.7329568 &&
                    technicianLocation &&
                    isValidCoordinate(technicianLocation.latitude, technicianLocation.longitude)
                ) {
                    allCoordinates.unshift({ latitude: location.latitude, longitude: location.longitude });
                }
                
                setTimeout(() => {
                    if (mapRef.current && mapReady) {
                        mapRef.current.fitToCoordinates(allCoordinates, {
                            edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                            animated: true,
                        });
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            throw error;
        }
    };

    const handleJobPress = async (job) => {
        if (!technicianLocation || !isValidCoordinate(technicianLocation.latitude, technicianLocation.longitude)) {
            Alert.alert('Lỗi vị trí', 'Không lấy được vị trí hiện tại của bạn.');
            return;
        }
        if (!job?.coordinate || !isValidCoordinate(job.coordinate.latitude, job.coordinate.longitude)) {
            Alert.alert('Lỗi dữ liệu', 'Công việc này chưa có tọa độ hợp lệ.');
            return;
        }

        setSelectedJob(job);
        setRouteInfo(null);
        setRouteCoordinates([]);

        // Show distance even without route
        const distance = locationService.calculateDistance(
            technicianLocation.latitude,
            technicianLocation.longitude,
            job.latitude,
            job.longitude
        );
        const travelTime = locationService.calculateTravelTime(distance);
        
        setRouteInfo({
            distance: locationService.formatDistance(distance),
            duration: `${travelTime} phút`,
        });

        try {
            // Lấy route từ Google Directions API
            const directions = await googleMapsService.getDirections(
                technicianLocation.latitude,
                technicianLocation.longitude,
                job.latitude,
                job.longitude
            );

            // Decode polyline
            const routePoints = googleMapsService.decodePolyline(directions.polyline);
            setRouteCoordinates(routePoints);
            
            // Update với data từ Google API
            setRouteInfo({
                distance: directions.distance,
                duration: directions.duration,
            });

            // Fit map to route
            mapRef.current?.fitToCoordinates(
                [technicianLocation, job.coordinate],
                {
                    edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                    animated: true,
                }
            );
        } catch (error) {
            console.error('Error getting route:', error);
            // Vẫn hiển thị job detail với distance tính toán được
            // Không cần Alert, vì đã có distance info
            
            // Fit map to show both points
            if (mapRef.current && mapReady) {
                try {
                    mapRef.current.fitToCoordinates(
                        [technicianLocation, job.coordinate],
                        {
                            edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                            animated: true,
                        }
                    );
                } catch (fitError) {
                    console.error('Error fitting map:', fitError);
                }
            }
        }
    };

    const handleAcceptJob = () => {
        if (!selectedJob) return;
        
        navigation.navigate('JobDetail', { jobId: selectedJob.jobId });
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'low': return '#4CAF50';
            case 'medium': return '#FF9800';
            case 'high': return '#FF5722';
            case 'emergency': return '#F44336';
            default: return '#999';
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Jobs Gần Bạn</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={{
                    latitude: jobs.length > 0 && isValidCoordinate(jobs[0]?.latitude, jobs[0]?.longitude)
                        ? jobs[0].latitude
                        : (technicianLocation?.latitude || 10.7769),
                    longitude: jobs.length > 0 && isValidCoordinate(jobs[0]?.latitude, jobs[0]?.longitude)
                        ? jobs[0].longitude
                        : (technicianLocation?.longitude || 106.7009),
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                onMapReady={() => setMapReady(true)}
                loadingEnabled={true}
            >
                {/* Technician Location Marker */}
                {technicianLocation && isValidCoordinate(technicianLocation.latitude, technicianLocation.longitude) && (
                    <Marker
                        coordinate={technicianLocation}
                        title="Vị trí của bạn"
                        description="Thợ"
                    >
                        <View style={styles.technicianMarker}>
                            <Ionicons name="person" size={20} color="#fff" />
                        </View>
                    </Marker>
                )}

                {/* Job Markers */}
                {jobs
                    .filter((job) => isValidCoordinate(job?.coordinate?.latitude, job?.coordinate?.longitude))
                    .map((job) => (
                    <Marker
                        key={job.jobId}
                        coordinate={job.coordinate}
                        title={job.title}
                        description={`${job.distanceText} - ${job.estimatedBudget?.toLocaleString('vi-VN')}đ`}
                        onPress={() => handleJobPress(job)}
                    >
                        <View style={[
                            styles.jobMarker,
                            selectedJob?.jobId === job.jobId && styles.selectedJobMarker,
                            { borderColor: getUrgencyColor(job.urgency) }
                        ]}>
                            <Ionicons 
                                name="construct" 
                                size={20} 
                                color={selectedJob?.jobId === job.jobId ? '#fff' : getUrgencyColor(job.urgency)} 
                            />
                        </View>
                    </Marker>
                ))}

                {/* Route Polyline */}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#2196F3"
                        strokeWidth={4}
                    />
                )}
            </MapView>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Jobs Gần Bạn</Text>
                <TouchableOpacity style={styles.listButton} onPress={() => navigation.navigate('NearbyJobs')}>
                    <Ionicons name="list" size={24} color="#2196F3" />
                </TouchableOpacity>
            </View>

            {/* Job Count Badge */}
            <View style={styles.jobCountBadge}>
                <Ionicons name="briefcase" size={16} color="#fff" />
                <Text style={styles.jobCountText}>{jobs.length} jobs</Text>
            </View>

            {/* Selected Job Detail */}
            {selectedJob && (
                <View style={styles.jobDetailContainer}>
                    <ScrollView style={styles.jobDetailScroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.jobDetailContent}>
                            <View style={styles.jobDetailHeader}>
                                <Text style={styles.jobDetailTitle}>{selectedJob.title}</Text>
                                <TouchableOpacity onPress={() => setSelectedJob(null)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.jobDetailDescription} numberOfLines={2}>
                                {selectedJob.description}
                            </Text>

                            <View style={styles.jobDetailInfo}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="location" size={16} color="#666" />
                                    <Text style={styles.infoText}>
                                        {selectedJob.address}, {selectedJob.ward}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar" size={16} color="#666" />
                                    <Text style={styles.infoText}>
                                        {new Date(selectedJob.preferredDate).toLocaleDateString('vi-VN')} - {selectedJob.preferredTimeStart?.substring(0, 5)}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Ionicons name="cash" size={16} color="#4CAF50" />
                                    <Text style={styles.infoBudget}>
                                        {selectedJob.estimatedBudget?.toLocaleString('vi-VN')} ₫
                                    </Text>
                                </View>
                            </View>

                            {routeInfo && (
                                <View style={styles.routeInfo}>
                                    <View style={styles.routeInfoItem}>
                                        <Ionicons name="navigate" size={20} color="#2196F3" />
                                        <Text style={styles.routeInfoText}>{routeInfo.distance}</Text>
                                    </View>
                                    <View style={styles.routeInfoItem}>
                                        <Ionicons name="time" size={20} color="#4CAF50" />
                                        <Text style={styles.routeInfoText}>{routeInfo.duration}</Text>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptJob}>
                                <Text style={styles.acceptButtonText}>Xem Chi Tiết</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    listButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    technicianMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    jobMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    selectedJobMarker: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    jobCountBadge: {
        position: 'absolute',
        top: 120,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    jobCountText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    jobDetailContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        maxHeight: '40%',
    },
    jobDetailScroll: {
        maxHeight: '100%',
    },
    jobDetailContent: {
        padding: 20,
    },
    jobDetailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    jobDetailTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 12,
    },
    jobDetailDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    jobDetailInfo: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    infoBudget: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    routeInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        marginBottom: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },
    routeInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    routeInfoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    acceptButton: {
        flexDirection: 'row',
        backgroundColor: '#2196F3',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default JobMapScreen;
