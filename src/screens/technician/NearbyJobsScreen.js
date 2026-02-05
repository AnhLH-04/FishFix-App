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
import jobService from '../../services/jobService';
import locationService from '../../services/locationService';

const NearbyJobsScreen = ({ navigation, route }) => {
    const { categoryId } = route.params || {};
    const { userLocation } = useAuth();
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [filter, setFilter] = useState({
        categoryId: categoryId || null,
        city: null,
        district: null,
    });

    useEffect(() => {
        fetchNearbyJobs();
    }, [filter]);

    const fetchNearbyJobs = async () => {
        try {
            setLoading(true);
            
            // Lấy vị trí thợ (hoặc mock location)
            const location = userLocation || locationService.getMockLocation();
            
            // Gọi API lấy jobs available
            const availableJobs = await jobService.getAvailableJobs(filter);

            // Tính khoảng cách và format data
            const formattedJobs = availableJobs
                .map(job => {
                    const distance = locationService.calculateDistance(
                        location.latitude,
                        location.longitude,
                        job.latitude,
                        job.longitude
                    );
                    const travelTime = locationService.calculateTravelTime(distance);

                    return {
                        ...job,
                        distance,
                        distanceText: locationService.formatDistance(distance),
                        eta: `${travelTime}-${travelTime + 10}`,
                    };
                })
                // Sort theo khoảng cách
                .sort((a, b) => a.distance - b.distance);

            setJobs(formattedJobs);
        } catch (error) {
            console.error('Error fetching nearby jobs:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách công việc');
        } finally {
            setLoading(false);
        }
    };

    const handleViewJob = (job) => {
        navigation.navigate('JobDetail', { jobId: job.jobId });
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

    const getUrgencyLabel = (urgency) => {
        switch (urgency) {
            case 'low': return 'Bình thường';
            case 'medium': return 'Trung bình';
            case 'high': return 'Khẩn';
            case 'emergency': return 'Khẩn cấp';
            default: return urgency;
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Công Việc Gần Bạn</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Đang tìm công việc...</Text>
                </View>
            </View>
        );
    }

    if (jobs.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Công Việc Gần Bạn</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={fetchNearbyJobs}>
                        <Ionicons name="refresh" size={24} color="#2196F3" />
                    </TouchableOpacity>
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="briefcase-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyTitle}>Chưa có công việc</Text>
                    <Text style={styles.emptyText}>
                        Hiện tại không có công việc nào phù hợp với bạn.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Công Việc Gần Bạn</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity 
                        style={styles.mapButton} 
                        onPress={() => navigation.navigate('JobMap', { categoryId: filter.categoryId })}
                    >
                        <Ionicons name="map" size={24} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshButton} onPress={fetchNearbyJobs}>
                        <Ionicons name="refresh" size={24} color="#2196F3" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Ionicons name="briefcase" size={20} color="#2196F3" />
                <Text style={styles.infoBannerText}>
                    {jobs.length} công việc có sẵn gần bạn
                </Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {jobs.map((job) => (
                        <TouchableOpacity
                            key={job.jobId}
                            style={styles.jobCard}
                            onPress={() => handleViewJob(job)}
                            activeOpacity={0.8}
                        >
                            {/* Urgency Badge */}
                            <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(job.urgency) + '20' }]}>
                                <Ionicons name="flame" size={14} color={getUrgencyColor(job.urgency)} />
                                <Text style={[styles.urgencyText, { color: getUrgencyColor(job.urgency) }]}>
                                    {getUrgencyLabel(job.urgency)}
                                </Text>
                            </View>

                            {/* Job Info */}
                            <Text style={styles.jobTitle}>{job.title}</Text>
                            <Text style={styles.jobDescription} numberOfLines={2}>
                                {job.description}
                            </Text>

                            {/* Location */}
                            <View style={styles.locationContainer}>
                                <Ionicons name="location" size={16} color="#666" />
                                <Text style={styles.locationAddress} numberOfLines={1}>
                                    {job.address}, {job.ward}, {job.district}
                                </Text>
                            </View>

                            {/* Distance and Time */}
                            <View style={styles.locationInfo}>
                                <View style={styles.locationItem}>
                                    <Ionicons name="navigate" size={16} color="#2196F3" />
                                    <Text style={styles.locationText}>{job.distanceText}</Text>
                                </View>
                                <View style={styles.locationItem}>
                                    <Ionicons name="time" size={16} color="#4CAF50" />
                                    <Text style={styles.locationText}>~{job.eta} phút</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.directionButton}
                                    onPress={() => {
                                        const location = userLocation || locationService.getMockLocation();
                                        const url = locationService.getDirectionsUrl(
                                            location.latitude,
                                            location.longitude,
                                            job.latitude,
                                            job.longitude
                                        );
                                        Linking.openURL(url);
                                    }}
                                >
                                    <Ionicons name="map" size={16} color="#2196F3" />
                                    <Text style={styles.directionText}>Chỉ đường</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Time and Budget */}
                            <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                    <Ionicons name="calendar" size={16} color="#666" />
                                    <Text style={styles.detailText}>
                                        {new Date(job.preferredDate).toLocaleDateString('vi-VN')}
                                    </Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="time" size={16} color="#666" />
                                    <Text style={styles.detailText}>
                                        {job.preferredTimeStart?.substring(0, 5)} - {job.preferredTimeEnd?.substring(0, 5)}
                                    </Text>
                                </View>
                            </View>

                            {/* Budget */}
                            <View style={styles.budgetContainer}>
                                <Text style={styles.budgetLabel}>Ngân sách:</Text>
                                <Text style={styles.budget}>
                                    {job.estimatedBudget?.toLocaleString('vi-VN')} ₫
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.viewButton}
                                    onPress={() => handleViewJob(job)}
                                >
                                    <Text style={styles.viewButtonText}>Xem Chi Tiết</Text>
                                </TouchableOpacity>
                            </View>
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
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    mapButton: {
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
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    infoBannerText: {
        fontSize: 14,
        color: '#1976D2',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    jobCard: {
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
    urgencyBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    urgencyText: {
        fontSize: 11,
        fontWeight: '600',
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        paddingRight: 80,
    },
    jobDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    locationAddress: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    locationInfo: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
    detailsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
    },
    budgetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    budgetLabel: {
        fontSize: 14,
        color: '#666',
    },
    budget: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    viewButton: {
        flex: 1,
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default NearbyJobsScreen;
