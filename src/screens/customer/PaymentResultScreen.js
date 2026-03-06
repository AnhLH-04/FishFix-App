import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import paymentService from '../../services/paymentService';
import colors from '../../utils/colors';

const PaymentResultScreen = ({ route, navigation }) => {
    const { bookingId, paymentId, method } = route.params;
    const [status, setStatus] = useState('PENDING');
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        pollPaymentStatus();
    }, []);

    const pollPaymentStatus = async () => {
        try {
            setLoading(true);
            
            const finalStatus = await paymentService.pollPaymentStatus(
                paymentId,
                (updatedStatus) => {
                    console.log('📊 Payment status updated:', updatedStatus);
                    setStatus(updatedStatus.status);
                    setPaymentData(updatedStatus);
                },
                60 // 60 attempts = 2.5 mins
            );
            
            setStatus(finalStatus.status);
            setPaymentData(finalStatus);
            
        } catch (error) {
            console.error('Error polling payment:', error);
            Alert.alert(
                'Lỗi',
                'Không thể kiểm tra trạng thái thanh toán. Vui lòng kiểm tra lại trong mục đơn hàng.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('BookingHistory')
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setLoading(true);
        pollPaymentStatus();
    };

    const handleBackToBookings = () => {
        navigation.navigate('BookingHistory');
    };

    const renderStatusIcon = () => {
        if (loading || status === 'PENDING' || status === 'CREATED') {
            return (
                <ActivityIndicator size={64} color={colors.primary} />
            );
        }
        
        if (status === 'SUCCEEDED') {
            return (
                <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            );
        }
        
        if (status === 'FAILED' || status === 'CANCELLED') {
            return (
                <Ionicons name="close-circle" size={80} color="#F44336" />
            );
        }
        
        if (status === 'EXPIRED') {
            return (
                <Ionicons name="time" size={80} color="#FF9800" />
            );
        }
        
        return (
            <Ionicons name="alert-circle" size={80} color="#999" />
        );
    };

    const renderStatusMessage = () => {
        if (loading || status === 'PENDING' || status === 'CREATED') {
            return {
                title: 'Đang xử lý thanh toán',
                message: 'Vui lòng đợi trong giây lát...',
                color: colors.primary
            };
        }
        
        if (status === 'SUCCEEDED') {
            return {
                title: 'Thanh toán thành công!',
                message: 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
                color: '#4CAF50'
            };
        }
        
        if (status === 'FAILED') {
            return {
                title: 'Thanh toán thất bại',
                message: 'Giao dịch không thành công. Vui lòng thử lại.',
                color: '#F44336'
            };
        }
        
        if (status === 'CANCELLED') {
            return {
                title: 'Thanh toán đã hủy',
                message: 'Bạn đã hủy giao dịch.',
                color: '#F44336'
            };
        }
        
        if (status === 'EXPIRED') {
            return {
                title: 'Thanh toán hết hạn',
                message: 'Giao dịch đã hết thời gian xử lý.',
                color: '#FF9800'
            };
        }
        
        return {
            title: 'Trạng thái không xác định',
            message: 'Vui lòng kiểm tra lại trong mục đơn hàng.',
            color: '#999'
        };
    };

    const statusInfo = renderStatusMessage();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    {renderStatusIcon()}
                </View>

                <Text style={[styles.title, { color: statusInfo.color }]}>
                    {statusInfo.title}
                </Text>
                
                <Text style={styles.message}>
                    {statusInfo.message}
                </Text>

                {paymentData && (
                    <View style={styles.detailCard}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Phương thức:</Text>
                            <Text style={styles.detailValue}>{method}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Mã thanh toán:</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>
                                {paymentId.substring(0, 12)}...
                            </Text>
                        </View>
                        {paymentData.amount && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Số tiền:</Text>
                                <Text style={[styles.detailValue, styles.amountText]}>
                                    {paymentData.amount.toLocaleString('vi-VN')} đ
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.actions}>
                    {(status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED') && (
                        <TouchableOpacity
                            style={[styles.button, styles.retryButton]}
                            onPress={handleRetry}
                            disabled={loading}
                        >
                            <Ionicons name="refresh" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Kiểm tra lại</Text>
                        </TouchableOpacity>
                    )}
                    
                    {status === 'SUCCEEDED' && (
                        <TouchableOpacity
                            style={[styles.button, styles.successButton]}
                            onPress={handleBackToBookings}
                        >
                            <Ionicons name="checkmark" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Xong</Text>
                        </TouchableOpacity>
                    )}
                    
                    {!loading && status !== 'PENDING' && status !== 'CREATED' && (
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={handleBackToBookings}
                        >
                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                                Về trang đơn hàng
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    detailCard: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    amountText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: 'bold',
    },
    actions: {
        width: '100%',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    successButton: {
        backgroundColor: '#4CAF50',
    },
    retryButton: {
        backgroundColor: colors.primary,
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButtonText: {
        color: colors.primary,
    },
});

export default PaymentResultScreen;
