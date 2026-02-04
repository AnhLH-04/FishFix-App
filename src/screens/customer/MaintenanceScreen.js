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

const MaintenanceScreen = ({ navigation }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);

    const maintenancePlans = [
        {
            id: 1,
            name: 'Gói Cơ Bản',
            price: '299,000đ',
            duration: '3 tháng',
            color: '#4A90E2',
            popular: false,
            features: [
                'Kiểm tra định kỳ 1 lần/tháng',
                'Ưu tiên hỗ trợ qua điện thoại',
                'Giảm 10% phí sửa chữa',
                'Bảo hành 15 ngày',
            ],
        },
        // {
        //     id: 2,
        //     name: 'Gói Tiêu Chuẩn',
        //     price: '699,000đ',
        //     duration: '6 tháng',
        //     color: '#1E88E5',
        //     popular: true,
        //     features: [
        //         'Kiểm tra định kỳ 2 lần/tháng',
        //         'Ưu tiên cao khi đặt lịch',
        //         'Giảm 20% phí sửa chữa',
        //         'Bảo hành 30 ngày',
        //         'Vệ sinh miễn phí 2 lần',
        //         'Hỗ trợ khẩn cấp 24/7',
        //     ],
        // },
        // {
        //     id: 3,
        //     name: 'Gói Premium',
        //     price: '1,299,000đ',
        //     duration: '12 tháng',
        //     color: '#7ED321',
        //     popular: false,
        //     features: [
        //         'Kiểm tra định kỳ không giới hạn',
        //         'Ưu tiên tối đa, phản hồi < 15 phút',
        //         'Giảm 30% phí sửa chữa',
        //         'Bảo hành 60 ngày',
        //         'Vệ sinh miễn phí không giới hạn',
        //         'Thay thế linh kiện miễn phí (giá trị < 200k)',
        //         'Bảo hiểm thiết bị tối đa 5 triệu',
        //         'Quà tặng đặc biệt',
        //     ],
        // },
    ];

    const appliances = [
        { id: 1, name: 'Máy giặt', icon: '💧', selected: false },
        { id: 2, name: 'Điều hòa', icon: '❄️', selected: false },
        { id: 3, name: 'Tủ lạnh', icon: '🧊', selected: false },
        { id: 4, name: 'Bếp gas', icon: '🔥', selected: false },
        { id: 5, name: 'Máy nước nóng', icon: '🚿', selected: false },
    ];

    const [selectedAppliances, setSelectedAppliances] = useState([]);

    const toggleAppliance = (id) => {
        if (selectedAppliances.includes(id)) {
            setSelectedAppliances(selectedAppliances.filter((item) => item !== id));
        } else {
            setSelectedAppliances([...selectedAppliances, id]);
        }
    };

    const handleSubscribe = () => {
        if (!selectedPlan) {
            Alert.alert('Thông báo', 'Vui lòng chọn gói bảo trì');
            return;
        }
        if (selectedAppliances.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một thiết bị');
            return;
        }

        const plan = maintenancePlans.find((p) => p.id === selectedPlan);
        Alert.alert(
            'Xác nhận đăng ký',
            `Bạn muốn đăng ký ${plan.name}?\n\nThiết bị: ${selectedAppliances.length} thiết bị\nGiá: ${plan.price}`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng ký',
                    onPress: () => {
                        Alert.alert('Thành công', 'Đăng ký gói bảo trì thành công!');
                        navigation.goBack();
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
                <Text style={styles.headerTitle}>Gói Bảo Trì</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={24} color="#4A90E2" />
                    <Text style={styles.infoText}>
                        Đăng ký gói bảo trì để tiết kiệm chi phí và đảm bảo thiết bị luôn hoạt
                        động tốt nhất
                    </Text>
                </View>

                {/* Maintenance Plans */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chọn Gói Bảo Trì</Text>
                    {maintenancePlans.map((plan) => (
                        <TouchableOpacity
                            key={plan.id}
                            style={[
                                styles.planCard,
                                selectedPlan === plan.id && styles.planCardSelected,
                                { borderColor: plan.color },
                            ]}
                            onPress={() => setSelectedPlan(plan.id)}
                        >
                            {plan.popular && (
                                <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                                    <Text style={styles.popularText}>PHỔ BIẾN NHẤT</Text>
                                </View>
                            )}

                            <View style={styles.planHeader}>
                                <View>
                                    <Text style={[styles.planName, { color: plan.color }]}>
                                        {plan.name}
                                    </Text>
                                    <Text style={styles.planDuration}>{plan.duration}</Text>
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={[styles.planPrice, { color: plan.color }]}>
                                        {plan.price}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.featuresContainer}>
                                {plan.features.map((feature, index) => (
                                    <View key={index} style={styles.featureRow}>
                                        <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            {selectedPlan === plan.id && (
                                <View style={[styles.selectedIndicator, { backgroundColor: plan.color }]}>
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                    <Text style={styles.selectedText}>Đã chọn</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Select Appliances */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chọn Thiết Bị Cần Bảo Trì</Text>
                    <View style={styles.appliancesGrid}>
                        {appliances.map((appliance) => (
                            <TouchableOpacity
                                key={appliance.id}
                                style={[
                                    styles.applianceCard,
                                    selectedAppliances.includes(appliance.id) &&
                                    styles.applianceCardSelected,
                                ]}
                                onPress={() => toggleAppliance(appliance.id)}
                            >
                                <Text style={styles.applianceIcon}>{appliance.icon}</Text>
                                <Text style={styles.applianceName}>{appliance.name}</Text>
                                {selectedAppliances.includes(appliance.id) && (
                                    <View style={styles.checkmark}>
                                        <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.selectedCount}>
                        Đã chọn: {selectedAppliances.length} thiết bị
                    </Text>
                </View>

                {/* Benefits */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lợi Ích Khi Đăng Ký</Text>
                    <View style={styles.benefitsContainer}>
                        <View style={styles.benefitCard}>
                            <Ionicons name="trending-down" size={32} color="#2196F3" />
                            <Text style={styles.benefitTitle}>Tiết Kiệm</Text>
                            <Text style={styles.benefitText}>
                                Giảm 10-30% chi phí sửa chữa
                            </Text>
                        </View>
                        <View style={styles.benefitCard}>
                            <Ionicons name="shield-checkmark" size={32} color="#7ED321" />
                            <Text style={styles.benefitTitle}>An Tâm</Text>
                            <Text style={styles.benefitText}>
                                Bảo hành và hỗ trợ 24/7
                            </Text>
                        </View>
                        <View style={styles.benefitCard}>
                            <Ionicons name="time" size={32} color="#1E88E5" />
                            <Text style={styles.benefitTitle}>Tiện Lợi</Text>
                            <Text style={styles.benefitText}>
                                Ưu tiên đặt lịch nhanh chóng
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Testimonials */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Khách Hàng Nói Gì</Text>
                    <View style={styles.testimonialCard}>
                        <View style={styles.stars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons key={star} name="star" size={16} color="#FFD700" />
                            ))}
                        </View>
                        <Text style={styles.testimonialText}>
                            "Gói bảo trì rất đáng giá! Thiết bị được chăm sóc định kỳ, hoạt động
                            tốt hơn nhiều. Đội ngũ thợ chuyên nghiệp và nhiệt tình."
                        </Text>
                        <Text style={styles.testimonialAuthor}>- Nguyễn Văn A</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.bottomLabel}>Tổng chi phí:</Text>
                    <Text style={styles.bottomPrice}>
                        {selectedPlan
                            ? maintenancePlans.find((p) => p.id === selectedPlan)?.price
                            : '0đ'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                    <Text style={styles.subscribeButtonText}>Đăng Ký Ngay</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        margin: 20,
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1976D2',
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    planCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        elevation: 2,
        position: 'relative',
    },
    planCardSelected: {
        backgroundColor: '#F5FFFA',
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        right: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    planName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    planDuration: {
        fontSize: 12,
        color: '#666',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    featuresContainer: {
        marginTop: 8,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 8,
    },
    featureText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    selectedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    selectedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    appliancesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
    },
    applianceCard: {
        width: '30%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        position: 'relative',
    },
    applianceCardSelected: {
        backgroundColor: '#E8F5E9',
        borderColor: '#2196F3',
    },
    applianceIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    applianceName: {
        fontSize: 11,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    checkmark: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    selectedCount: {
        fontSize: 13,
        color: '#666',
        marginTop: 12,
        paddingHorizontal: 20,
        fontStyle: 'italic',
    },
    benefitsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    benefitCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    benefitTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginTop: 8,
        marginBottom: 4,
    },
    benefitText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        lineHeight: 16,
    },
    testimonialCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 16,
        elevation: 2,
    },
    stars: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 4,
    },
    testimonialText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    testimonialAuthor: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
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
    subscribeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        elevation: 3,
    },
    subscribeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default MaintenanceScreen;
