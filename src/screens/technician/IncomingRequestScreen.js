import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    Modal,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';

const { width, height } = Dimensions.get('window');

export default function IncomingRequestScreen({ navigation, route }) {
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to accept
    const [pulseAnim] = useState(new Animated.Value(1));
    const [progressAnim] = useState(new Animated.Value(100));

    // Mock data - trong thực tế sẽ nhận từ API/Socket
    const request = route?.params?.request || {
        id: 1,
        customer: 'Nguyễn Văn A',
        service: 'Sửa máy lạnh',
        address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
        distance: '2.5 km',
        estimatedTime: '10 phút',
        price: 500000,
        description: 'Máy lạnh không lạnh, có tiếng kêu lạ',
        urgent: true,
        phone: '0123456789',
        rating: 4.8,
    };

    useEffect(() => {
        // Pulse animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        // Countdown timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleReject(); // Auto reject when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Progress bar animation
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: 30000,
            useNativeDriver: false,
        }).start();

        return () => {
            clearInterval(timer);
            pulse.stop();
        };
    }, []);

    const handleAccept = () => {
        // Gửi accept request đến server
        console.log('Accepted request:', request.id);
        navigation.replace('ActiveJob', { job: request });
    };

    const handleReject = () => {
        // Gửi reject request đến server
        console.log('Rejected request:', request.id);
        navigation.goBack();
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <Modal visible={true} animationType="slide" transparent={false}>
            <SafeAreaView style={styles.container}>
                {/* Timer Progress */}
                <View style={styles.timerContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                { width: progressWidth },
                            ]}
                        />
                    </View>
                    <Text style={styles.timerText}>
                        {timeLeft}s còn lại để phản hồi
                    </Text>
                </View>

                {/* Request Header */}
                <View style={styles.header}>
                    {request.urgent && (
                        <View style={styles.urgentBadge}>
                            <Ionicons name="alert-circle" size={20} color="white" />
                            <Text style={styles.urgentText}>YÊU CẦU GẤP</Text>
                        </View>
                    )}
                    <Text style={styles.headerTitle}>Yêu cầu mới</Text>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <Ionicons name="notifications" size={48} color="#FF6B35" />
                    </Animated.View>
                </View>

                {/* Customer Info */}
                <View style={styles.customerSection}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle" size={60} color="#FF6B35" />
                    </View>
                    <Text style={styles.customerName}>{request.customer}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFB800" />
                        <Text style={styles.rating}>{request.rating}</Text>
                    </View>
                </View>

                {/* Service Details */}
                <View style={styles.detailsSection}>
                    <View style={styles.serviceCard}>
                        <View style={styles.serviceHeader}>
                            <Ionicons name="construct" size={28} color="#FF6B35" />
                            <Text style={styles.serviceName}>{request.service}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="location" size={20} color="#666" />
                            <Text style={styles.detailText}>{request.address}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Ionicons name="navigate" size={18} color="#2196F3" />
                                <Text style={styles.infoLabel}>Khoảng cách</Text>
                                <Text style={styles.infoValue}>{request.distance}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoItem}>
                                <Ionicons name="time" size={18} color="#FF9800" />
                                <Text style={styles.infoLabel}>Thời gian đến</Text>
                                <Text style={styles.infoValue}>{request.estimatedTime}</Text>
                            </View>
                        </View>

                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionLabel}>Mô tả vấn đề:</Text>
                            <Text style={styles.description}>{request.description}</Text>
                        </View>

                        <View style={styles.priceSection}>
                            <Text style={styles.priceLabel}>Thu nhập ước tính</Text>
                            <Text style={styles.price}>
                                {request.price.toLocaleString('vi-VN')} ₫
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={handleReject}
                    >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                        <Text style={styles.rejectText}>Từ chối</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={handleAccept}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                        <Text style={styles.acceptText}>Chấp nhận</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Contact */}
                <TouchableOpacity style={styles.contactButton}>
                    <Ionicons name="call" size={20} color="#2196F3" />
                    <Text style={styles.contactText}>Gọi ngay cho khách hàng</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    timerContainer: {
        backgroundColor: 'white',
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF6B35',
    },
    timerText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: 'white',
        marginBottom: 15,
    },
    urgentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF3B30',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 15,
        gap: 5,
    },
    urgentText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    customerSection: {
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 15,
    },
    avatarContainer: {
        marginBottom: 10,
    },
    customerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    rating: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    detailsSection: {
        flex: 1,
        padding: 15,
    },
    serviceCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
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
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
        gap: 5,
    },
    divider: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 10,
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 3,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    descriptionBox: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    descriptionLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 5,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#4CAF5015',
        padding: 15,
        borderRadius: 12,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    actionsContainer: {
        flexDirection: 'row',
        padding: 15,
        gap: 12,
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 2,
        borderColor: '#FF3B30',
    },
    rejectText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: 'bold',
    },
    acceptButton: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    acceptText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15,
        marginBottom: 15,
        paddingVertical: 14,
        backgroundColor: 'white',
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#2196F3',
    },
    contactText: {
        color: '#2196F3',
        fontSize: 15,
        fontWeight: '600',
    },
});
