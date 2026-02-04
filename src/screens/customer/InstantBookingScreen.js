import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InstantBookingScreen = ({ route, navigation }) => {
    const { technician, service } = route.params || {};

    const [address, setAddress] = useState('123 Nguyễn Huệ, Quận 1, TP.HCM');
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const handleConfirmBooking = () => {
        Alert.alert(
            'Xác nhận đặt lịch',
            `Bạn có chắc muốn gọi thợ ${technician.name} đến ngay?`,
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Xác nhận',
                    onPress: () => {
                        // Process instant booking
                        navigation.navigate('InstantBookingConfirmation', {
                            technician,
                            service,
                            address,
                            note,
                            paymentMethod,
                        });
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Xác Nhận Đặt Lịch Ngay</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Urgent Banner */}
                    <View style={styles.urgentBanner}>
                        <Ionicons name="flash" size={24} color="#FF6B6B" />
                        <View style={styles.urgentText}>
                            <Text style={styles.urgentTitle}>Đặt lịch khẩn cấp</Text>
                            <Text style={styles.urgentSubtitle}>
                                Thợ sẽ đến trong {technician.eta} phút
                            </Text>
                        </View>
                    </View>

                    {/* Technician Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông Tin Thợ</Text>
                        <View style={styles.techCard}>
                            <View style={styles.techHeader}>
                                <View style={styles.avatarContainer}>
                                    <Text style={styles.avatar}>{technician.avatar}</Text>
                                    {technician.verified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark" size={12} color="#fff" />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.techInfo}>
                                    <Text style={styles.techName}>{technician.name}</Text>
                                    <Text style={styles.techSpecialty}>{technician.specialty}</Text>
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={14} color="#FFA000" />
                                        <Text style={styles.rating}>{technician.rating}</Text>
                                        <Text style={styles.reviews}>({technician.reviews})</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.distanceInfo}>
                                <Ionicons name="location" size={16} color="#2196F3" />
                                <Text style={styles.distanceText}>
                                    Cách bạn {technician.distance} km
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Service Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dịch Vụ</Text>
                        <View style={styles.infoCard}>
                            <Ionicons name="construct" size={20} color="#2196F3" />
                            <Text style={styles.infoText}>{service}</Text>
                        </View>
                    </View>

                    {/* Address */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Địa Chỉ</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="location-outline" size={20} color="#666" />
                            <TextInput
                                style={styles.input}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Nhập địa chỉ"
                                multiline
                            />
                        </View>
                        <TouchableOpacity style={styles.useCurrentLocation}>
                            <Ionicons name="navigate" size={16} color="#2196F3" />
                            <Text style={styles.useCurrentLocationText}>
                                Sử dụng vị trí hiện tại
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Note */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ghi Chú (Không bắt buộc)</Text>
                        <View style={styles.noteContainer}>
                            <TextInput
                                style={styles.noteInput}
                                value={note}
                                onChangeText={setNote}
                                placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu đặc biệt..."
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Payment Method */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Phương Thức Thanh Toán</Text>

                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === 'cash' && styles.paymentOptionActive,
                            ]}
                            onPress={() => setPaymentMethod('cash')}
                        >
                            <Ionicons
                                name="cash-outline"
                                size={24}
                                color={paymentMethod === 'cash' ? '#2196F3' : '#666'}
                            />
                            <View style={styles.paymentInfo}>
                                <Text
                                    style={[
                                        styles.paymentText,
                                        paymentMethod === 'cash' && styles.paymentTextActive,
                                    ]}
                                >
                                    Chuyển khoản
                                </Text>
                                <Text style={styles.paymentSubtext}>
                                    Thanh toán khi hoàn thành
                                </Text>
                            </View>
                            {paymentMethod === 'cash' && (
                                <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === 'card' && styles.paymentOptionActive,
                            ]}
                            onPress={() => setPaymentMethod('card')}
                        >
                            <Ionicons
                                name="card-outline"
                                size={24}
                                color={paymentMethod === 'card' ? '#2196F3' : '#666'}
                            />
                            <View style={styles.paymentInfo}>
                                <Text
                                    style={[
                                        styles.paymentText,
                                        paymentMethod === 'card' && styles.paymentTextActive,
                                    ]}
                                >
                                    Thẻ tín dụng/ghi nợ
                                </Text>
                                <Text style={styles.paymentSubtext}>Visa, Mastercard</Text>
                            </View>
                            {paymentMethod === 'card' && (
                                <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === 'wallet' && styles.paymentOptionActive,
                            ]}
                            onPress={() => setPaymentMethod('wallet')}
                        >
                            <Ionicons
                                name="wallet-outline"
                                size={24}
                                color={paymentMethod === 'wallet' ? '#2196F3' : '#666'}
                            />
                            <View style={styles.paymentInfo}>
                                <Text
                                    style={[
                                        styles.paymentText,
                                        paymentMethod === 'wallet' && styles.paymentTextActive,
                                    ]}
                                >
                                    Ví điện tử
                                </Text>
                                <Text style={styles.paymentSubtext}>MoMo, ZaloPay, VNPay</Text>
                            </View>
                            {paymentMethod === 'wallet' && (
                                <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Price Summary */}
                    <View style={styles.priceSection}>
                        <Text style={styles.sectionTitle}>Chi Phí Dự Kiến</Text>
                        <View style={styles.priceCard}>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Giá khởi điểm:</Text>
                                <Text style={styles.priceValue}>
                                    {technician.price ? technician.price.toLocaleString('vi-VN') : '0'} ₫
                                </Text>
                            </View>
                            <View style={styles.priceNote}>
                                <Ionicons name="information-circle" size={16} color="#FF9800" />
                                <Text style={styles.priceNoteText}>
                                    Giá cuối cùng tùy thuộc vào mức độ hư hỏng và linh kiện
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmBooking}
                >
                    <Ionicons name="flash" size={24} color="#fff" />
                    <Text style={styles.confirmButtonText}>Gọi Thợ Ngay</Text>
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f7fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
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
    urgentBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 12,
    },
    urgentText: {
        flex: 1,
    },
    urgentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C62828',
        marginBottom: 4,
    },
    urgentSubtitle: {
        fontSize: 13,
        color: '#D32F2F',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    techCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    techHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        fontSize: 48,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    techInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    techName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    techSpecialty: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    reviews: {
        fontSize: 12,
        color: '#999',
    },
    distanceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    distanceText: {
        fontSize: 13,
        color: '#666',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    infoText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    useCurrentLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    useCurrentLocationText: {
        fontSize: 13,
        color: '#2196F3',
        fontWeight: '500',
    },
    noteContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    noteInput: {
        fontSize: 15,
        color: '#333',
        minHeight: 80,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    paymentOptionActive: {
        borderColor: '#2196F3',
        backgroundColor: '#E3F2FD',
    },
    paymentInfo: {
        flex: 1,
    },
    paymentText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
        marginBottom: 2,
    },
    paymentTextActive: {
        color: '#2196F3',
        fontWeight: '600',
    },
    paymentSubtext: {
        fontSize: 12,
        color: '#999',
    },
    priceSection: {
        marginTop: 8,
    },
    priceCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 15,
        color: '#666',
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    priceNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#FFF9E6',
        padding: 12,
        borderRadius: 8,
    },
    priceNoteText: {
        flex: 1,
        fontSize: 12,
        color: '#E65100',
        lineHeight: 16,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    confirmButton: {
        flexDirection: 'row',
        backgroundColor: '#FF6B6B',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default InstantBookingScreen;
