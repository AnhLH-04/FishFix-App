import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

/**
 * WorkerBookingsScreen
 * Hiển thị danh sách bookings cho thợ
 * Thợ có thể xem và accept bookings mới
 */
export default function WorkerBookingsScreen({ navigation }) {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchWorkerBookings();
        
        // Poll for new bookings every 10 seconds
        const interval = setInterval(() => {
            fetchWorkerBookings(true); // Silent refresh
        }, 10000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchWorkerBookings = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            
            console.log('📋 Fetching bookings for worker:', user?.id);
            
            // Get all bookings where workerId = current user
            const response = await apiClient.get('/api/bookings', {
                params: { workerId: user?.id }
            });
            
            setBookings(response.data || []);
            console.log('✅ Found', response.data?.length || 0, 'bookings');
            
            // Check for new pending bookings
            const pendingBookings = response.data?.filter(b => b.status === 'pending') || [];
            if (pendingBookings.length > 0 && !silent) {
                // Show notification badge or alert
                console.log('🔔 You have', pendingBookings.length, 'new booking(s)!');
            }
        } catch (error) {
            console.error('❌ Error fetching worker bookings:', error);
        } finally {
            if (!silent) setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchWorkerBookings();
    };

    const handleViewBooking = async (booking) => {
        try {
            // Fetch job details
            const jobResponse = await apiClient.get(`/api/jobs/${booking.jobId}`);
            const jobData = jobResponse.data;
            
            // Navigate to IncomingRequestScreen
            navigation.navigate('IncomingRequest', {
                booking: booking,
                job: jobData,
            });
        } catch (error) {
            console.error('Error fetching job details:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin công việc');
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { text: 'Mới', color: '#FF9800', icon: 'alert-circle' };
            case 'confirmed':
            case 'in_progress':
                return { text: 'Đang làm', color: '#2196F3', icon: 'construct' };
            case 'completed':
                return { text: 'Hoàn thành', color: '#4CAF50', icon: 'checkmark-circle' };
            case 'cancelled':
                return { text: 'Đã hủy', color: '#F44336', icon: 'close-circle' };
            default:
                return { text: status, color: '#999', icon: 'help-circle' };
        }
    };

    const renderBookingItem = ({ item }) => {
        const statusInfo = getStatusInfo(item.status);
        const isNew = item.status === 'pending';
        
        return (
            <TouchableOpacity
                style={[styles.bookingCard, isNew && styles.newBookingCard]}
                onPress={() => handleViewBooking(item)}
            >
                {isNew && (
                    <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>MỚI</Text>
                    </View>
                )}
                
                <View style={styles.bookingHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                        <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                    <Text style={styles.bookingId}>#{item.bookingId?.slice(0, 8)}</Text>
                </View>

                <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={18} color="#666" />
                        <Text style={styles.detailText}>
                            {item.scheduledDate} • {item.scheduledTimeStart?.slice(0, 5)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="cash" size={18} color="#4CAF50" />
                        <Text style={styles.priceText}>
                            {item.finalAmount?.toLocaleString('vi-VN')}đ
                        </Text>
                        {item.depositAmount && (
                            <Text style={styles.depositText}>
                                (Cọc: {item.depositAmount?.toLocaleString('vi-VN')}đ)
                            </Text>
                        )}
                    </View>
                </View>

                {isNew && (
                    <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FF6B35" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Booking của tôi</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {bookings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Chưa có booking nào</Text>
                    <Text style={styles.emptySubtext}>
                        Các booking mới sẽ xuất hiện ở đây
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.bookingId}
                    renderItem={renderBookingItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </SafeAreaView>
    );
}

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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    listContainer: {
        padding: 15,
        gap: 15,
    },
    bookingCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    newBookingCard: {
        borderWidth: 2,
        borderColor: '#FF6B35',
    },
    newBadge: {
        position: 'absolute',
        top: -8,
        right: 15,
        backgroundColor: '#FF6B35',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    newBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    bookingId: {
        fontSize: 13,
        color: '#999',
        fontFamily: 'monospace',
    },
    bookingDetails: {
        gap: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    depositText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        paddingVertical: 10,
        backgroundColor: '#FF6B3510',
        borderRadius: 10,
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B35',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});
