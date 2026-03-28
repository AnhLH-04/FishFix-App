import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import paymentService from '../../services/paymentService';
import colors from '../../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const SepayQRScreen = ({ route, navigation }) => {
    const { bookingId, orderCode, paymentCode, qrImageUrl, amount, paymentId } = route.params;
    const [polling, setPolling] = useState(true);
    const [status, setStatus] = useState('PENDING');
    const [orderData, setOrderData] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        pollOrderStatus();
    }, []);

    const pollOrderStatus = async () => {
        try {
            setPolling(true);
            
            const finalStatus = await paymentService.pollOrderStatus(
                orderCode,
                (updatedStatus) => {
                    setStatus(updatedStatus.status);
                    setOrderData(updatedStatus);
                },
                120 // 120 attempts = 5 mins
            );
            
            setStatus(finalStatus.status);
            setOrderData(finalStatus);
            
            if (finalStatus.status === 'PAID') {
                Alert.alert(
                    'Thanh toán thành công!',
                    'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('BookingHistory')
                        }
                    ]
                );
            }
            
        } catch (error) {
            console.error('Error polling order:', error);
            Alert.alert(
                'Hết thời gian chờ',
                'Vui lòng kiểm tra lại trong mục đơn hàng sau khi chuyển khoản.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('BookingHistory')
                    }
                ]
            );
        } finally {
            setPolling(false);
        }
    };

    const copyToClipboard = async (text, label) => {
        await Clipboard.setStringAsync(text);
        Alert.alert('Đã sao chép', `${label} đã được sao chép vào clipboard`);
    };

    const handleManualCheck = async () => {
        try {
            setPolling(true);
            const orderStatus = await paymentService.getOrderStatus(orderCode);
            
            if (orderStatus.status === 'PAID') {
                Alert.alert(
                    'Thanh toán thành công!',
                    'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('BookingHistory')
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Chưa nhận được thanh toán',
                    'Vui lòng chuyển khoản và quét lại mã QR hoặc nhập đúng nội dung chuyển khoản.'
                );
            }
            
            setStatus(orderStatus.status);
            setOrderData(orderStatus);
        } catch (error) {
            console.error('Error checking order status:', error);
            Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái thanh toán');
        } finally {
            setPolling(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    disabled={polling && status === 'PENDING'}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quét mã QR thanh toán</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Status Banner */}
                {polling && status === 'PENDING' ? (
                    <View style={styles.statusBanner}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.statusText}>
                            Đang chờ thanh toán...
                        </Text>
                    </View>
                ) : status === 'PAID' ? (
                    <View style={[styles.statusBanner, styles.successBanner]}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                            Đã thanh toán thành công!
                        </Text>
                    </View>
                ) : null}

                {/* QR Code */}
                <View style={styles.qrContainer}>
                    {imageLoading && !imageError && (
                        <View style={styles.qrLoading}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Đang tải mã QR...</Text>
                        </View>
                    )}
                    
                    {imageError ? (
                        <View style={styles.qrError}>
                            <Ionicons name="alert-circle-outline" size={64} color="#FF9800" />
                            <Text style={styles.errorText}>Không thể tải mã QR</Text>
                            <Text style={styles.errorSubtext}>
                                Vui lòng sử dụng thông tin chuyển khoản bên dưới
                            </Text>
                            <TouchableOpacity 
                                style={styles.retryButton}
                                onPress={() => {
                                    setImageError(false);
                                    setImageLoading(true);
                                }}
                            >
                                <Ionicons name="refresh" size={20} color={colors.primary} />
                                <Text style={styles.retryButtonText}>Thử lại</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Image
                            source={{ uri: qrImageUrl }}
                            style={[styles.qrImage, imageLoading && { opacity: 0 }]}
                            resizeMode="contain"
                            onLoadStart={() => {
                                console.log('🖼️ QR Image loading started');
                                setImageLoading(true);
                            }}
                            onLoad={() => {
                                console.log('✅ QR Image loaded successfully');
                                setImageLoading(false);
                                setImageError(false);
                            }}
                            onError={(error) => {
                                console.error('❌ QR Image load error:', error.nativeEvent);
                                setImageLoading(false);
                                setImageError(true);
                            }}
                        />
                    )}
                    
                    {!imageError && (
                        <Text style={styles.qrInstruction}>
                            Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                        </Text>
                    )}
                </View>

                {/* Payment Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Thông tin chuyển khoản</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số tiền:</Text>
                        <TouchableOpacity 
                            style={styles.copyButton}
                            onPress={() => copyToClipboard(amount.toString(), 'Số tiền')}
                        >
                            <Text style={styles.infoValue}>
                                {amount.toLocaleString('vi-VN')} đ
                            </Text>
                            <Ionicons name="copy-outline" size={18} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nội dung CK:</Text>
                        <TouchableOpacity 
                            style={styles.copyButton}
                            onPress={() => copyToClipboard(paymentCode, 'Nội dung chuyển khoản')}
                        >
                            <Text style={[styles.infoValue, styles.paymentCode]} numberOfLines={1}>
                                {paymentCode}
                            </Text>
                            <Ionicons name="copy-outline" size={18} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.warningBox}>
                        <Ionicons name="information-circle" size={20} color="#FF9800" />
                        <Text style={styles.warningText}>
                            Vui lòng nhập chính xác nội dung chuyển khoản để hệ thống tự động xác nhận thanh toán
                        </Text>
                    </View>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>Hướng dẫn thanh toán</Text>
                    
                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Mở ứng dụng ngân hàng và chọn chức năng quét QR
                        </Text>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Quét mã QR phía trên
                        </Text>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Kiểm tra thông tin và xác nhận chuyển khoản
                        </Text>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Hệ thống sẽ tự động xác nhận sau khi nhận được tiền
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.checkButton, polling && styles.checkButtonDisabled]}
                    onPress={handleManualCheck}
                    disabled={polling}
                >
                    {polling ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="refresh" size={20} color="#fff" />
                            <Text style={styles.checkButtonText}>
                                Kiểm tra thanh toán
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#FFF3E0',
        gap: 8,
    },
    successBanner: {
        backgroundColor: '#E8F5E9',
    },
    statusText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    qrContainer: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
        margin: 16,
        borderRadius: 12,
        minHeight: 350,
        justifyContent: 'center',
    },
    qrLoading: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
    },
    qrError: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        marginTop: 8,
    },
    retryButtonText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    qrImage: {
        width: 280,
        height: 280,
        marginBottom: 16,
        backgroundColor: '#F5F5F5',
    },
    qrInstruction: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        justifyContent: 'flex-end',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    paymentCode: {
        color: colors.primary,
        fontFamily: 'monospace',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    instructionsCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        paddingTop: 4,
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    checkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    checkButtonDisabled: {
        backgroundColor: '#CCC',
    },
    checkButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SepayQRScreen;
