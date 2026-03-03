import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import workerService from '../../services/workerService';

export default function TechnicianHomeScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [activeJobs, setActiveJobs] = useState(2);
    const [completedToday, setCompletedToday] = useState(5);
    const [todayEarnings, setTodayEarnings] = useState(850000);
    const [isOnline, setIsOnline] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [workerId, setWorkerId] = useState(null);

    useEffect(() => {
        if (user?.id) {
            initializeWorker();
        }
    }, [user?.id]);

    useEffect(() => {
        if (workerId) {
            fetchWorkerBookings();
            // Auto refresh every 30 seconds
            const interval = setInterval(() => {
                fetchWorkerBookings(true);
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [workerId]);

    const initializeWorker = async () => {
        try {
            console.log('👤 Getting workerId for userId:', user?.id);
            const workerProfile = await workerService.getWorkerByUserId(user.id);
            
            if (workerProfile && workerProfile.workerId) {
                setWorkerId(workerProfile.workerId);
                console.log('✅ Found workerId:', workerProfile.workerId);
            } else {
                console.warn('⚠️ No worker profile found for user');
            }
        } catch (error) {
            console.error('❌ Error getting workerId:', error);
        }
    };

    const fetchWorkerBookings = async (silent = false) => {
        try {
            if (!silent) setLoadingBookings(true);
            
            if (!workerId) {
                console.warn('⚠️ No workerId available yet');
                return;
            }
            
            console.log('📋 Fetching bookings for workerId:', workerId);
            
            // Get bookings where workerId = current worker
            const response = await apiClient.get('/api/bookings', {
                params: { workerId: workerId }
            });
            
            const allBookings = response.data || [];
            
            // Filter for active bookings (pending, confirmed, in_progress)
            const activeBookings = allBookings.filter(b => 
                b.status === 'pending' || 
                b.status === 'confirmed' || 
                b.status === 'in_progress'
            );

            const completedTodayCount = allBookings.filter(b => 
                b.status === 'completed'
            );

            const todayEarningCount = allBookings.reduce((sum, b) => {
                if (b.status === 'completed') {
                    return sum + (b.finalAmount || 0);
                }
                return sum;
            }, 0);

            setBookings(activeBookings);
            setActiveJobs(activeBookings.length);
            setCompletedToday(completedTodayCount.length);
            setTodayEarnings(todayEarningCount);
            
            console.log('✅ Found', activeBookings.length, 'active bookings');
        } catch (error) {
            console.error('❌ Error fetching worker bookings:', error);
        } finally {
            if (!silent) setLoadingBookings(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchWorkerBookings();
    };

    const stats = [
        {
            icon: 'hammer',
            label: 'Đang làm',
            value: activeJobs,
            color: '#FF6B35',
            bgColor: '#FF6B3520',
        },
        {
            icon: 'checkmark-done',
            label: 'Hoàn thành',
            value: completedToday,
            color: '#4CAF50',
            bgColor: '#4CAF5020',
        },
        {
            icon: 'wallet',
            label: 'Thu nhập hôm nay',
            value: (todayEarnings ? todayEarnings.toLocaleString('vi-VN') : '0') + 'đ',
            color: '#2196F3',
            bgColor: '#2196F320',
        },
    ];

    const quickActions = [
        { icon: 'search', label: 'Tìm việc', screen: 'NearbyJobs', color: '#FF6B35' },
        { icon: 'calendar', label: 'Lịch làm việc', screen: 'Schedule', color: '#2196F3' },
        { icon: 'star', label: 'Đánh giá', screen: 'Reviews', color: '#FFB800' },
        { icon: 'card', label: 'Thu nhập', screen: 'Earnings', color: '#9C27B0' },
    ];

    const handleToggleOnline = () => {
        setIsOnline(!isOnline);
        // Trong thực tế, gửi trạng thái lên server
        if (!isOnline) {
            // Simulate receiving request after going online
            setTimeout(() => {
                navigation.navigate('IncomingRequest', {
                    request: {
                        id: 1,
                        customer: 'Nguyễn Văn A',
                        service: 'Sửa máy lạnh',
                        address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
                        distance: '2.5 km',
                        estimatedTime: '10 phút',
                        price: 500000,
                        description: 'Máy lạnh không lạnh, có tiếng kêu lạ',
                        urgent: true,
                        phone: '0123456789',
                        rating: 4.8,
                    },
                });
            }, 3000);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào,</Text>
                    <Text style={styles.userName}>{user?.name || 'Thợ sửa chữa'}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color="#333" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>3</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('TechnicianProfile')}
                    >
                        <Ionicons name="person-circle-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Online/Offline Toggle - Giống Grab */}
                <View style={styles.onlineToggleContainer}>
                    <View style={styles.toggleContent}>
                        <View style={styles.toggleLeft}>
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: isOnline ? '#4CAF50' : '#999' },
                                ]}
                            />
                            <View>
                                <Text style={styles.toggleTitle}>
                                    {isOnline ? 'Bạn đang online' : 'Bạn đang offline'}
                                </Text>
                                <Text style={styles.toggleDescription}>
                                    {isOnline
                                        ? 'Sẵn sàng nhận yêu cầu mới'
                                        : 'Bật để nhận yêu cầu từ khách hàng'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.toggleSwitch,
                                { backgroundColor: isOnline ? '#4CAF50' : '#CCC' },
                            ]}
                            onPress={handleToggleOnline}
                        >
                            <View
                                style={[
                                    styles.toggleCircle,
                                    { transform: [{ translateX: isOnline ? 22 : 0 }] },
                                ]}
                            />
                        </TouchableOpacity>
                    </View>
                    {isOnline && (
                        <View style={styles.onlineInfo}>
                            <Ionicons name="information-circle" size={16} color="#2196F3" />
                            <Text style={styles.onlineInfoText}>
                                Yêu cầu mới sẽ hiển thị trong vòng 30 giây
                            </Text>
                        </View>
                    )}
                </View>
                {/* Stats */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View
                            key={index}
                            style={[styles.statCard, { backgroundColor: stat.bgColor }]}
                        >
                            <Ionicons name={stat.icon} size={28} color={stat.color} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
                    <View style={styles.actionsGrid}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionCard}
                                onPress={() => {
                                    if (action.screen) {
                                        navigation.navigate(action.screen);
                                    }
                                }}
                            >
                                <View
                                    style={[
                                        styles.actionIcon,
                                        { backgroundColor: action.color + '20' },
                                    ]}
                                >
                                    <Ionicons name={action.icon} size={24} color={action.color} />
                                </View>
                                <Text style={styles.actionLabel}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Active Jobs */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Công việc đang làm</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                            <Text style={styles.seeAll}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingBookings ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FF6B35" />
                            <Text style={styles.loadingText}>Đang tải...</Text>
                        </View>
                    ) : bookings.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="briefcase-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>Chưa có công việc nào</Text>
                            <Text style={styles.emptySubtext}>
                                Các booking mới sẽ xuất hiện ở đây
                            </Text>
                        </View>
                    ) : (
                        bookings.map((booking) => (
                            <BookingCard 
                                key={booking.bookingId} 
                                booking={booking}
                                navigation={navigation}
                            />
                        ))
                    )}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// Booking Card Component
