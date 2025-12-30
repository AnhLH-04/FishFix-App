import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InstantBookingConfirmationScreen = ({ route, navigation }) => {
    const { technician, service, address } = route.params || {};
    const [status, setStatus] = useState('finding'); // finding, confirmed, onway

    useEffect(() => {
        // Simulate status updates
        const timer1 = setTimeout(() => {
            setStatus('confirmed');
        }, 2000);

        const timer2 = setTimeout(() => {
            setStatus('onway');
        }, 4000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const getStatusConfig = () => {
        switch (status) {
            case 'finding':
                return {
                    icon: 'hourglass-outline',
                    title: 'Đang xác nhận...',
                    subtitle: 'Chờ thợ xác nhận yêu cầu',
                    color: '#FF9800',
                };
            case 'confirmed':
                return {
                    icon: 'checkmark-circle',
                    title: 'Đã xác nhận!',
                    subtitle: 'Thợ đang chuẩn bị đến',
                    color: '#4CAF50',
                };
            case 'onway':
                return {
                    icon: 'car',
                    title: 'Đang trên đường!',
                    subtitle: `Dự kiến đến trong ${technician?.eta} phút`,
                    color: '#2196F3',
                };
            default:
                return {};
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('HomeTab')}
                    style={styles.closeButton}
                >
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trạng Thái Đặt Lịch</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Status Animation */}
                    <View style={[styles.statusCircle, { borderColor: statusConfig.color }]}>
                        <Ionicons name={statusConfig.icon} size={80} color={statusConfig.color} />
                    </View>

                    <Text style={styles.statusTitle}>{statusConfig.title}</Text>
                    <Text style={styles.statusSubtitle}>{statusConfig.subtitle}</Text>

                    {/* Progress Steps */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressStep}>
                            <View style={[styles.progressDot, styles.progressDotActive]}>
                                <Ionicons name="checkmark" size={16} color="#fff" />
                            </View>
                            <Text style={styles.progressLabel}>Đặt lịch</Text>
                        </View>
                        <View style={[styles.progressLine, status !== 'finding' && styles.progressLineActive]} />
                        <View style={styles.progressStep}>
                            <View style={[styles.progressDot, status !== 'finding' && styles.progressDotActive]}>
                                {status !== 'finding' && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </View>
                            <Text style={styles.progressLabel}>Xác nhận</Text>
                        </View>
                        <View style={[styles.progressLine, status === 'onway' && styles.progressLineActive]} />
                        <View style={styles.progressStep}>
                            <View style={[styles.progressDot, status === 'onway' && styles.progressDotActive]}>
                                {status === 'onway' && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </View>
                            <Text style={styles.progressLabel}>Đang đến</Text>
                        </View>
                    </View>

                    {/* Technician Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông Tin Thợ</Text>
                        <View style={styles.techCard}>
                            <View style={styles.techHeader}>
                                <Text style={styles.techAvatar}>{technician?.avatar}</Text>
                                <View style={styles.techInfo}>
                                    <Text style={styles.techName}>{technician?.name}</Text>
                                    <Text style={styles.techSpecialty}>{technician?.specialty}</Text>
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={14} color="#FFA000" />
                                        <Text style={styles.rating}>{technician?.rating}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.techActions}>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Ionicons name="call" size={20} color="#2196F3" />
                                    <Text style={styles.actionText}>Gọi điện</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Ionicons name="chatbubble" size={20} color="#2196F3" />
                                    <Text style={styles.actionText}>Nhắn tin</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Booking Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Chi Tiết Đặt Lịch</Text>
                        <View style={styles.detailsCard}>
                            <View style={styles.detailRow}>
                                <Ionicons name="construct" size={20} color="#666" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Dịch vụ</Text>
                                    <Text style={styles.detailValue}>{service}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="location" size={20} color="#666" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Địa chỉ</Text>
                                    <Text style={styles.detailValue}>{address}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="time" size={20} color="#666" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Thời gian</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date().toLocaleString('vi-VN')}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="cash" size={20} color="#666" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Chi phí dự kiến</Text>
                                    <Text style={[styles.detailValue, styles.priceText]}>
                                        {technician?.price.toLocaleString('vi-VN')} ₫
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Important Notes */}
                    <View style={styles.notesCard}>
                        <View style={styles.notesHeader}>
                            <Ionicons name="alert-circle" size={20} color="#FF9800" />
                            <Text style={styles.notesTitle}>Lưu ý quan trọng</Text>
                        </View>
                        <View style={styles.notesList}>
                            <Text style={styles.noteItem}>• Vui lòng chuẩn bị trước vị trí cần sửa chữa</Text>
                            <Text style={styles.noteItem}>• Đảm bảo có người ở nhà khi thợ đến</Text>
                            <Text style={styles.noteItem}>• Giá cuối cùng phụ thuộc vào mức độ hư hỏng</Text>
                            <Text style={styles.noteItem}>• Thanh toán sau khi hoàn thành công việc</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                        // Handle cancel booking
                    }}
                >
                    <Text style={styles.cancelButtonText}>Hủy Đặt Lịch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => navigation.navigate('HomeTab')}
                >
                    <Text style={styles.homeButtonText}>Về Trang Chủ</Text>
                </TouchableOpacity>
            </View>
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
    },
    closeButton: {
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
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    statusCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 32,
        backgroundColor: '#fff',
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    statusSubtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    progressStep: {
        alignItems: 'center',
        gap: 8,
    },
    progressDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressDotActive: {
        backgroundColor: '#4CAF50',
    },
    progressLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 8,
    },
    progressLineActive: {
        backgroundColor: '#4CAF50',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    techCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },
    techHeader: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    techAvatar: {
        fontSize: 56,
        marginRight: 12,
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
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    techActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3F2FD',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    actionText: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '600',
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        gap: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: '#999',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    priceText: {
        color: '#2196F3',
        fontWeight: 'bold',
        fontSize: 16,
    },
    notesCard: {
        backgroundColor: '#FFF9E6',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    notesTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E65100',
    },
    notesList: {
        gap: 6,
    },
    noteItem: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: 30,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F44336',
    },
    cancelButtonText: {
        color: '#F44336',
        fontSize: 15,
        fontWeight: '600',
    },
    homeButton: {
        flex: 1,
        backgroundColor: '#2196F3',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default InstantBookingConfirmationScreen;
