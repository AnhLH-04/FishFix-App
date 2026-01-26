import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../utils/colors';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen({ navigation }) {
    const [selectedRole, setSelectedRole] = useState(null);

    const handleContinue = () => {
        if (selectedRole) {
            navigation.navigate('Login', { role: selectedRole });
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Chào mừng bạn đến với</Text>
                <Text style={styles.appName}>FishFix</Text>
                <Text style={styles.subtitle}>Bạn là Khách hàng hay Thợ sửa chữa?</Text>
            </View>

            {/* Role Cards */}
            <View style={styles.rolesContainer}>
                {/* Customer Card */}
                <TouchableOpacity
                    style={[
                        styles.roleCard,
                        selectedRole === 'customer' && styles.customerSelected
                    ]}
                    onPress={() => setSelectedRole('customer')}
                    activeOpacity={0.95}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.iconBadge}>
                            <Ionicons 
                                name="person" 
                                size={50} 
                                color={selectedRole === 'customer' ? '#fff' : '#667eea'} 
                            />
                        </View>
                        <Text style={[
                            styles.roleTitle,
                            selectedRole === 'customer' && styles.roleTitleSelected
                        ]}>
                            Khách Hàng
                        </Text>
                        <Text style={[
                            styles.roleDescription,
                            selectedRole === 'customer' && styles.roleDescriptionSelected
                        ]}>
                            Đặt lịch sửa chữa nhanh chóng và tiện lợi
                        </Text>
                        
                        <View style={styles.featuresContainer}>
                            <View style={styles.featureRow}>
                                <Ionicons 
                                    name="calendar" 
                                    size={18} 
                                    color={selectedRole === 'customer' ? '#fff' : '#667eea'} 
                                />
                                <Text style={[
                                    styles.featureText,
                                    selectedRole === 'customer' && styles.featureTextSelected
                                ]}>
                                    Đặt lịch dễ dàng
                                </Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Ionicons 
                                    name="shield-checkmark" 
                                    size={18} 
                                    color={selectedRole === 'customer' ? '#fff' : '#667eea'} 
                                />
                                <Text style={[
                                    styles.featureText,
                                    selectedRole === 'customer' && styles.featureTextSelected
                                ]}>
                                    Bảo hành chất lượng
                                </Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Ionicons 
                                    name="sparkles" 
                                    size={18} 
                                    color={selectedRole === 'customer' ? '#fff' : '#667eea'} 
                                />
                                <Text style={[
                                    styles.featureText,
                                    selectedRole === 'customer' && styles.featureTextSelected
                                ]}>
                                    AI chẩn đoán thông minh
                                </Text>
                            </View>
                        </View>

                        {selectedRole === 'customer' && (
                            <View style={styles.selectedBadge}>
                                <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Technician Card */}
                <TouchableOpacity
                    style={[
                        styles.roleCard,
                        selectedRole === 'technician' && styles.technicianSelected
                    ]}
                    onPress={() => setSelectedRole('technician')}
                    activeOpacity={0.95}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.iconBadge}>
                            <Ionicons 
                                name="construct" 
                                size={50} 
                                color={selectedRole === 'technician' ? '#fff' : '#fa709a'} 
                            />
                        </View>
                        <Text style={[
                            styles.roleTitle,
                            selectedRole === 'technician' && styles.roleTitleSelected
                        ]}>
                            Thợ Sửa Chữa
                        </Text>
                        <Text style={[
                            styles.roleDescription,
                            selectedRole === 'technician' && styles.roleDescriptionSelected
                        ]}>
                            Nhận việc linh hoạt, thu nhập cao
                        </Text>
                        
                        <View style={styles.featuresContainer}>
                            <View style={styles.featureRow}>
                                <Ionicons 
                                    name="time" 
                                    size={18} 
                                    color={selectedRole === 'technician' ? '#fff' : '#fa709a'} 
                                />
                                <Text style={[
                                    styles.featureText,
                                    selectedRole === 'technician' && styles.featureTextSelected
                                ]}>
                                    Lịch làm việc linh hoạt
                                </Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Ionicons 
                                    name="cash" 
                                    size={18} 
                                    color={selectedRole === 'technician' ? '#fff' : '#fa709a'} 
                                />
                                <Text style={[
                                    styles.featureText,
                                    selectedRole === 'technician' && styles.featureTextSelected
                                ]}>
                                    Thu nhập ổn định
                                </Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Ionicons 
                                    name="trending-up" 
                                    size={18} 
                                    color={selectedRole === 'technician' ? '#fff' : '#fa709a'} 
                                />
                                <Text style={[
                                    styles.featureText,
                                    selectedRole === 'technician' && styles.featureTextSelected
                                ]}>
                                    Phát triển sự nghiệp
                                </Text>
                            </View>
                        </View>

                        {selectedRole === 'technician' && (
                            <View style={styles.selectedBadge}>
                                <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                style={[
                    styles.continueButton,
                    !selectedRole && styles.continueButtonDisabled,
                    selectedRole === 'customer' && styles.continueButtonCustomer,
                    selectedRole === 'technician' && styles.continueButtonTechnician,
                ]}
                onPress={handleContinue}
                disabled={!selectedRole}
                activeOpacity={0.8}
            >
                <Text style={styles.continueButtonText}>
                    {selectedRole ? 'Tiếp Tục' : 'Chọn vai trò để tiếp tục'}
                </Text>
                {selectedRole && (
                    <Ionicons name="arrow-forward" size={22} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 30,
        paddingBottom: 30,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
    },
    rolesContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        gap: 20,
    },
    roleCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    customerSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    technicianSelected: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    cardContent: {
        padding: 24,
        minHeight: 220,
    },
    iconBadge: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    roleTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    roleTitleSelected: {
        color: '#fff',
    },
    roleDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    roleDescriptionSelected: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    featuresContainer: {
        gap: 10,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureText: {
        fontSize: 14,
        color: '#555',
        flex: 1,
    },
    featureTextSelected: {
        color: '#fff',
    },
    selectedBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    continueButton: {
        marginHorizontal: 20,
        marginBottom: 40,
        borderRadius: 30,
        backgroundColor: '#E0E0E0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    continueButtonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    continueButtonCustomer: {
        backgroundColor: Colors.primary,
    },
    continueButtonTechnician: {
        backgroundColor: '#FF6B35',
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
});
