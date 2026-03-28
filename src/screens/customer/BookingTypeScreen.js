import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    StatusBar,
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
                    <Ionicons name="arrow-back" size={22} color="#2A3242" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chọn Loại Đặt Lịch</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View>
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

                    <Text style={styles.sectionTitle}>Chọn hình thức phù hợp</Text>

                    {/* Instant Booking Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={handleInstantBooking}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FFFFFF', '#F3F8FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardTopRow}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="flash" size={28} color="#2563EB" />
                                </View>
                                <View style={styles.recommendBadge}>
                                    <Text style={styles.recommendText}>PHỔ BIẾN</Text>
                                </View>
                            </View>

                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Tìm Thợ Ngay</Text>
                                <Text style={styles.cardSubtitle}>Thợ đến trong 30-60 phút</Text>
                                <View style={styles.featureList}>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                                        <Text style={styles.featureText}>Thợ gần bạn đang rảnh</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                                        <Text style={styles.featureText}>Xử lý khẩn cấp ngay</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                                        <Text style={styles.featureText}>Không cần chờ đợi</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardActionRow}>
                                <View style={styles.cardActionButton}>
                                    <Text style={styles.cardActionText}>Tiếp tục</Text>
                                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                                </View>
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
                            colors={['#FFFFFF', '#EEF4FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardTopRow}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="calendar" size={28} color="#4F46E5" />
                                </View>
                            </View>

                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Đặt Lịch Hẹn</Text>
                                <Text style={styles.cardSubtitle}>Chọn thời gian phù hợp</Text>
                                <View style={styles.featureList}>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#6366F1" />
                                        <Text style={styles.featureText}>Chọn thợ yêu thích</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#6366F1" />
                                        <Text style={styles.featureText}>Lên lịch trước 1-7 ngày</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#6366F1" />
                                        <Text style={styles.featureText}>Linh hoạt thời gian</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardActionRow}>
                                <View style={styles.cardActionButton}>
                                    <Text style={styles.cardActionText}>Tiếp tục</Text>
                                    <Ionicons name="arrow-forward" size={14} color="#fff" />
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
        backgroundColor: '#F6F8FC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 44,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EFF3FA',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F5FB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerPlaceholder: {
        width: 40,
    },
    headerTitle: {
        fontSize: 21,
        fontWeight: '700',
        color: '#1F2937',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 124,
    },
    serviceInfoCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EAF0F8',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    serviceLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    serviceName: {
        fontSize: 19,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 6,
    },
    serviceDescription: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 19,
        marginBottom: 10,
    },
    serviceDetails: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEF2F7',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    card: {
        marginBottom: 12,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E6EEF9',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    cardGradient: {
        paddingHorizontal: 18,
        paddingVertical: 16,
        position: 'relative',
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#EAF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 3,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 12,
    },
    featureList: {
        gap: 7,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    featureText: {
        fontSize: 13,
        color: '#334155',
        flex: 1,
    },
    cardActionRow: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    cardActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#2563EB',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    cardActionText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    recommendBadge: {
        backgroundColor: '#E0ECFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 11,
    },
    recommendText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#1D4ED8',
        letterSpacing: 0.8,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 14,
        gap: 12,
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#EAF0F8',
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 19,
    },
});

export default BookingTypeScreen;
