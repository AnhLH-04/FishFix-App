import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { createJob } from '../../services/jobService';

const BookingScreen = ({ navigation, route }) => {
    const { technician, category, problem, serviceDetail, categoryId } = route.params || {};
    const authContext = useAuth();
    const user = authContext?.user;
    
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState('card');
    const [loading, setLoading] = useState(false);
    
    // Đặt lịch hẹn có thể không có thợ (workerId = null)
    const hasWorker = technician && technician.id;

    // Tạo 7 ngày từ ngày hiện tại
    const generateNext7Days = () => {
        const days = [];
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            days.push({
                id: i + 1,
                day: dayNames[date.getDay()],
                date: date.getDate(),
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                available: true,
                fullDate: date, // Lưu full date object để dùng sau
            });
        }
        
        return days;
    };

    const dates = generateNext7Days();

    // Chỉ chọn giờ bắt đầu (không biết sửa bao lâu)
    // Validate: nếu là hôm nay và giờ đã qua thì disable
    const getAvailableTimeSlots = () => {
        const baseSlots = [
            { id: 1, time: '08:00' },
            { id: 2, time: '09:00' },
            { id: 3, time: '10:00' },
            { id: 4, time: '11:00' },
            { id: 5, time: '13:00' },
            { id: 6, time: '14:00' },
            { id: 7, time: '15:00' },
            { id: 8, time: '16:00' },
            { id: 9, time: '17:00' },
        ];

        // Nếu chưa chọn ngày, tất cả đều available
        if (!selectedDate) {
            return baseSlots.map(slot => ({ ...slot, available: true }));
        }

        const now = new Date();
        const isToday = selectedDate.date === now.getDate() && 
                       selectedDate.month === (now.getMonth() + 1) && 
                       selectedDate.year === now.getFullYear();

        // Nếu không phải hôm nay, tất cả đều available
        if (!isToday) {
            return baseSlots.map(slot => ({ ...slot, available: true }));
        }

        // Nếu là hôm nay, check giờ hiện tại
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        return baseSlots.map(slot => {
            const [slotHour] = slot.time.split(':').map(Number);
            // Disable nếu giờ đã qua
            const isPast = slotHour < currentHour || (slotHour === currentHour && currentMinute > 0);
            return {
                ...slot,
                available: !isPast
            };
        });
    };

    const timeSlots = getAvailableTimeSlots();

    const paymentMethods = [
        { id: 'cash', name: 'Tiền mặt', icon: 'cash' },
        { id: 'card', name: 'Thẻ ngân hàng', icon: 'card' },
        { id: 'momo', name: 'Ví MoMo', icon: 'wallet' },
        { id: 'zalopay', name: 'ZaloPay', icon: 'logo-bitcoin' },
    ];

    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Thông báo', 'Vui lòng chọn ngày và giờ hẹn');
            return;
        }

        if (!user || !user.id) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để tiếp tục');
            return;
        }

        const confirmMessage = hasWorker 
            ? `Bạn muốn đặt lịch với ${technician.name}?\n\nNgày: ${selectedDate.date}/${selectedDate.month}/${selectedDate.year}\nGiờ bắt đầu: ${selectedTime.time}`
            : `Xác nhận đặt lịch hẹn?\n\nDịch vụ: ${serviceDetail?.name || category}\nNgày: ${selectedDate.date}/${selectedDate.month}/${selectedDate.year}\nGiờ bắt đầu: ${selectedTime.time}\n\nHệ thống sẽ tự động tìm thợ phù hợp cho bạn.`;

        Alert.alert(
            'Xác nhận đặt lịch',
            confirmMessage,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        try {
                            setLoading(true);

                            // Chỉ có giờ bắt đầu (format: "08:00")
                            const startTime = selectedTime.time;
                            
                            // Create booking date string (format: YYYY-MM-DD)
                            const preferredDate = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.date).padStart(2, '0')}`;

                            // Tạo job data
                            const jobData = {
                                customerId: user.id,
                                categoryId: categoryId || 1,
                                title: serviceDetail?.name || category || 'Dịch vụ sửa chữa',
                                description: problem || serviceDetail?.description || 'Đặt lịch hẹn',
                                photoUrls: [], // Không có ảnh khi đặt lịch hẹn
                                address: user.address || '123 Đường ABC, Quận 1',
                                ward: user.ward || 'Phường 1',
                                district: user.district || 'Quận 1',
                                city: user.city || 'TP. Hồ Chí Minh',
                                latitude: 10.7769,
                                longitude: 106.7009,
                                urgency: 'medium',
                                estimatedBudget: 160000,
                                preferredDate: preferredDate,
                                preferredTimeStart: startTime + ':00',
                                preferredTimeEnd: '18:00:00', // Giờ kết thúc mặc định (có thể để null nếu API cho phép)
                            };

                            console.log('Creating job:', jobData);

                            // Call API
                            const response = await createJob(jobData);
                            const jobId = response.jobId;
                            
                            Alert.alert(
                                'Thành công',
                                'Đặt lịch hẹn thành công!',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate('BookingConfirmation', {
                                                jobId,
                                                technician,
                                                date: selectedDate,
                                                time: selectedTime,
                                                payment: selectedPayment,
                                                category,
                                                problem,
                                                serviceDetail,
                                            });
                                        },
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error('Booking error:', error);
                            Alert.alert('Lỗi', 'Không thể tạo đặt lịch. Vui lòng thử lại');
                        } finally {
                            setLoading(false);
                        }
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
                {/* Technician or Service Info */}
                <View style={styles.technicianCard}>
                    {hasWorker ? (
                        // Có thợ - hiển thị thông tin thợ
                        <>
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
                        </>
                    ) : (
                        // Không có thợ - hiển thị thông tin dịch vụ
                        <View style={styles.serviceOnlyHeader}>
                            <View style={styles.serviceIconContainer}>
                                <Ionicons name="construct" size={32} color="#2196F3" />
                            </View>
                            <View style={styles.technicianInfo}>
                                <Text style={styles.technicianName}>
                                    {serviceDetail?.name || category || 'Dịch vụ sửa chữa'}
                                </Text>
                                <Text style={styles.technicianSpecialty}>
                                    Hệ thống sẽ tự động tìm thợ phù hợp
                                </Text>
                                <View style={styles.autoAssignBadge}>
                                    <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                                    <Text style={styles.autoAssignText}>Tự động chọn thợ</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    
                    {category && (
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceLabel}>Dịch vụ:</Text>
                            <Text style={styles.serviceValue}>{category}</Text>
                        </View>
                    )}
                    {(problem || serviceDetail?.description) && (
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceLabel}>Mô tả:</Text>
                            <Text style={styles.serviceValue}>{problem || serviceDetail?.description}</Text>
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
                        <Text style={styles.summaryValue}>
                            {hasWorker ? technician.price : (serviceDetail?.priceRange || '150,000đ')}
                        </Text>
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
                <TouchableOpacity 
                    style={[styles.confirmButton, loading && styles.confirmButtonDisabled]} 
                    onPress={handleConfirmBooking}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.confirmButtonText}>Xác Nhận Đặt Lịch</Text>
                            <Ionicons name="checkmark" size={20} color="#fff" />
                        </>
                    )}
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
    serviceOnlyHeader: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
    },
    serviceIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    autoAssignBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    autoAssignText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
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
    confirmButtonDisabled: {
        backgroundColor: '#B0BEC5',
        elevation: 0,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default BookingScreen;
