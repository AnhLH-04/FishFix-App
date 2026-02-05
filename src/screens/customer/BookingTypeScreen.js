import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BookingTypeScreen = ({ route, navigation }) => {
    const { service, serviceDetail, categoryId } = route.params || {};

    const handleInstantBooking = () => {
        // Đặt lịch ngay - điều hướng đến CreateJobScreen
        navigation.navigate('CreateJob', {
            categoryId: categoryId,
            categoryName: serviceDetail?.categoryName || service,
            serviceName: serviceDetail?.name,
            serviceDescription: serviceDetail?.description,
            estimatedPrice: serviceDetail?.priceRange,
        });
    };

    const handleScheduledBooking = () => {
        // Đặt lịch hẹn - điều hướng thẳng đến BookingScreen (không cần chọn thợ trước)
        navigation.navigate('Booking', { 
            service, 
            serviceDetail,
            categoryId,
            category: serviceDetail?.categoryName || service,
            problem: serviceDetail?.description,
            isScheduledBooking: true, // Flag để biết là đặt lịch hẹn
        });
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
                <Text style={styles.headerTitle}>Chọn Loại Đặt Lịch</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Service Info */}
                    {serviceDetail && (
                        <View style={styles.serviceInfoCard}>
                            <View style={styles.serviceHeader}>
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                <Text style={styles.serviceLabel}>Dịch vụ đã chọn</Text>
                            </View>
                            <Text style={styles.serviceName}>{serviceDetail.name}</Text>
                            <Text style={styles.serviceDescription}>{serviceDetail.description}</Text>
                            <View style={styles.serviceDetails}>
                                <View style={styles.detailItem}>
                                    <Ionicons name="cash-outline" size={16} color="#2196F3" />
                                    <Text style={styles.detailText}>{serviceDetail.priceRange} ₫</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="time-outline" size={16} color="#666" />
                                    <Text style={styles.detailText}>{serviceDetail.duration}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Instant Booking Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={handleInstantBooking}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FF6B6B', '#FF8E53']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradient}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="flash" size={40} color="#fff" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Đặt Lịch Ngay</Text>
                                <Text style={styles.cardSubtitle}>Thợ đến trong 30-60 phút</Text>
                                <View style={styles.featureList}>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                        <Text style={styles.featureText}>Thợ gần bạn đang rảnh</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                        <Text style={styles.featureText}>Xử lý khẩn cấp ngay</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                        <Text style={styles.featureText}>Không cần chờ đợi</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.recommendBadge}>
                                <Text style={styles.recommendText}>PHỔ BIẾN</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Scheduled Booking Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={handleScheduledBooking}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradient}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="calendar" size={40} color="#fff" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Đặt Lịch Hẹn</Text>
                                <Text style={styles.cardSubtitle}>Chọn thời gian phù hợp</Text>
                                <View style={styles.featureList}>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                        <Text style={styles.featureText}>Chọn thợ yêu thích</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                        <Text style={styles.featureText}>Lên lịch trước 1-7 ngày</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                        <Text style={styles.featureText}>Linh hoạt thời gian</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={24} color="#2196F3" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>Lưu ý</Text>
                            <Text style={styles.infoText}>
                                Đặt lịch ngay phụ thuộc vào sự sẵn có của thợ trong khu vực.
                                Nếu không có thợ rảnh, bạn có thể chọn đặt lịch hẹn.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
        paddingBottom: 20,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    serviceInfoCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    serviceLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    serviceDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    serviceDetails: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    card: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    cardGradient: {
        padding: 24,
        position: 'relative',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    cardContent: {
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 16,
    },
    featureList: {
        gap: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 13,
        color: '#fff',
        flex: 1,
    },
    recommendBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    recommendText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginTop: 8,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});

export default BookingTypeScreen;
