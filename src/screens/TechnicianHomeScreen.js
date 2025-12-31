import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../utils/colors';
import { useAuth } from '../context/AuthContext';

export default function TechnicianHomeScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [activeJobs, setActiveJobs] = useState(2);
    const [completedToday, setCompletedToday] = useState(5);
    const [todayEarnings, setTodayEarnings] = useState(850000);

    const stats = [
        {
            icon: 'hammer',
            label: 'Đang làm',
            value: activeJobs,
            color: '#FF6B35',
            bgColor: '#FF6B3520',
        },
        {
            icon: 'checkmark-done',
            label: 'Hoàn thành',
            value: completedToday,
            color: '#4CAF50',
            bgColor: '#4CAF5020',
        },
        {
            icon: 'wallet',
            label: 'Thu nhập hôm nay',
            value: todayEarnings.toLocaleString('vi-VN') + 'đ',
            color: '#2196F3',
            bgColor: '#2196F320',
        },
    ];

    const quickActions = [
        { icon: 'search', label: 'Tìm việc', screen: 'AvailableJobs', color: '#FF6B35' },
        { icon: 'calendar', label: 'Lịch làm việc', screen: 'Schedule', color: '#2196F3' },
        { icon: 'location', label: 'Việc gần đây', screen: 'NearbyJobs', color: '#4CAF50' },
        { icon: 'card', label: 'Thu nhập', screen: 'Earnings', color: '#9C27B0' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào,</Text>
                    <Text style={styles.userName}>{user?.name || 'Thợ sửa chữa'}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color="#333" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>3</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('TechnicianProfile')}
                    >
                        <Ionicons name="person-circle-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Stats */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View
                            key={index}
                            style={[styles.statCard, { backgroundColor: stat.bgColor }]}
                        >
                            <Ionicons name={stat.icon} size={28} color={stat.color} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
                    <View style={styles.actionsGrid}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionCard}
                                onPress={() => {
                                    if (action.screen) {
                                        // navigation.navigate(action.screen);
                                    }
                                }}
                            >
                                <View
                                    style={[
                                        styles.actionIcon,
                                        { backgroundColor: action.color + '20' },
                                    ]}
                                >
                                    <Ionicons name={action.icon} size={24} color={action.color} />
                                </View>
                                <Text style={styles.actionLabel}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Active Jobs */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Công việc đang làm</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.jobCard}>
                        <View style={styles.jobHeader}>
                            <View style={[styles.jobStatus, { backgroundColor: '#FF6B3520' }]}>
                                <Text style={[styles.jobStatusText, { color: '#FF6B35' }]}>
                                    Đang làm
                                </Text>
                            </View>
                            <Text style={styles.jobTime}>14:30 - Hôm nay</Text>
                        </View>
                        <Text style={styles.jobTitle}>Sửa máy lạnh</Text>
                        <View style={styles.jobInfo}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.jobInfoText}>123 Nguyễn Văn Linh, Q.7</Text>
                        </View>
                        <View style={styles.jobInfo}>
                            <Ionicons name="person-outline" size={16} color="#666" />
                            <Text style={styles.jobInfoText}>Nguyễn Văn A</Text>
                        </View>
                        <View style={styles.jobFooter}>
                            <View style={styles.jobPrice}>
                                <Text style={styles.jobPriceText}>500.000đ</Text>
                            </View>
                            <TouchableOpacity style={styles.jobButton}>
                                <Text style={styles.jobButtonText}>Xem chi tiết</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.jobCard}>
                        <View style={styles.jobHeader}>
                            <View style={[styles.jobStatus, { backgroundColor: '#2196F320' }]}>
                                <Text style={[styles.jobStatusText, { color: '#2196F3' }]}>
                                    Sắp tới
                                </Text>
                            </View>
                            <Text style={styles.jobTime}>16:00 - Hôm nay</Text>
                        </View>
                        <Text style={styles.jobTitle}>Bảo trì tủ lạnh</Text>
                        <View style={styles.jobInfo}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.jobInfoText}>456 Lê Văn Việt, Q.9</Text>
                        </View>
                        <View style={styles.jobInfo}>
                            <Ionicons name="person-outline" size={16} color="#666" />
                            <Text style={styles.jobInfoText}>Trần Thị B</Text>
                        </View>
                        <View style={styles.jobFooter}>
                            <View style={styles.jobPrice}>
                                <Text style={styles.jobPriceText}>350.000đ</Text>
                            </View>
                            <TouchableOpacity style={styles.jobButton}>
                                <Text style={styles.jobButtonText}>Xem chi tiết</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    greeting: {
        fontSize: 14,
        color: '#999',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 10,
    },
    statCard: {
        flex: 1,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAll: {
        fontSize: 14,
        color: '#FF6B35',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    actionCard: {
        width: '47%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionLabel: {
        fontSize: 13,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    jobCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    jobStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    jobStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    jobTime: {
        fontSize: 12,
        color: '#999',
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    jobInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    jobInfoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    jobPrice: {
        backgroundColor: '#4CAF5020',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    jobPriceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    jobButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    jobButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },
});
