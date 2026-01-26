import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
    const menuItems = [
        {
            id: 1,
            title: 'Thông tin cá nhân',
            icon: 'person-outline',
            color: '#2196F3',
        },
        {
            id: 2,
            title: 'Lịch sử đặt lịch',
            icon: 'time-outline',
            color: '#FF9800',
        },
        {
            id: 3,
            title: 'Phương thức thanh toán',
            icon: 'card-outline',
            color: '#4CAF50',
        },
        {
            id: 4,
            title: 'Địa chỉ đã lưu',
            icon: 'location-outline',
            color: '#F44336',
        },
        {
            id: 5,
            title: 'Thông báo',
            icon: 'notifications-outline',
            color: '#9C27B0',
        },
        {
            id: 6,
            title: 'Ngôn ngữ',
            icon: 'language-outline',
            color: '#00BCD4',
        },
        {
            id: 7,
            title: 'Trợ giúp & Hỗ trợ',
            icon: 'help-circle-outline',
            color: '#FF5722',
        },
        {
            id: 8,
            title: 'Điều khoản & Chính sách',
            icon: 'document-text-outline',
            color: '#607D8B',
        },
    ];

    const { logout } = useAuth();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tài Khoản</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>👤</Text>
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>Nguyễn Văn A</Text>
                    <Text style={styles.userEmail}>nguyenvana@email.com</Text>
                    <Text style={styles.userPhone}>+84 123 456 789</Text>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={styles.statLabel}>Đặt lịch</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>18</Text>
                            <Text style={styles.statLabel}>Hoàn thành</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>4.8</Text>
                            <Text style={styles.statLabel}>Đánh giá</Text>
                        </View>
                    </View>
                </View>

                {/* Membership Card */}
                <View style={styles.membershipCard}>
                    <View style={styles.membershipContent}>
                        <Ionicons name="star" size={24} color="#FFD700" />
                        <View style={styles.membershipText}>
                            <Text style={styles.membershipTitle}>Nâng cấp tài khoản</Text>
                            <Text style={styles.membershipSubtitle}>
                                Nhận ưu đãi đặc biệt
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#2196F3" />
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.menuItem}>
                            <View
                                style={[
                                    styles.menuIconContainer,
                                    { backgroundColor: `${item.color}15` },
                                ]}
                            >
                                <Ionicons name={item.icon} size={24} color={item.color} />
                            </View>
                            <Text style={styles.menuText}>{item.title}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Version Info */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton}
                    onPress={logout}
                    >
                    <Ionicons name="log-out-outline" size={20} color="#F44336" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f7fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    profileCard: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 10,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 80,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    userPhone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#e0e0e0',
    },
    membershipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF9E6',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FFD700',
    },
    membershipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    membershipText: {
        marginLeft: 12,
        flex: 1,
    },
    membershipTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    membershipSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    menuContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    menuIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    versionText: {
        fontSize: 12,
        color: '#999',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 8,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F44336',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F44336',
        marginLeft: 8,
    },
});

export default ProfileScreen;
