import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingConfirmationScreen = ({ navigation, route }) => {
    const { jobId, bookingId, technician, date, time, payment, category, serviceDetail } = route.params;
    
    // Kiểm tra xem có thợ hay không
    const hasWorker = technician && technician.id;
    
    // Sử dụng jobId hoặc bookingId tùy theo màn hình nào gọi
    const displayId = jobId || bookingId;

    const handleBackHome = () => {
        navigation.navigate('Home');
    };

    const handleViewBooking = () => {
        // Navigate to booking details/history - có thể truyền jobId hoặc bookingId
        navigation.navigate('Bookings', { jobId, bookingId });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Success Icon */}
                <View style={styles.successContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="checkmark" size={60} color="#fff" />
                    </View>
                    <Text style={styles.successTitle}>Đặt Lịch Thành Công!</Text>
                    <Text style={styles.successSubtitle}>
                        {hasWorker 
                            ? 'Chúng tôi đã gửi thông báo đến thợ sửa chữa'
                            : 'Hệ thống sẽ tự động tìm và thông báo đến thợ phù hợp'
                        }
                    </Text>
                </View>

                {/* Booking Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>📋 Thông Tin Đặt Lịch</Text>

                    {displayId && (
                        <View style={styles.detailRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="barcode" size={20} color="#2196F3" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Mã đặt lịch</Text>
                                <Text style={styles.detailValue}>#{displayId}</Text>
                            </View>
                        </View>
                    )}

                    {hasWorker ? (
                        <View style={styles.detailRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="person" size={20} color="#2196F3" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Thợ sửa chữa</Text>
                                <Text style={styles.detailValue}>{technician.name}</Text>
                                <Text style={styles.detailSubtext}>{technician.specialty}</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.detailRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="people" size={20} color="#2196F3" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Thợ sửa chữa</Text>
                                <Text style={styles.detailValue}>Hệ thống sẽ tự động phân công</Text>
                                <Text style={styles.detailSubtext}>Sẽ thông báo đến bạn sau ít phút</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="calendar" size={20} color="#2196F3" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Ngày hẹn</Text>
                            <Text style={styles.detailValue}>
                                {date.day}, {date.date}/{date.month}/2026
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="time" size={20} color="#2196F3" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Giờ hẹn</Text>
                            <Text style={styles.detailValue}>{time.time}</Text>
                        </View>
                    </View>

                    {(category || serviceDetail) && (
                        <View style={styles.detailRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="construct" size={20} color="#2196F3" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Dịch vụ</Text>
                                <Text style={styles.detailValue}>
                                    {serviceDetail?.name || category}
                                </Text>
                                {serviceDetail?.description && (
                                    <Text style={styles.detailSubtext}>
                                        {serviceDetail.description}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="card" size={20} color="#2196F3" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Thanh toán</Text>
                            <Text style={styles.detailValue}>
                                {payment === 'card' && 'Thẻ ngân hàng'}
                                {payment === 'momo' && 'Ví MoMo'}
                                {payment === 'zalopay' && 'ZaloPay'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Next Steps */}
                <View style={styles.stepsCard}>
                    <Text style={styles.cardTitle}>🚀 Bước Tiếp Theo</Text>

                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Thợ sẽ liên hệ xác nhận trong vòng 15 phút
                        </Text>
                    </View>

                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Nhận nhắc nhở trước 1 giờ khi có lịch hẹn
                        </Text>
                    </View>

                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Thợ đến tận nơi và thực hiện dịch vụ
                        </Text>
                    </View>

                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Thanh toán và đánh giá sau khi hoàn thành
                        </Text>
                    </View>
                </View>

                {/* Support Card */}
                <View style={styles.supportCard}>
                    <Ionicons name="headset" size={24} color="#1E88E5" />
                    <View style={styles.supportContent}>
                        <Text style={styles.supportTitle}>Cần hỗ trợ?</Text>
                        <Text style={styles.supportText}>
                            Liên hệ hotline: 1900-1234 (24/7)
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.callButton}>
                        <Ionicons name="call" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Warranty Info */}
                <View style={styles.warrantyCard}>
                    <Ionicons name="shield-checkmark" size={24} color="#7ED321" />
                    <Text style={styles.warrantyText}>
                        Dịch vụ được bảo hành 30 ngày và hỗ trợ miễn phí nếu có sự cố
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleViewBooking}>
                        <Ionicons name="list" size={20} color="#2196F3" />
                        <Text style={styles.secondaryButtonText}>Xem Chi Tiết</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleBackHome}>
                        <Ionicons name="home" size={20} color="#fff" />
                        <Text style={styles.primaryButtonText}>Về Trang Chủ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    successContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 5,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    detailSubtext: {
        fontSize: 12,
        color: '#666',
    },
    stepsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
        paddingTop: 4,
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0F5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    supportContent: {
        flex: 1,
        marginLeft: 12,
    },
    supportTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    supportText: {
        fontSize: 12,
        color: '#666',
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E88E5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    warrantyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F8E9',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        gap: 12,
    },
    warrantyText: {
        flex: 1,
        fontSize: 12,
        color: '#558B2F',
        lineHeight: 18,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2196F3',
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#2196F3',
        paddingVertical: 14,
        borderRadius: 12,
        elevation: 3,
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});

export default BookingConfirmationScreen;
