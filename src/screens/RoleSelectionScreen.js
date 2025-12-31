import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../utils/colors';

const { width } = Dimensions.get('window');

export default function RoleSelectionScreen({ navigation }) {
    const handleRoleSelect = (role) => {
        navigation.navigate('Login', { role });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Chào mừng đến với</Text>
                <Text style={styles.subtitle}>Smart Home Services</Text>
                <Text style={styles.description}>
                    Chọn loại tài khoản để tiếp tục
                </Text>
            </View>

            <View style={styles.rolesContainer}>
                {/* Customer Card */}
                <TouchableOpacity
                    style={[styles.roleCard, styles.customerCard]}
                    onPress={() => handleRoleSelect('customer')}
                    activeOpacity={0.8}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="person" size={60} color={Colors.primary} />
                    </View>
                    <Text style={styles.roleTitle}>Khách hàng</Text>
                    <Text style={styles.roleDescription}>
                        Đặt lịch sửa chữa và bảo trì thiết bị điện gia dụng
                    </Text>
                    <View style={styles.features}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                            <Text style={styles.featureText}>Đặt lịch nhanh chóng</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                            <Text style={styles.featureText}>Chẩn đoán AI</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                            <Text style={styles.featureText}>Theo dõi đơn hàng</Text>
                        </View>
                    </View>
                    <View style={styles.arrowContainer}>
                        <Ionicons name="arrow-forward" size={24} color={Colors.primary} />
                    </View>
                </TouchableOpacity>

                {/* Technician Card */}
                <TouchableOpacity
                    style={[styles.roleCard, styles.technicianCard]}
                    onPress={() => handleRoleSelect('technician')}
                    activeOpacity={0.8}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="construct" size={60} color="#FF6B35" />
                    </View>
                    <Text style={styles.roleTitle}>Thợ sửa chữa</Text>
                    <Text style={styles.roleDescription}>
                        Nhận công việc và quản lý lịch làm việc
                    </Text>
                    <View style={styles.features}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
                            <Text style={styles.featureText}>Nhận việc linh hoạt</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
                            <Text style={styles.featureText}>Quản lý lịch trình</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
                            <Text style={styles.featureText}>Thu nhập ổn định</Text>
                        </View>
                    </View>
                    <View style={styles.arrowContainer}>
                        <Ionicons name="arrow-forward" size={24} color="#FF6B35" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    header: {
        marginTop: 60,
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        color: '#666',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#999',
    },
    rolesContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 20,
    },
    roleCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    customerCard: {
        borderColor: Colors.primary,
    },
    technicianCard: {
        borderColor: '#FF6B35',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    roleTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    roleDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    features: {
        marginBottom: 15,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#555',
    },
    arrowContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
});
