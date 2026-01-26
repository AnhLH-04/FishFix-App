import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const serviceCategories = [
        {
            id: 1,
            name: 'Máy Giặt',
            icon: 'water',
            gradient: ['#4A90E2', '#2196F3'],
            iconBg: '#E3F2FD',
        },
        {
            id: 2,
            name: 'Điện Nước',
            icon: 'flash',
            gradient: ['#FF9800', '#F57C00'],
            iconBg: '#FFF3E0',
        },
        {
            id: 3,
            name: 'Điều Hòa',
            icon: 'snow',
            gradient: ['#00BCD4', '#0097A7'],
            iconBg: '#E0F7FA',
        },
        {
            id: 4,
            name: 'Tủ Lạnh',
            icon: 'cube',
            gradient: ['#9C27B0', '#7B1FA2'],
            iconBg: '#F3E5F5',
        },
        {
            id: 5,
            name: 'Bếp Gas',
            icon: 'flame',
            gradient: ['#F44336', '#D32F2F'],
            iconBg: '#FFEBEE',
        },
        {
            id: 6,
            name: 'Đồ Gia Dụng',
            icon: 'home',
            gradient: ['#4CAF50', '#388E3C'],
            iconBg: '#E8F5E9',
        },
    ];

    const quickActions = [
        {
            id: 1,
            title: 'Gói Bảo Trì',
            icon: 'shield-checkmark',
            color: '#2196F3',
            description: 'Tiết kiệm lâu dài',
            screen: 'Maintenance',
        },
        {
            id: 2,
            title: 'Đặt Lịch Ngay',
            icon: 'calendar',
            color: '#4CAF50',
            description: 'Nhanh chóng',
            screen: 'TechnicianList',
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header with Gradient */}
            <View style={styles.headerGradient}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Xin chào! 👋</Text>
                        <Text style={styles.subtitle}>Cần sửa chữa gì hôm nay?</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Ionicons name="notifications-outline" size={26} color="#fff" />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm dịch vụ..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity style={styles.filterBtn}>
                        <Ionicons name="options-outline" size={20} color="#2196F3" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                {/* Service Categories - Grid */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Dịch Vụ Sửa Chữa</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.categoriesGrid}>
                        {serviceCategories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.categoryCard}
                                onPress={() =>
                                    navigation.navigate('ServiceDetail', { service: category.name })
                                }
                            >
                                <View style={[styles.categoryIconContainer, { backgroundColor: category.iconBg }]}>
                                    <Ionicons
                                        name={category.icon}
                                        size={32}
                                        color={category.gradient[0]}
                                    />
                                </View>
                                <Text style={styles.categoryName}>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* AI Diagnosis Card */}
                <View style={styles.section}>
                    <TouchableOpacity 
                        style={styles.aiCard}
                        onPress={() => navigation.navigate('AIDiagnosis')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#4A90E2', '#50C9C3']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.aiGradient}
                        >
                            <View style={styles.aiIconContainer}>
                                <Ionicons name="sparkles" size={32} color="#FFD700" />
                                <View style={styles.aiBadge}>
                                    <Text style={styles.aiBadgeText}>MỚI</Text>
                                </View>
                            </View>
                            <Text style={styles.aiTitle}>AI Chẩn đoán thông minh</Text>
                            <Text style={styles.aiDescription}>
                                Chụp ảnh sự cố - AI sẽ tự động phân tích và gợi ý thợ phù hợp
                            </Text>
                            <View style={styles.aiButton}>
                                <Text style={styles.aiButtonText}>Thử ngay</Text>
                                <Ionicons name="arrow-forward" size={18} color="#2196F3" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dành Cho Bạn</Text>
                    <View style={styles.quickActionsContainer}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={[styles.quickActionCard]}
                                onPress={() => navigation.navigate(action.screen)}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                                    <Ionicons name={action.icon} size={28} color={action.color} />
                                </View>
                                <View style={styles.quickActionInfo}>
                                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                                    <Text style={styles.quickActionDesc}>{action.description}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#ccc" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Promotional Banner */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.promoBanner}>
                        <View style={styles.promoContent}>
                            <View style={styles.promoIcon}>
                                <Ionicons name="gift" size={32} color="#FF6B6B" />
                            </View>
                            <View style={styles.promoText}>
                                <Text style={styles.promoTitle}>Ưu Đãi Đặc Biệt 🎉</Text>
                                <Text style={styles.promoDesc}>Giảm 20% cho khách hàng mới</Text>
                            </View>
                        </View>
                        <Ionicons name="arrow-forward" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Statistics */}
                <View style={styles.section}>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Ionicons name="people" size={32} color="#2196F3" />
                            <Text style={styles.statNumber}>1,500+</Text>
                            <Text style={styles.statLabel}>Thợ Chuyên Nghiệp</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                            <Text style={styles.statNumber}>10,000+</Text>
                            <Text style={styles.statLabel}>Dịch Vụ Hoàn Thành</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="star" size={32} color="#FFC107" />
                            <Text style={styles.statNumber}>4.8★</Text>
                            <Text style={styles.statLabel}>Đánh Giá Trung Bình</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    headerGradient: {
        backgroundColor: '#2196F3',
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#E3F2FD',
        marginTop: 4,
    },
    notificationBtn: {
        position: 'relative',
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF6B6B',
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        paddingHorizontal: 15,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: '#333',
    },
    filterBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    seeAll: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '600',
    },
    quickActionsContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    quickActionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    quickActionInfo: {
        flex: 1,
    },
    quickActionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    quickActionDesc: {
        fontSize: 13,
        color: '#666',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        gap: 12,
    },
    categoryCard: {
        width: (width - 56) / 3,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    categoryIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    promoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF9E6',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
    },
    promoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    promoIcon: {
        marginRight: 16,
    },
    promoText: {
        flex: 1,
    },
    promoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    promoDesc: {
        fontSize: 13,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
    aiCard: {
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    aiGradient: {
        padding: 24,
        borderRadius: 20,
    },
    aiIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    aiBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    aiBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    aiTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    aiDescription: {
        fontSize: 14,
        color: '#E3F2FD',
        lineHeight: 20,
        marginBottom: 20,
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
    },
    aiButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2196F3',
    },
});

export default HomeScreen;
