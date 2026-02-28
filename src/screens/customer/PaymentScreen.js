import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';

export default function PaymentScreen({ route, navigation }) {
    const { bookingId } = route.params;
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const response = await apiClient.get(`/api/bookings/${bookingId}`);
            setBooking(response.data);
        } catch (error) {
            console.error('Error fetching booking:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        try {
            setPaymentLoading(true);

            // Theo API spec và database schema:
            // - payment_type: deposit, final, refund
            // - payment_method: vnpay, momo, zalopay, cash, bank_transfer
            const paymentData = {
                amount: booking.finalAmount,
                paymentType: 'final', // final payment (thanh toán cuối)
                paymentMethod: paymentMethod, // cash, vnpay, momo, etc.
            };

            console.log('💳 Creating payment:', paymentData);

            const response = await apiClient.post(
                `/api/bookings/${bookingId}/payments`,
                paymentData
            );

            console.log('✅ Payment created:', response.data);

            Alert.alert(
                'Thanh toán thành công!',
                'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate('Bookings', { refresh: true });
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('❌ Payment error:', error);
            console.error('❌ Error response:', error.response?.data);
            Alert.alert(
                'Lỗi thanh toán',
                error.response?.data?.message || 'Không thể thực hiện thanh toán. Vui lòng thử lại.'
            );
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!booking) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#999" />
                    <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Success Card */}
                <View style={styles.successCard}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                    </View>
                    <Text style={styles.successTitle}>Công việc hoàn tất!</Text>
                    <Text style={styles.successSubtitle}>
                        Vui lòng xác nhận thông tin để thanh toán
                    </Text>
                </View>

                {/* Booking Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tóm tắt công việc</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Dịch vụ</Text>
                        <Text style={styles.summaryValue}>
                            {booking.Job?.title || 'Dịch vụ sửa chữa'}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Khách hàng</Text>
                        <Text style={styles.summaryValue}>
                            {booking.Customer?.fullName || 'Khách hàng'}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Thời gian làm</Text>
                        <Text style={styles.summaryValue}>
                            {booking.actualDuration ? `${booking.actualDuration} phút` : '0 phút'}
                        </Text>
                    </View>

                    {booking.Job?.description && (
                        <View style={styles.descriptionBox}>
                            <Ionicons name="document-text-outline" size={16} color="#666" />
                            <Text style={styles.descriptionText}>{booking.Job.description}</Text>
                        </View>
                    )}
                </View>

                {/* Payment Details */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>

                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Tiền dịch vụ</Text>
                        <Text style={styles.paymentValue}>
                            {booking.finalAmount?.toLocaleString('vi-VN')}đ
                        </Text>
                    </View>

                    {booking.depositAmount > 0 && (
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Đã đặt cọc</Text>
                            <Text style={styles.paymentValueDeposit}>
                                -{booking.depositAmount.toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.paymentRow}>
                        <Text style={styles.totalLabel}>Thu nhập ước tính</Text>
                        <Text style={styles.totalValue}>
                            {(booking.finalAmount - (booking.depositAmount || 0)).toLocaleString('vi-VN')}đ
                        </Text>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Phương thức thanh toán</Text>

                    <TouchableOpacity
                        style={[
                            styles.paymentMethodCard,
                            paymentMethod === 'cash' && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setPaymentMethod('cash')}
                    >
                        <View style={styles.paymentMethodLeft}>
                            <View style={styles.paymentMethodIcon}>
                                <Ionicons name="cash-outline" size={24} color="#4CAF50" />
                            </View>
                            <View>
                                <Text style={styles.paymentMethodTitle}>Tiền mặt</Text>
                                <Text style={styles.paymentMethodSubtitle}>
                                    Thanh toán bằng tiền mặt
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.radioButton,
                                paymentMethod === 'cash' && styles.radioButtonSelected,
                            ]}
                        >
                            {paymentMethod === 'cash' && (
                                <View style={styles.radioButtonInner} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentMethodCard,
                            paymentMethod === 'bank_transfer' && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setPaymentMethod('bank_transfer')}
                    >
                        <View style={styles.paymentMethodLeft}>
                            <View style={styles.paymentMethodIcon}>
                                <Ionicons name="card-outline" size={24} color="#2196F3" />
                            </View>
                            <View>
                                <Text style={styles.paymentMethodTitle}>Chuyển khoản</Text>
                                <Text style={styles.paymentMethodSubtitle}>
                                    Chuyển khoản ngân hàng
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.radioButton,
                                paymentMethod === 'bank_transfer' && styles.radioButtonSelected,
                            ]}
                        >
                            {paymentMethod === 'bank_transfer' && (
                                <View style={styles.radioButtonInner} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentMethodCard,
                            paymentMethod === 'momo' && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setPaymentMethod('momo')}
                    >
                        <View style={styles.paymentMethodLeft}>
                            <View style={styles.paymentMethodIcon}>
                                <Ionicons name="wallet-outline" size={24} color="#D82D8B" />
                            </View>
                            <View>
                                <Text style={styles.paymentMethodTitle}>Ví MoMo</Text>
                                <Text style={styles.paymentMethodSubtitle}>
                                    Thanh toán qua ví MoMo
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.radioButton,
                                paymentMethod === 'momo' && styles.radioButtonSelected,
                            ]}
                        >
                            {paymentMethod === 'momo' && (
                                <View style={styles.radioButtonInner} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentMethodCard,
                            paymentMethod === 'zalopay' && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setPaymentMethod('zalopay')}
                    >
                        <View style={styles.paymentMethodLeft}>
                            <View style={styles.paymentMethodIcon}>
                                <Ionicons name="wallet-outline" size={24} color="#0068FF" />
                            </View>
                            <View>
                                <Text style={styles.paymentMethodTitle}>ZaloPay</Text>
                                <Text style={styles.paymentMethodSubtitle}>
                                    Thanh toán qua ZaloPay
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.radioButton,
                                paymentMethod === 'zalopay' && styles.radioButtonSelected,
                            ]}
                        >
                            {paymentMethod === 'zalopay' && (
                                <View style={styles.radioButtonInner} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentMethodCard,
                            paymentMethod === 'vnpay' && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setPaymentMethod('vnpay')}
                    >
                        <View style={styles.paymentMethodLeft}>
                            <View style={styles.paymentMethodIcon}>
                                <Ionicons name="card-outline" size={24} color="#0D47A1" />
                            </View>
                            <View>
                                <Text style={styles.paymentMethodTitle}>VNPay</Text>
                                <Text style={styles.paymentMethodSubtitle}>
                                    Thanh toán qua VNPay
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.radioButton,
                                paymentMethod === 'vnpay' && styles.radioButtonSelected,
                            ]}
                        >
                            {paymentMethod === 'vnpay' && (
                                <View style={styles.radioButtonInner} />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Payment Button */}
            <View style={styles.footer}>
                <View style={styles.footerTop}>
                    <Text style={styles.footerLabel}>Tổng tiền</Text>
                    <Text style={styles.footerAmount}>
                        {booking.finalAmount?.toLocaleString('vi-VN')}đ
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.payButton, paymentLoading && styles.payButtonDisabled]}
                    onPress={handlePayment}
                    disabled={paymentLoading}
                >
                    {paymentLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color="white" />
                            <Text style={styles.payButtonText}>Xác nhận thanh toán</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#2196F3',
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    successCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
    },
    successIcon: {
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    descriptionBox: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        gap: 8,
    },
    descriptionText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    paymentLabel: {
        fontSize: 14,
        color: '#666',
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    paymentValueDeposit: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4CAF50',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4CAF50',
    },
    paymentMethodCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    paymentMethodSelected: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    paymentMethodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentMethodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    paymentMethodTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    paymentMethodSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#CCC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#4CAF50',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    footerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    footerLabel: {
        fontSize: 16,
        color: '#666',
    },
    footerAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4CAF50',
    },
    payButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 12,
    },
    payButtonDisabled: {
        opacity: 0.6,
    },
    payButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