const BookingCard = ({ booking, navigation }) => {
    const handleViewBooking = async () => {
        try {
            console.log('👁️ Viewing booking:', booking.bookingId);
            
            // Fetch job details
            const jobResponse = await apiClient.get(`/api/jobs/${booking.jobId}`);
            const jobData = jobResponse.data;
            
            console.log('💼 Job data:', jobData);
            
            // Navigate to IncomingRequestScreen with booking and job data
            navigation.navigate('IncomingRequest', {
                booking: booking,
                job: jobData,
            });
        } catch (error) {
            console.error('❌ Error fetching job details:', error);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { text: 'Mới', color: '#FF9800', bgColor: '#FF980020' };
            case 'confirmed':
            case 'in_progress':
                return { text: 'Đang làm', color: '#FF6B35', bgColor: '#FF6B3520' };
            default:
                return { text: 'Chờ', color: '#2196F3', bgColor: '#2196F320' };
        }
    };

    const statusInfo = getStatusInfo(booking.status);
    const scheduledTime = booking.scheduledTimeStart?.slice(0, 5) || '';
    const scheduledDate = booking.scheduledDate || '';
    const isToday = scheduledDate === new Date().toISOString().split('T')[0];

    return (
        <TouchableOpacity style={styles.jobCard} onPress={handleViewBooking}>
            <View style={styles.jobHeader}>
                <View style={[styles.jobStatus, { backgroundColor: statusInfo.bgColor }]}>
                    <Text style={[styles.jobStatusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                    </Text>
                </View>
                <Text style={styles.jobTime}>
                    {scheduledTime} - {isToday ? 'Hôm nay' : scheduledDate}
                </Text>
            </View>
            <Text style={styles.jobTitle}>Booking #{booking.bookingId?.slice(0, 8)}</Text>
            <View style={styles.jobInfo}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.jobInfoText}>
                    {scheduledDate} • {scheduledTime}
                </Text>
            </View>
            <View style={styles.jobFooter}>
                <View style={styles.jobPrice}>
                    <Text style={styles.jobPriceText}>
                        {booking.finalAmount?.toLocaleString('vi-VN')}đ
                    </Text>
                </View>
                <TouchableOpacity style={styles.jobButton} onPress={handleViewBooking}>
                    <Text style={styles.jobButtonText}>Bắt đầu làm việc</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    greeting: {
        fontSize: 14,
        color: '#999',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 10,
    },
    statCard: {
        flex: 1,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAll: {
        fontSize: 14,
        color: '#FF6B35',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    actionCard: {
        width: '47%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionLabel: {
        fontSize: 13,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    jobCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    jobStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    jobStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    jobTime: {
        fontSize: 12,
        color: '#999',
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    jobInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    jobInfoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    jobPrice: {
        backgroundColor: '#4CAF5020',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    jobPriceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    jobButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    jobButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },
    // Online Toggle Styles
    onlineToggleContainer: {
        backgroundColor: 'white',
        margin: 15,
        marginBottom: 10,
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    toggleContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    toggleDescription: {
        fontSize: 12,
        color: '#666',
    },
    toggleSwitch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 3,
        justifyContent: 'center',
    },
    toggleCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    onlineInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    onlineInfoText: {
        flex: 1,
        fontSize: 12,
        color: '#2196F3',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'white',
        borderRadius: 15,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
    },
    emptySubtext: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
    },
});
