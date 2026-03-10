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
import paymentService from '../../services/paymentService';
import * as WebBrowser from 'expo-web-browser';
import colors from '../../utils/colors';

export default function PaymentScreen({ route, navigation }) {
    const { bookingId } = route.params;
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('SEPAY'); // Changed to SEPAY as default

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const response = await apiClient.get(`/api/bookings/${bookingId}`);
            setBooking(response.data);
            
            // // Check if booking already has successful payment
            // try {
            //     const latestPayment = await paymentService.getLatestPayment(bookingId);
            //     if (latestPayment && latestPayment.status === 'SUCCEEDED') {
            //         console.log('⚠️ Booking already has successful payment:', latestPayment);
            //         Alert.alert(
            //             'Đã thanh toán',
            //             'Booking này đã được thanh toán thành công rồi.',
            //             [
            //                 {
            //                     text: 'Về danh sách booking',
            //                     onPress: () => navigation.goBack()
            //                 }
            //             ]
            //         );
            //     }
            // } catch (paymentError) {
            //     // 404 means no payment exists yet
            //     if (paymentError.status === 404) {
            //         console.log('ℹ️ No payment record found for this booking');
                    
            //         // If booking is in_progress with finalAmount, it's ready for payment
            //         if (response.data.status === 'in_progress' && response.data.finalAmount) {
            //             console.log('✅ Booking ready for payment - finalAmount:', response.data.finalAmount);
            //             // No alert needed, customer can proceed to pay
            //         }
            //         // If booking is completed but no payment, show warning
            //         else if (response.data.status === 'completed') {
            //             Alert.alert(
            //                 'Cảnh báo',
            //                 'Booking này đã hoàn thành nhưng chưa có thông tin thanh toán. Có thể đã thanh toán bằng tiền mặt hoặc phương thức khác.\n\nBạn có muốn tiếp tục thanh toán online không?',
            //                 [
            //                     {
            //                         text: 'Hủy',
            //                         style: 'cancel',
            //                         onPress: () => navigation.goBack()
            //                     },
            //                     {
            //                         text: 'Tiếp tục',
            //                         style: 'default'
            //                     }
            //                 ]
            //             );
            //         }
            //     } else {
            //         console.error('Error checking payment status:', paymentError);
            //     }
            // }
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

            // Validate booking status
            if (booking?.status === 'completed' && booking?.paymentStatus === 'paid') {
                Alert.alert(
                    'Đã thanh toán',
                    'Booking này đã được thanh toán rồi.'
                );
                setPaymentLoading(false);
                return;
            }

            // Check if booking is in valid state for payment
            const validStatuses = ['confirmed', 'in_progress', 'assigned'];
            if (booking?.status && !validStatuses.includes(booking.status.toLowerCase())) {
                Alert.alert(
                    'Không thể thanh toán',
                    `Booking đang ở trạng thái "${booking.status}".\n\n` +
                    `Chỉ có thể thanh toán khi booking đang được xử lý.`
                );
                setPaymentLoading(false);
                return;
            }

            // Check if finalAmount exists
            if (!booking?.finalAmount || booking.finalAmount <= 0) {
                Alert.alert(
                    'Chưa có thông tin thanh toán',
                    'Vui lòng đợi thợ hoàn thành công việc và xác nhận chi phí.'
                );
                setPaymentLoading(false);
                return;
            }

            if (paymentMethod === 'VNPAY') {
                // VNPAY flow
                const paymentData = await paymentService.createVNPAYPayment(bookingId);
                
                // Open checkout URL in browser
                const result = await WebBrowser.openBrowserAsync(paymentData.checkoutUrl);
                
                // Navigate to payment result screen to poll status
                navigation.replace('PaymentResult', {
                    bookingId,
                    paymentId: paymentData.paymentId,
                    method: 'VNPAY'
                });
                
            } else if (paymentMethod === 'SEPAY') {
                // SePay QR flow
                const amount = booking.finalAmount || booking.estimatedCost || 0;
                const paymentData = await paymentService.createSepayPayment(
                    bookingId,
                    amount,
                    `Thanh toán booking ${bookingId.substring(0, 8)}`
                );
                
                // Navigate to QR screen
                navigation.replace('SepayQR', {
                    bookingId,
                    orderCode: paymentData.orderCode,
                    paymentCode: paymentData.paymentCode,
                    qrImageUrl: paymentData.qrImageUrl,
                    amount: paymentData.amount,
                    paymentId: paymentData.paymentId
                });
                
            } else {
                // Cash or other payment methods (old flow)
                const paymentData = {
                    amount: booking.finalAmount,
                    paymentType: 'final',
                    paymentMethod: paymentMethod,
                };

                const response = await apiClient.post(
                    `/api/bookings/${bookingId}/payments`,
                    paymentData
                );

                Alert.alert(
                    'Thanh toán thành công!',
                    'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.navigate('BookingHistory');
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('❌ Payment error:', error);
            console.error('❌ Error response:', error.response?.data);
            
            let errorMessage = 'Không thể thực hiện thanh toán. Vui lòng thử lại.';
            
            // Handle specific error cases
            if (error.status === 500) {
                if (booking?.status === 'completed') {
                    errorMessage = 'Không thể tạo thanh toán cho booking đã hoàn thành.\n\nVui lòng liên hệ hỗ trợ nếu bạn cần thanh toán cho booking này.';
                } else {
                    errorMessage = 'Lỗi server. Backend không thể xử lý thanh toán.\n\nVui lòng thử lại sau hoặc liên hệ hỗ trợ.';
                }
            } else if (error.status === 400) {
                errorMessage = error.message || 'Dữ liệu thanh toán không hợp lệ.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Alert.alert(
                'Lỗi thanh toán',
                errorMessage,
                [
                    {
                        text: 'Đóng',
                        style: 'cancel'
                    },
                    booking?.status === 'completed' && {
                        text: 'Quay lại',
                        onPress: () => navigation.goBack()
                    }
                ].filter(Boolean)
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
                            paymentMethod === 'VNPAY' && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setPaymentMethod('VNPAY')}
                    >
                        <View style={styles.paymentMethodLeft}>
                            <View style={styles.paymentMethodIcon}>
                                <Ionicons name="card-outline" size={24} color="#0D47A1" />
                            </View>
                            <View>
                                <Text style={styles.paymentMethodTitle}>VNPAY</Text>
                                <Text style={styles.paymentMethodSubtitle}>
                                    Thẻ ATM, Visa, MasterCard
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.radioButton,
                                paymentMethod === 'VNPAY' && styles.radioButtonSelected,
                            ]}
                        >
                            {paymentMethod === 'VNPAY' && (
                                <View style={styles.radioButtonInner} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentMethodCard,
                            paymentMethod === 'SEPAY' && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setPaymentMethod('SEPAY')}
                    >
                        <View style={styles.paymentMethodLeft}>
                            <View style={styles.paymentMethodIcon}>
                                <Ionicons name="qr-code-outline" size={24} color="#4CAF50" />
                            </View>
                            <View>
                                <Text style={styles.paymentMethodTitle}>Chuyển khoản QR</Text>
                                <Text style={styles.paymentMethodSubtitle}>
                                    Quét mã QR để thanh toán
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.radioButton,
                                paymentMethod === 'SEPAY' && styles.radioButtonSelected,
                            ]}
                        >
                            {paymentMethod === 'SEPAY' && (
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
