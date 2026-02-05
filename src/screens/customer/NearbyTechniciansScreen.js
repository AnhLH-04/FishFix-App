import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import workerService from '../../services/workerService';
import locationService from '../../services/locationService';

const NearbyTechniciansScreen = ({ route, navigation }) => {
    const { service, categoryId } = route.params || {};
    const { userLocation } = useAuth();
    const [loading, setLoading] = useState(true);
    const [technicians, setTechnicians] = useState([]);

    useEffect(() => {
        fetchNearbyWorkers();
    }, []);

    const fetchNearbyWorkers = async () => {
        try {
            setLoading(true);
            
            // Nếu không có location, dùng mock location
            const location = userLocation || locationService.getMockLocation();
            
            // Gọi API lấy thợ gần nhất
            const workers = await workerService.getNearbyWorkers({
                categoryId: categoryId,
                latitude: location.latitude,
                longitude: location.longitude,
                radiusKm: 10, // Tìm trong bán kính 10km
            });

            // Format data và tính toán thêm thông tin
            const formattedWorkers = workers.map(worker => {
                const travelTime = locationService.calculateTravelTime(worker.distance || 0);
                return {
                    id: worker.workerId,
                    workerId: worker.workerId,
                    userId: worker.userId,
                    name: worker.fullName || 'Thợ',
                    avatar: worker.avatarUrl || '👨‍🔧',
                    rating: worker.rating || 0,
                    reviews: worker.completedJobs || 0,
                    specialty: worker.skills?.map(s => s.categoryName).join(', ') || '',
                    distance: worker.distance || 0,
                    distanceText: locationService.formatDistance(worker.distance || 0),
                    eta: `${travelTime}-${travelTime + 10}`,
                    verified: true,
                    available: true,
                    price: worker.hourlyRate || 150000,
                    phone: worker.phone,
                    bio: worker.bio,
                    latitude: worker.latitude,
                    longitude: worker.longitude,
                };
            });

            setTechnicians(formattedWorkers);
        } catch (error) {
            console.error('Error fetching nearby workers:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách thợ');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTechnician = (technician) => {
        navigation.navigate('InstantBooking', {
            technician,
            service
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thợ Gần Bạn</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Đang tìm thợ gần bạn...</Text>
                </View>
            </View>
        );
    }

    if (technicians.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thợ Gần Bạn</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="location-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyTitle}>Không có thợ rảnh</Text>
                    <Text style={styles.emptyText}>
                        Hiện tại không có thợ nào đang rảnh gần khu vực của bạn.
                    </Text>
                    <TouchableOpacity
                        style={styles.scheduleButton}
                        onPress={() => navigation.navigate('TechnicianList', { service })}
                    >
                        <Text style={styles.scheduleButtonText}>Đặt Lịch Hẹn</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thợ Gần Bạn</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={fetchNearbyWorkers}>
                    <Ionicons name="refresh" size={24} color="#2196F3" />
                </TouchableOpacity>
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Ionicons name="flash" size={20} color="#FF6B6B" />
                <Text style={styles.infoBannerText}>
                    {technicians.length} thợ đang rảnh gần bạn
                </Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {service && (
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceLabel}>Dịch vụ:</Text>
                            <Text style={styles.serviceName}>{service}</Text>
                        </View>
                    )}

                    {technicians.map((tech) => (
                        <TouchableOpacity
                            key={tech.id}
                            style={styles.techCard}
                            onPress={() => handleSelectTechnician(tech)}
                            activeOpacity={0.8}
                        >
                            {/* Available Badge */}
                            <View style={styles.availableBadge}>
                                <View style={styles.availableDot} />
                                <Text style={styles.availableText}>Đang rảnh</Text>
                            </View>

                            <View style={styles.techHeader}>
                                <View style={styles.avatarContainer}>
                                    <Text style={styles.avatar}>{tech.avatar}</Text>
                                    {tech.verified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark" size={12} color="#fff" />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.techInfo}>
                                    <Text style={styles.techName}>{tech.name}</Text>
                                    <Text style={styles.techSpecialty}>{tech.specialty}</Text>

                                    <View style={styles.ratingContainer}>
                                        <Ionicons name="star" size={14} color="#FFA000" />
                                        <Text style={styles.rating}>{tech.rating}</Text>
                                        <Text style={styles.reviews}>({tech.reviews} đánh giá)</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Distance and ETA */}
                            <View style={styles.locationInfo}>
                                <View style={styles.locationItem}>
                                    <Ionicons name="location" size={16} color="#2196F3" />
                                    <Text style={styles.locationText}>{tech.distanceText}</Text>
                                </View>
                                <View style={styles.locationItem}>
                                    <Ionicons name="time" size={16} color="#4CAF50" />
                                    <Text style={styles.locationText}>Đến trong {tech.eta} phút</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.directionButton}
                                    onPress={() => {
                                        const { userLocation } = useAuth();
                                        const location = userLocation || locationService.getMockLocation();
                                        const url = locationService.getDirectionsUrl(
                                            tech.latitude,
                                            tech.longitude,
                                            location.latitude,
                                            location.longitude
                                        );
                                        Linking.openURL(url);
                                    }}
                                >
                                    <Ionicons name="navigate" size={16} color="#2196F3" />
                                    <Text style={styles.directionText}>Chỉ đường</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Price */}
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceLabel}>Giá khởi điểm:</Text>
                                <Text style={styles.price}>
                                    {tech.price ? tech.price.toLocaleString('vi-VN') : '0'} ₫
                                </Text>
                            </View>

                            {/* Select Button */}
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => handleSelectTechnician(tech)}
                            >
                                <Text style={styles.selectButtonText}>Chọn Thợ Này</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f7fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    refreshButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    scheduleButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 25,
    },
    scheduleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    infoBannerText: {
        fontSize: 14,
        color: '#E65100',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    serviceInfo: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        gap: 8,
    },
    serviceLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2196F3',
    },
    techCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        position: 'relative',
    },
    availableBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    availableDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CAF50',
    },
    availableText: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '600',
    },
    techHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        fontSize: 56,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    techInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    techName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    techSpecialty: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    reviews: {
        fontSize: 12,
        color: '#999',
    },
    locationInfo: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        flexWrap: 'wrap',
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    directionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#E3F2FD',
    },
    directionText: {
        fontSize: 12,
        color: '#2196F3',
        fontWeight: '600',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    selectButton: {
        flexDirection: 'row',
        backgroundColor: '#2196F3',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    selectButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default NearbyTechniciansScreen;
