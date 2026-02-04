import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingScreen = ({ navigation, route }) => {
    const { technician, category, problem } = route.params;
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState('cash');

    const dates = [
        { id: 1, day: 'T2', date: 16, month: 10, available: true },
        { id: 2, day: 'T3', date: 17, month: 10, available: true },
        { id: 3, day: 'T4', date: 18, month: 10, available: true },
        { id: 4, day: 'T5', date: 19, month: 10, available: false },
        { id: 5, day: 'T6', date: 20, month: 10, available: true },
        { id: 6, day: 'T7', date: 21, month: 10, available: true },
    ];

    const timeSlots = [
        { id: 1, time: '08:00 - 10:00', available: true },
        { id: 2, time: '10:00 - 12:00', available: true },
        { id: 3, time: '12:00 - 14:00', available: false },
        { id: 4, time: '14:00 - 16:00', available: true },
        { id: 5, time: '16:00 - 18:00', available: true },
        { id: 6, time: '18:00 - 20:00', available: true },
    ];

    const paymentMethods = [
        // { id: 'cash', name: 'Tiền mặt', icon: 'cash' },
        { id: 'card', name: 'Thẻ ngân hàng', icon: 'card' },
        { id: 'momo', name: 'Ví MoMo', icon: 'wallet' },
        { id: 'zalopay', name: 'ZaloPay', icon: 'logo-bitcoin' },
    ];

    const handleConfirmBooking = () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Thông báo', 'Vui lòng chọn ngày và giờ hẹn');
            return;
        }

        Alert.alert(
            'Xác nhận đặt lịch',
            `Bạn muốn đặt lịch với ${technician.name}?\n\nNgày: ${selectedDate.date}/${selectedDate.month}\nGiờ: ${selectedTime.time}`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: () => {
                        navigation.navigate('BookingConfirmation', {
                            technician,
                            date: selectedDate,
                            time: selectedTime,
                            payment: selectedPayment,
                            category,
                            problem,
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
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đặt Lịch Hẹn</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Technician Info */}
                <View style={styles.technicianCard}>
                    <View style={styles.technicianHeader}>
                        <Text style={styles.avatar}>{technician.avatar}</Text>
                        <View style={styles.technicianInfo}>
                            <Text style={styles.technicianName}>{technician.name}</Text>
                            <Text style={styles.technicianSpecialty}>{technician.specialty}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={styles.ratingText}>{technician.rating}</Text>
                                <Text style={styles.reviewsText}>({technician.reviews} đánh giá)</Text>
                            </View>
                        </View>
                    </View>
                    {category && (
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceLabel}>Dịch vụ:</Text>
                            <Text style={styles.serviceValue}>{category}</Text>
                        </View>
                    )}
                    {problem && (
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceLabel}>Vấn đề:</Text>
                            <Text style={styles.serviceValue}>{problem}</Text>
                        </View>
                    )}
                </View>

                {/* Date Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Chọn Ngày</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.dateScrollView}
                    >
                        {dates.map((date) => (
                            <TouchableOpacity
                                key={date.id}
                                style={[
                                    styles.dateCard,
                                    selectedDate?.id === date.id && styles.dateCardSelected,
                                    !date.available && styles.dateCardDisabled,
                                ]}
                                onPress={() => date.available && setSelectedDate(date)}
                                disabled={!date.available}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        selectedDate?.id === date.id && styles.dateTextSelected,
                                    ]}
                                >
                                    {date.day}
                                </Text>
                                <Text
                                    style={[
                                        styles.dateNumber,
                                        selectedDate?.id === date.id && styles.dateTextSelected,
                                    ]}
                                >
                                    {date.date}
                                </Text>
                                <Text
                                    style={[
                                        styles.monthText,
                                        selectedDate?.id === date.id && styles.dateTextSelected,
                                    ]}
                                >
                                    T{date.month}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Time Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⏰ Chọn Giờ</Text>
                    <View style={styles.timeGrid}>
                        {timeSlots.map((slot) => (
                            <TouchableOpacity
                                key={slot.id}
                                style={[
                                    styles.timeSlot,
                                    selectedTime?.id === slot.id && styles.timeSlotSelected,
                                    !slot.available && styles.timeSlotDisabled,
                                ]}
                                onPress={() => slot.available && setSelectedTime(slot)}
                                disabled={!slot.available}
                            >
                                <Text
                                    style={[
                                        styles.timeText,
                                        selectedTime?.id === slot.id && styles.timeTextSelected,
                                        !slot.available && styles.timeTextDisabled,
                                    ]}
                                >
                                    {slot.time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💳 Phương Thức Thanh Toán</Text>
                    <View style={styles.paymentContainer}>
                        {paymentMethods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.paymentCard,
                                    selectedPayment === method.id && styles.paymentCardSelected,
                                ]}
                                onPress={() => setSelectedPayment(method.id)}
                            >
                                <Ionicons
                                    name={method.icon}
                                    size={24}
                                    color={selectedPayment === method.id ? '#2196F3' : '#666'}
                                />
                                <Text
                                    style={[
                                        styles.paymentText,
                                        selectedPayment === method.id && styles.paymentTextSelected,
                                    ]}
                                >
                                    {method.name}
                                </Text>
                                {selectedPayment === method.id && (
                                    <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Price Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Tóm Tắt Đơn Hàng</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí dịch vụ:</Text>
                        <Text style={styles.summaryValue}>{technician.price}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí di chuyển:</Text>
                        <Text style={styles.summaryValue}>30,000đ</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Giảm giá:</Text>
                        <Text style={[styles.summaryValue, styles.discount]}>-20,000đ</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Tổng cộng:</Text>
                        <Text style={styles.totalValue}>160,000đ</Text>
                    </View>
                </View>

                {/* Terms */}
                <View style={styles.termsCard}>
                    <Ionicons name="shield-checkmark" size={20} color="#2196F3" />
                    <Text style={styles.termsText}>
                        Bằng việc đặt lịch, bạn đồng ý với{' '}
                        <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> và{' '}
                        <Text style={styles.termsLink}>Chính sách bảo hành</Text>
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.bottomLabel}>Tổng thanh toán:</Text>
                    <Text style={styles.bottomPrice}>160,000đ</Text>
                </View>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
                    <Text style={styles.confirmButtonText}>Xác Nhận Đặt Lịch</Text>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    technicianCard: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 16,
        borderRadius: 16,
        elevation: 2,
    },
    technicianHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatar: {
        fontSize: 48,
        marginRight: 12,
    },
    technicianInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    technicianName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    technicianSpecialty: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    reviewsText: {
        fontSize: 12,
        color: '#999',
    },
    serviceInfo: {
        flexDirection: 'row',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: 8,
    },
    serviceLabel: {
        fontSize: 13,
        color: '#666',
        marginRight: 8,
    },
    serviceValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    dateScrollView: {
        paddingLeft: 20,
    },
    dateCard: {
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginRight: 12,
        minWidth: 70,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    dateCardSelected: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    dateCardDisabled: {
        opacity: 0.4,
    },
    dayText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    dateNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    monthText: {
        fontSize: 11,
        color: '#999',
    },
    dateTextSelected: {
        color: '#fff',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
    },
    timeSlot: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        width: '47%',
    },
    timeSlotSelected: {
        backgroundColor: '#E8F5E9',
        borderColor: '#2196F3',
    },
    timeSlotDisabled: {
        opacity: 0.4,
    },
    timeText: {
        fontSize: 13,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    timeTextSelected: {
        color: '#2196F3',
        fontWeight: 'bold',
    },
    timeTextDisabled: {
        color: '#999',
    },
    paymentContainer: {
        paddingHorizontal: 20,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    paymentCardSelected: {
        borderColor: '#2196F3',
        backgroundColor: '#E8F5E9',
    },
    paymentText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    paymentTextSelected: {
        color: '#2196F3',
        fontWeight: '600',
    },
    summaryCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666',
    },
    summaryValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    discount: {
        color: '#2196F3',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E88E5',
    },
    termsCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#E8F5E9',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        marginBottom: 100,
        gap: 12,
    },
    termsText: {
        flex: 1,
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    termsLink: {
        color: '#2196F3',
        fontWeight: '600',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 10,
    },
    bottomLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    bottomPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E88E5',
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        elevation: 3,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default BookingScreen;
