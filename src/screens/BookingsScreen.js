import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingsScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('upcoming');

    const bookings = [
        {
            id: 1,
            technician: 'Nguyễn Văn A',
            service: 'Máy Giặt',
            date: '25/10/2025',
            time: '10:00 - 12:00',
            status: 'confirmed',
            avatar: '👨‍🔧',
            price: '200,000đ',
        },
        {
            id: 2,
            technician: 'Trần Thị B',
            service: 'Điều Hòa',
            date: '26/10/2025',
            time: '14:00 - 16:00',
            status: 'pending',
            avatar: '👩‍🔧',
            price: '350,000đ',
        },
    ];

    const pastBookings = [
        {
            id: 3,
            technician: 'Lê Văn C',
            service: 'Điện Nước',
            date: '20/10/2025',
            time: '09:00 - 11:00',
            status: 'completed',
            avatar: '🧑‍🔧',
            price: '150,000đ',
            rating: 5,
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return '#4CAF50';
            case 'pending':
                return '#FF9800';
            case 'completed':
                return '#2196F3';
            case 'cancelled':
                return '#F44336';
            default:
                return '#999';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'confirmed':
                return 'Đã xác nhận';
            case 'pending':
                return 'Chờ xác nhận';
            case 'completed':
                return 'Hoàn thành';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const renderBookingCard = (booking) => (
        <TouchableOpacity key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <View style={styles.technicianInfo}>
                    <Text style={styles.avatar}>{booking.avatar}</Text>
                    <View style={styles.techInfo}>
                        <Text style={styles.techName}>{booking.technician}</Text>
                        <Text style={styles.service}>{booking.service}</Text>
                    </View>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(booking.status) + '20' },
                    ]}
                >
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                        {getStatusText(booking.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{booking.date}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{booking.time}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{booking.price}</Text>
                </View>
            </View>

            {booking.rating && (
                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingLabel}>Đánh giá của bạn:</Text>
                    <View style={styles.stars}>
                        {[...Array(booking.rating)].map((_, i) => (
                            <Ionicons key={i} name="star" size={16} color="#FFC107" />
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.bookingActions}>
                {booking.status === 'confirmed' && (
                    <>
                        <TouchableOpacity style={styles.actionBtnSecondary}>
                            <Ionicons name="close-circle-outline" size={18} color="#F44336" />
                            <Text style={styles.actionBtnSecondaryText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtnPrimary}>
                            <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
                            <Text style={styles.actionBtnPrimaryText}>Nhắn tin</Text>
                        </TouchableOpacity>
                    </>
                )}
                {booking.status === 'completed' && !booking.rating && (
                    <TouchableOpacity style={[styles.actionBtnPrimary, { flex: 1 }]}>
                        <Ionicons name="star-outline" size={18} color="#fff" />
                        <Text style={styles.actionBtnPrimaryText}>Đánh giá</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lịch Hẹn</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="search-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Text
                        style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}
                    >
                        Sắp Tới ({bookings.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                        Đã Qua ({pastBookings.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {activeTab === 'upcoming' && (
                    <View style={styles.bookingsList}>
                        {bookings.length > 0 ? (
                            bookings.map(renderBookingCard)
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={80} color="#ccc" />
                                <Text style={styles.emptyTitle}>Chưa có lịch hẹn</Text>
                                <Text style={styles.emptyText}>
                                    Đặt lịch ngay để được hỗ trợ nhanh chóng
                                </Text>
                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={() => navigation.navigate('HomeTab')}
                                >
                                    <Text style={styles.emptyButtonText}>Đặt Lịch Ngay</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'past' && (
                    <View style={styles.bookingsList}>
                        {pastBookings.length > 0 ? (
                            pastBookings.map(renderBookingCard)
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={80} color="#ccc" />
                                <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
                                <Text style={styles.emptyText}>
                                    Lịch sử dịch vụ sẽ hiển thị ở đây
                                </Text>
                            </View>
                        )}
                    </View>
                )}
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
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f7fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 10,
        gap: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
    activeTab: {
        backgroundColor: '#2196F3',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    bookingsList: {
        padding: 20,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    technicianInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        fontSize: 40,
        marginRight: 12,
    },
    techInfo: {
        flex: 1,
    },
    techName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    service: {
        fontSize: 13,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    bookingDetails: {
        backgroundColor: '#f5f7fa',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    ratingLabel: {
        fontSize: 13,
        color: '#666',
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
    },
    bookingActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtnPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionBtnPrimaryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    actionBtnSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F44336',
    },
    actionBtnSecondaryText: {
        color: '#F44336',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
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
    emptyButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default BookingsScreen;
