import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Linking,
    Alert,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';
import apiClient from '../../services/apiClient';
import workerService from '../../services/workerService';

export default function JobTrackingScreen({ route, navigation }) {
    const { bookingId } = route.params;
    const [booking, setBooking] = useState(null);
    const [job, setJob] = useState(null);
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pulseAnim] = useState(new Animated.Value(1));
    
    // Use ref to track if payment alert has been shown (persistent across re-renders)
    const paymentAlertShown = useRef(false);

    useEffect(() => {
        fetchBookingDetails();
        
        // Refresh every 5 seconds for real-time tracking
        const interval = setInterval(() => {
            fetchBookingDetails(true);
        }, 5000);

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => {
            clearInterval(interval);
            pulse.stop();
        };
    }, [bookingId]);

    const fetchBookingDetails = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const bookingResponse = await apiClient.get(`/api/bookings/${bookingId}`);
            const bookingData = bookingResponse.data;
            
            // Check if worker sent payment request (status = 'completed' and no payment yet)
            // Only show alert once using ref to prevent repeated alerts
            if (bookingData.status === 'completed' && !bookingData.Payment && !paymentAlertShown.current) {
                paymentAlertShown.current = true;
                // Show alert with payment request only once
                Alert.alert(
                    '💰 Yêu cầu thanh toán',
                    'Thợ đã hoàn thành công việc và gửi yêu cầu thanh toán. Vui lòng kiểm tra và xác nhận thanh toán.',
                    [
                        {
                            text: 'Xem chi tiết',
                            onPress: () => {
                                navigation.navigate('Payment', { bookingId });
                            },
                        },
                        {
                            text: 'Để sau',
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false } // Prevent dismissing by tapping outside
                );
            } else if (bookingData.Payment) {
                // Reset flag if payment has been made
                paymentAlertShown.current = false;
            }
            
            // Update booking state to reflect real-time changes
            setBooking(prevBooking => {
                // Log status changes for debugging
                if (prevBooking && prevBooking.status !== bookingData.status) {
                    console.log(`📊 Status changed: ${prevBooking.status} → ${bookingData.status}`);
                }
                return bookingData;
            });

            if (bookingData.jobId) {
                try {
                    const jobResponse = await apiClient.get(`/api/jobs/${bookingData.jobId}`);
                    setJob(jobResponse.data);
                } catch (error) {
                    console.log('Job not found');
                }
            }

            if (bookingData.workerId) {
                try {
                    const workerData = await workerService.getWorkerById(bookingData.workerId);
                    setWorker(workerData);
                } catch (error) {
                    console.log('Worker not found');
                }
            }
        } catch (error) {
            console.error('Error fetching booking:', error);
            if (!silent) {
                Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: {
                text: 'Đang chờ thợ đến',
                color: '#2196F3',
                description: 'Dự kiến',
            },
            confirmed: {
                text: 'Thợ đã xác nhận',
                color: '#2196F3',
            },
            on_the_way: {
                text: 'Đang đi chuyển đến chỗ khách',
                color: '#2196F3',
            },
            arrived: {
                text: 'Đã đến nơi',
                color: '#FF9800',
            },
            in_progress: {
                text: 'Đang làm việc',
                color: '#4CAF50',
            },
            completed: {
                text: 'Hoàn thành',
                color: '#4CAF50',
            },
            cancelled: {
                text: 'Đã hủy',
                color: '#F44336',
            },
        };
        return statusMap[status] || statusMap.pending;
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.slice(0, 5);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!booking) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusInfo = getStatusInfo(booking.status);
    const isActive = booking.status === 'on_the_way' || booking.status === 'in_progress';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
                    <Text style={styles.headerSubtitle}>#{booking.bookingId?.slice(0, 8)}</Text>
                </View>
                <TouchableOpacity onPress={() => fetchBookingDetails()}>
                    <Ionicons name="refresh" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: statusInfo.color + '20' }]}>
                    {isActive ? (
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <Ionicons name="time-outline" size={56} color="white" />
                        </Animated.View>
                    ) : (
                        <Ionicons name="time-outline" size={56} color="white" />
                    )}
                    <Text style={styles.statusTitle}>{statusInfo.text}</Text>
                    <Text style={styles.statusSubtitle}>
                        {statusInfo.description} {formatTime(booking.scheduledTimeStart)} hôm nay
                    </Text>
                    <View style={styles.statusNote}>
                        <Ionicons name="timer-outline" size={16} color="white" />
                        <Text style={styles.statusNoteText}>Thợ sẽ gọi xác nhận trước 30 phút</Text>
                    </View>
                </View>

                {/* Map Card */}
                {(booking.status === 'on_the_way' || booking.status === 'confirmed') && (
                    <View style={styles.mapCard}>
                        <View style={styles.mapIcons}>
                            <Ionicons name="navigate" size={32} color={Colors.primary} />
                            <Ionicons name="location" size={48} color={Colors.primary} />
                        </View>
                        <Text style={styles.mapTitle}>Bản đồ theo dõi</Text>
                        <Text style={styles.mapSubtitle}>Thợ đang trên đường</Text>
                    </View>
                )}

                {/* Worker Info */}
                {worker && (
                    <View style={styles.card}>
                        <View style={styles.workerHeader}>
                            <View style={styles.workerAvatar}>
                                <Text style={styles.avatarText}>👷</Text>
                            </View>
                            <View style={styles.workerInfo}>
                                <Text style={styles.workerName}>{worker.fullName || 'Nguyễn Văn An'}</Text>
                                {booking.status === 'on_the_way' && (
                                    <Text style={styles.workerStatus}>Đang đi chuyển đến địa điểm</Text>
                                )}
                                <View style={styles.rating}>
                                    <Ionicons name="star" size={14} color="#FFB800" />
                                    <Text style={styles.ratingText}> {worker.rating || '4.9'} ({worker.completedJobs || '156'} đánh giá)</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => worker.phoneNumber && Linking.openURL(`tel:${worker.phoneNumber}`)}
                            >
                                <Ionicons name="call" size={18} color="#333" />
                                <Text style={styles.actionButtonText}>Gọi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="chatbubble-outline" size={18} color="#333" />
                                <Text style={styles.actionButtonText}>Nhắn tin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Timeline */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tiến trình</Text>
                    
                    <TimelineItem
                        icon="checkmark-circle"
                        title="Đặt lịch thành công"
                        time={new Date(booking.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        completed={true}
                    />
                    <TimelineItem
                        icon="person-add"
                        title="Thợ xác nhận"
                        time={booking.status !== 'pending' ? new Date(booking.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Đang chờ'}
                        completed={['confirmed', 'on_the_way', 'arrived', 'in_progress', 'completed'].includes(booking.status)}
                        active={booking.status === 'confirmed'}
                    />
                    <TimelineItem
                        icon="car"
                        title="Thợ đang đi chuyển"
                        time={['on_the_way', 'arrived', 'in_progress', 'completed'].includes(booking.status) ? new Date(booking.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa bắt đầu'}
                        completed={['arrived', 'in_progress', 'completed'].includes(booking.status)}
                        active={booking.status === 'on_the_way'}
                    />
                    <TimelineItem
                        icon="location"
                        title="Thợ đến nơi"
                        time={['arrived', 'in_progress', 'completed'].includes(booking.status) ? new Date(booking.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : formatTime(booking.scheduledTimeStart)}
                        completed={['in_progress', 'completed'].includes(booking.status)}
                        active={booking.status === 'arrived'}
                    />
                    <TimelineItem
                        icon="hammer"
                        title="Bắt đầu sửa chữa"
                        time={['in_progress', 'completed'].includes(booking.status) ? new Date(booking.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : formatTime(booking.scheduledTimeEnd)}
                        completed={booking.status === 'completed'}
                        active={booking.status === 'in_progress'}
                    />
                    <TimelineItem
                        icon="checkmark-done-circle"
                        title="Hoàn thành"
                        time={booking.status === 'completed' ? new Date(booking.completedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : formatTime(booking.scheduledTimeEnd)}
                        completed={booking.status === 'completed'}
                        isLast={true}
                    />
                </View>

                {/* Order Details */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Chi tiết đơn hàng</Text>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Dịch vụ</Text>
                        <Text style={styles.detailValue}>{job?.title || 'Sửa máy giặt'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Thời gian</Text>
                        <Text style={styles.detailValue}>
                            {formatDate(booking.scheduledDate)}, {formatTime(booking.scheduledTimeStart)} - {formatTime(booking.scheduledTimeEnd)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Địa chỉ</Text>
                        <Text style={styles.detailValue}>{job?.address || '123 Nguyễn Huệ, Q.1'}</Text>
                    </View>

                    <View style={[styles.detailRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Tổng ước tính</Text>
                        <Text style={styles.totalValue}>
                            ~{booking.finalAmount?.toLocaleString('vi-VN')}đ
                        </Text>
                    </View>
                </View>

                {/* Payment Button - Show when completed */}
                {booking.status === 'completed' && !booking.Payment && (
                    <View style={styles.paymentContainer}>
                        <View style={styles.paymentAlert}>
                            <Ionicons name="cash-outline" size={32} color="#FF9800" />
                            <View style={styles.paymentAlertText}>
                                <Text style={styles.paymentAlertTitle}>Yêu cầu thanh toán</Text>
                                <Text style={styles.paymentAlertSubtitle}>
                                    Thợ đã hoàn thành công việc. Vui lòng kiểm tra và thanh toán.
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.paymentButton}
                            onPress={() => navigation.navigate('Payment', { bookingId })}
                        >
                            <Ionicons name="card" size={24} color="white" />
                            <Text style={styles.paymentButtonText}>Xác nhận thanh toán</Text>
                            <Ionicons name="arrow-forward" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Action Buttons */}
                {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                    <View style={styles.bottomActions}>
                        <TouchableOpacity style={styles.reportButton}>
                            <Text style={styles.reportButtonText}>Báo cáo sự cố</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => {
                                Alert.alert(
                                    'Hủy đơn hàng?',
                                    'Bạn có chắc muốn hủy đơn hàng này?',
                                    [
                                        { text: 'Không', style: 'cancel' },
                                        {
                                            text: 'Hủy đơn',
                                            style: 'destructive',
                                            onPress: async () => {
                                                try {
                                                    await apiClient.patch(`/api/bookings/${bookingId}`, {
                                                        status: 'cancelled',
                                                    });
                                                    Alert.alert('Thành công', 'Đã hủy đơn hàng');
                                                    navigation.goBack();
                                                } catch (error) {
                                                    Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
                                                }
                                            },
                                        },
                                    ]
                                );
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const TimelineItem = ({ icon, title, time, completed, active, isLast }) => (
    <View style={styles.timelineItem}>
        <View style={styles.timelineIconContainer}>
            <View style={[
                styles.timelineIcon,
                completed && styles.timelineIconCompleted,
                active && styles.timelineIconActive,
            ]}>
                <Ionicons name={icon} size={16} color={completed || active ? 'white' : '#CCC'} />
            </View>
            {!isLast && <View style={[styles.timelineLine, completed && styles.timelineLineCompleted]} />}
        </View>
        <View style={styles.timelineContent}>
            <Text style={[
                styles.timelineTitle,
                completed && styles.timelineTitleCompleted,
                active && styles.timelineTitleActive,
            ]}>
                {title}
            </Text>
            <Text style={styles.timelineTime}>{time}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
    },
    backButton: {
        marginTop: 20,
        paddingHorizontal: 30,
        paddingVertical: 12,
        backgroundColor: Colors.primary,
        borderRadius: 8,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'white',
    },
    headerContent: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#999',
    },
    content: {
        flex: 1,
    },
    statusCard: {
        margin: 16,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        background: 'linear-gradient(135deg, #42A5F5 0%, #26C6DA 100%)',
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 12,
    },
    statusSubtitle: {
        fontSize: 14,
        color: 'white',
        marginTop: 4,
    },
    statusNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
        gap: 6,
    },
    statusNoteText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '500',
    },
    mapCard: {
        backgroundColor: '#E3F2FD',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    mapIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 12,
    },
    mapTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    mapSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    card: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    workerHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    workerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
    },
    workerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    workerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    workerStatus: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        fontSize: 13,
        color: '#666',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        gap: 6,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    timelineIconContainer: {
        alignItems: 'center',
        width: 32,
    },
    timelineIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    timelineIconCompleted: {
        backgroundColor: '#42A5F5',
        borderColor: '#42A5F5',
    },
    timelineIconActive: {
        backgroundColor: '#42A5F5',
        borderColor: '#42A5F5',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 2,
    },
    timelineLineCompleted: {
        backgroundColor: '#42A5F5',
    },
    timelineContent: {
        flex: 1,
        marginLeft: 12,
        paddingBottom: 12,
    },
    timelineTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    timelineTitleCompleted: {
        color: '#333',
        fontWeight: '600',
    },
    timelineTitleActive: {
        color: '#42A5F5',
        fontWeight: 'bold',
    },
    timelineTime: {
        fontSize: 12,
        color: '#999',
    },
    detailRow: {
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 13,
        color: '#999',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        color: '#333',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 15,
        color: '#666',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#42A5F5',
    },
    paymentContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    paymentAlert: {
        flexDirection: 'row',
        backgroundColor: '#FFF3E0',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    paymentAlertText: {
        flex: 1,
    },
    paymentAlertTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF9800',
        marginBottom: 4,
    },
    paymentAlertSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    paymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    paymentButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
    bottomActions: {
        marginHorizontal: 16,
        gap: 12,
    },
    reportButton: {
        backgroundColor: 'white',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    reportButtonText: {
        color: '#333',
        fontSize: 15,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: 'white',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F44336',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#F44336',
        fontSize: 15,
        fontWeight: '600',
    },
});
