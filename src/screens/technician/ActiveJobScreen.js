import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';
import bookingService from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';

export default function ActiveJobScreen({ navigation, route }) {
    const { user } = useAuth();
    const [jobStatus, setJobStatus] = useState('going_to_customer'); // going_to_customer, arrived, working, completed
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [updating, setUpdating] = useState(false);

    const job = route?.params?.job || {
        id: 1,
        customer: 'Nguyễn Văn A',
        service: 'Sửa máy lạnh',
        address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
        distance: '2.5 km',
        phone: '0123456789',
        price: 500000,
        description: 'Máy lạnh không lạnh, có tiếng kêu lạ',
        coordinates: {
            latitude: 10.7292,
            longitude: 106.7217,
        },
    };

    // Get bookingId from route params
    const bookingId = route?.params?.bookingId;

    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCall = () => {
        Linking.openURL(`tel:${job.phone}`);
    };

    const handleMessage = () => {
        navigation.navigate('Messages', { customerId: job.customerId });
    };

    const handleNavigate = () => {
        // Open Google Maps or Apple Maps
        const url = `https://www.google.com/maps/dir/?api=1&destination=${job.coordinates.latitude},${job.coordinates.longitude}`;
        Linking.openURL(url);
    };

    /**
     * Cập nhật trạng thái booking thông qua API
     */
    const updateStatus = async (newStatus, statusMessage, additionalData = {}) => {
        if (!bookingId) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin booking');
            return false;
        }

        try {
            setUpdating(true);
            
            const statusData = {
                status: newStatus,
            };
            
            // Add actorId if available
            if (user?.userId || user?.uid) {
                statusData.actorId = user.userId || user.uid;
            }
            
            // Add notes if provided
            if (statusMessage) {
                statusData.notes = statusMessage;
            }
            
            // Add any additional data (reason, images, etc.)
            if (additionalData.reason) {
                statusData.reason = additionalData.reason;
            }
            if (additionalData.images) {
                statusData.images = additionalData.images;
            }
            
            await bookingService.updateBookingStatus(bookingId, statusData);
            return true;
        } catch (error) {
            console.error('Error updating booking status:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
            return false;
        } finally {
            setUpdating(false);
        }
    };

    const handleConfirmJob = async () => {
        Alert.alert(
            'Xác nhận công việc',
            'Bạn có chắc muốn nhận công việc này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        const success = await updateStatus('confirmed');
                        if (success) {
                            setJobStatus('confirmed');
                            Alert.alert('Thành công', 'Đã xác nhận công việc!');
                        }
                    },
                },
            ]
        );
    };

    const handleStartGoing = async () => {
        Alert.alert(
            'Bắt đầu di chuyển',
            'Xác nhận bạn đã xuất phát đến chỗ khách hàng?',
            [
                { text: 'Chưa', style: 'cancel' },
                {
                    text: 'Đã xuất phát',
                    onPress: async () => {
                        // on_the_way không cần notes theo spec
                        const success = await updateStatus('on_the_way');
                        if (success) {
                            setJobStatus('going_to_customer');
                        }
                    },
                },
            ]
        );
    };

    const handleArrived = async () => {
        Alert.alert(
            'Xác nhận đến nơi',
            'Bạn đã đến nơi làm việc?',
            [
                { text: 'Chưa', style: 'cancel' },
                {
                    text: 'Đã đến',
                    onPress: async () => {
                        // arrived không cần notes theo spec
                        const success = await updateStatus('arrived');
                        if (success) {
                            setJobStatus('arrived');
                        }
                    },
                },
            ]
        );
    };

    const handleStartWork = async () => {
        // in_progress không cần notes theo spec
        const success = await updateStatus('in_progress');
        if (success) {
            setJobStatus('working');
            setIsTimerRunning(true);
        }
    };

    const handleCompleteWork = async () => {
        setIsTimerRunning(false);
        // completed có thể có notes và images (optional)
        const success = await updateStatus('completed', 'Công việc đã hoàn thành');
        if (success) {
            navigation.navigate('JobCompletion', { job, workDuration: timer, bookingId });
        }
    };

    const handleCancelBooking = () => {
        Alert.prompt(
            'Hủy công việc',
            'Vui lòng nhập lý do hủy:',
            [
                { text: 'Đóng', style: 'cancel' },
                {
                    text: 'Xác nhận hủy',
                    onPress: async (reason) => {
                        if (!reason || reason.trim() === '') {
                            Alert.alert('Lỗi', 'Vui lòng nhập lý do hủy');
                            return;
                        }
                        
                        // cancelled requires actorId and reason
                        const success = await updateStatus('cancelled', null, { reason: reason.trim() });
                        if (success) {
                            Alert.alert('Đã hủy', 'Công việc đã được hủy', [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.goBack()
                                }
                            ]);
                        }
                    },
                    style: 'destructive',
                },
            ],
            'plain-text'
        );
    };

    const getStatusInfo = () => {
        switch (jobStatus) {
            case 'going_to_customer':
                return {
                    icon: 'car',
                    color: '#2196F3',
                    title: 'Đang di chuyển đến chỗ khách',
                    description: 'Vui lòng đến đúng thời gian hẹn',
                };
            case 'arrived':
                return {
                    icon: 'location',
                    color: '#FF9800',
                    title: 'Đã đến nơi',
                    description: 'Bắt đầu công việc khi sẵn sàng',
                };
            case 'working':
                return {
                    icon: 'hammer',
                    color: '#4CAF50',
                    title: 'Đang làm việc',
                    description: 'Thời gian làm việc đang được tính',
                };
            default:
                return {
                    icon: 'checkmark-circle',
                    color: '#4CAF50',
                    title: 'Hoàn thành',
                    description: 'Công việc đã hoàn tất',
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <SafeAreaView style={styles.container}>
            {/* Status Header */}
            <View style={[styles.statusHeader, { backgroundColor: statusInfo.color }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.statusContent}>
                    <Ionicons name={statusInfo.icon} size={40} color="white" />
                    <Text style={styles.statusTitle}>{statusInfo.title}</Text>
                    <Text style={styles.statusDescription}>{statusInfo.description}</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Timer (if working) */}
                {jobStatus === 'working' && (
                    <View style={styles.timerCard}>
                        <Ionicons name="time" size={32} color="#FF6B35" />
                        <View style={styles.timerContent}>
                            <Text style={styles.timerLabel}>Thời gian làm việc</Text>
                            <Text style={styles.timerValue}>{formatTime(timer)}</Text>
                        </View>
                    </View>
                )}

                {/* Customer Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Thông tin khách hàng</Text>
                    <View style={styles.customerInfo}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person-circle" size={60} color="#FF6B35" />
                        </View>
                        <View style={styles.customerDetails}>
                            <Text style={styles.customerName}>{job.customer}</Text>
                            <TouchableOpacity style={styles.phoneButton} onPress={handleCall}>
                                <Ionicons name="call" size={16} color="#2196F3" />
                                <Text style={styles.phoneText}>{job.phone}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Service Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Chi tiết dịch vụ</Text>
                    <View style={styles.serviceInfo}>
                        <Ionicons name="construct" size={24} color="#FF6B35" />
                        <Text style={styles.serviceName}>{job.service}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="reader" size={18} color="#666" />
                        <Text style={styles.detailText}>{job.description}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Thu nhập</Text>
                        <Text style={styles.priceValue}>
                            {job.price.toLocaleString('vi-VN')} ₫
                        </Text>
                    </View>
                </View>

                {/* Location */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Địa điểm</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={20} color="#FF3B30" />
                        <Text style={styles.addressText}>{job.address}</Text>
                    </View>
                    <View style={styles.distanceRow}>
                        <Ionicons name="navigate" size={18} color="#2196F3" />
                        <Text style={styles.distanceText}>Cách bạn {job.distance}</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                        <Ionicons name="call" size={24} color="#4CAF50" />
                        <Text style={styles.actionLabel}>Gọi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
                        <Ionicons name="chatbubble" size={24} color="#2196F3" />
                        <Text style={styles.actionLabel}>Nhắn tin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleNavigate}>
                        <Ionicons name="navigate" size={24} color="#FF9800" />
                        <Text style={styles.actionLabel}>Chỉ đường</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Action Button */}
            <View style={styles.footer}>
                {/* Cancel Button - hiển thị cho tất cả status trừ completed */}
                {jobStatus !== 'completed' && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelBooking}
                        disabled={updating}
                    >
                        <Ionicons name="close-circle" size={20} color="#F44336" />
                        <Text style={styles.cancelButtonText}>Hủy công việc</Text>
                    </TouchableOpacity>
                )}
                
                {jobStatus === 'pending' && (
                    <TouchableOpacity
                        style={[styles.mainButton, { backgroundColor: '#4CAF50' }]}
                        onPress={handleConfirmJob}
                        disabled={updating}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                        <Text style={styles.mainButtonText}>
                            {updating ? 'Đang xử lý...' : 'Xác nhận công việc'}
                        </Text>
                    </TouchableOpacity>
                )}
                {jobStatus === 'confirmed' && (
                    <TouchableOpacity
                        style={[styles.mainButton, { backgroundColor: '#2196F3' }]}
                        onPress={handleStartGoing}
                        disabled={updating}
                    >
                        <Ionicons name="navigate" size={24} color="white" />
                        <Text style={styles.mainButtonText}>
                            {updating ? 'Đang xử lý...' : 'Bắt đầu di chuyển'}
                        </Text>
                    </TouchableOpacity>
                )}
                {jobStatus === 'going_to_customer' && (
                    <TouchableOpacity
                        style={[styles.mainButton, { backgroundColor: '#FF9800' }]}
                        onPress={handleArrived}
                        disabled={updating}
                    >
                        <Ionicons name="location" size={24} color="white" />
                        <Text style={styles.mainButtonText}>
                            {updating ? 'Đang xử lý...' : 'Đã đến nơi'}
                        </Text>
                    </TouchableOpacity>
                )}
                {jobStatus === 'arrived' && (
                    <TouchableOpacity
                        style={[styles.mainButton, { backgroundColor: '#4CAF50' }]}
                        onPress={handleStartWork}
                        disabled={updating}
                    >
                        <Ionicons name="hammer" size={24} color="white" />
                        <Text style={styles.mainButtonText}>
                            {updating ? 'Đang xử lý...' : 'Bắt đầu làm việc'}
                        </Text>
                    </TouchableOpacity>
                )}
                {jobStatus === 'working' && (
                    <TouchableOpacity
                        style={[styles.mainButton, { backgroundColor: '#2196F3' }]}
                        onPress={handleCompleteWork}
                        disabled={updating}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                        <Text style={styles.mainButtonText}>
                            {updating ? 'Đang xử lý...' : 'Hoàn thành công việc'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    statusHeader: {
        padding: 20,
        paddingTop: 15,
        paddingBottom: 30,
    },
    backButton: {
        marginBottom: 15,
    },
    statusContent: {
        alignItems: 'center',
        gap: 8,
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 5,
    },
    statusDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    timerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 15,
        marginBottom: 10,
        padding: 20,
        borderRadius: 15,
        gap: 15,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    timerContent: {
        flex: 1,
    },
    timerLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    timerValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        fontVariant: ['tabular-nums'],
    },
    card: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        marginBottom: 10,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    avatarContainer: {
        alignItems: 'center',
    },
    customerDetails: {
        flex: 1,
    },
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    phoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    phoneText: {
        fontSize: 15,
        color: '#2196F3',
        fontWeight: '600',
    },
    serviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 15,
    },
    detailText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#4CAF5015',
        padding: 12,
        borderRadius: 10,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    priceValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
    },
    addressText: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
    },
    distanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    distanceText: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        marginHorizontal: 15,
        marginBottom: 15,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    footer: {
        padding: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#F44336',
        marginBottom: 10,
    },
    cancelButtonText: {
        color: '#F44336',
        fontSize: 15,
        fontWeight: '600',
    },
    mainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    mainButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
