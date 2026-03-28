import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ServiceDetailScreen = ({ route, navigation }) => {
    const { service } = route.params || {};
    const [searchQuery, setSearchQuery] = useState('');

    // Danh sách dịch vụ chi tiết theo từng loại
    const getServiceDetails = () => {
        const services = {
            // ĐIỆN LẠNH - Parent category (categoryId: 1)
            'Điện lạnh': [
                {
                    id: 1,
                    name: 'Bảo trì thiết bị điện lạnh định kỳ',
                    description: 'Kiểm tra, vệ sinh, bảo dưỡng thiết bị điện lạnh',
                    priceRange: '200,000 - 400,000',
                    duration: '60-90 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Sửa chữa thiết bị điện lạnh',
                    description: 'Xử lý các sự cố về điện lạnh',
                    priceRange: '300,000 - 800,000',
                    duration: '90-120 phút',
                    popular: false,
                },
            ],
            
            // MÁY GIẶT (categoryId: 4, parentId: 1)
            'Máy giặt': [
                {
                    id: 1,
                    name: 'Vệ sinh máy giặt',
                    description: 'Vệ sinh lồng giặt, khử mùi, diệt khuẩn',
                    priceRange: '150,000 - 200,000',
                    duration: '45-60 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Máy giặt không vắt',
                    description: 'Sửa motor, thay dây curoa, kiểm tra mạch',
                    priceRange: '200,000 - 500,000',
                    duration: '60-90 phút',
                    popular: true,
                },
                {
                    id: 3,
                    name: 'Máy giặt rò nước',
                    description: 'Thay gioăng cửa, sửa vòi xả, kiểm tra đường ống',
                    priceRange: '150,000 - 350,000',
                    duration: '45-60 phút',
                    popular: true,
                },
                {
                    id: 4,
                    name: 'Máy giặt kêu to',
                    description: 'Kiểm tra bạc đạn, motor, chống rung',
                    priceRange: '200,000 - 400,000',
                    duration: '60 phút',
                    popular: false,
                },
            ],

            // MÁY LẠNH (categoryId: 5, parentId: 1)
            'Máy lạnh': [
                {
                    id: 1,
                    name: 'Vệ sinh máy lạnh treo tường',
                    description: 'Vệ sinh, kiểm tra gas, làm sạch dàn nóng/lạnh',
                    priceRange: '150,000 - 250,000',
                    duration: '45-60 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Máy lạnh không lạnh',
                    description: 'Kiểm tra gas, sửa chữa dàn nóng, thay linh kiện',
                    priceRange: '200,000 - 500,000',
                    duration: '60-90 phút',
                    popular: true,
                },
                {
                    id: 3,
                    name: 'Máy lạnh kêu to',
                    description: 'Kiểm tra motor quạt, vệ sinh, bảo dưỡng',
                    priceRange: '150,000 - 400,000',
                    duration: '30-60 phút',
                    popular: false,
                },
                {
                    id: 4,
                    name: 'Bơm gas máy lạnh',
                    description: 'Bơm gas R410, R32 cho máy lạnh',
                    priceRange: '300,000 - 600,000',
                    duration: '30-45 phút',
                    popular: false,
                },
                {
                    id: 5,
                    name: 'Di dời máy lạnh',
                    description: 'Tháo lắp, di chuyển máy lạnh sang vị trí khác',
                    priceRange: '500,000 - 800,000',
                    duration: '2-3 giờ',
                    popular: false,
                },
            ],

            // TỦ LẠNH (categoryId: 6, parentId: 1)
            'Tủ lạnh': [
                {
                    id: 1,
                    name: 'Tủ lạnh không lạnh',
                    description: 'Kiểm tra gas, block, relay, kiểm tra rò rỉ',
                    priceRange: '250,000 - 600,000',
                    duration: '60-90 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Tủ lạnh kêu to',
                    description: 'Kiểm tra block, quạt, chống rung',
                    priceRange: '200,000 - 450,000',
                    duration: '45-60 phút',
                    popular: true,
                },
                {
                    id: 3,
                    name: 'Tủ lạnh chảy nước',
                    description: 'Thông tắc đường thoát nước, kiểm tra gioăng cửa',
                    priceRange: '150,000 - 300,000',
                    duration: '30-45 phút',
                    popular: false,
                },
                {
                    id: 4,
                    name: 'Thay block tủ lạnh',
                    description: 'Thay thế block compressor',
                    priceRange: '800,000 - 2,000,000',
                    duration: '2-3 giờ',
                    popular: false,
                },
            ],

            // ĐIỆN NƯỚC - Parent category (categoryId: 2)
            'Điện nước': [
                {
                    id: 1,
                    name: 'Kiểm tra hệ thống điện nước',
                    description: 'Kiểm tra tổng thể hệ thống điện nước',
                    priceRange: '200,000 - 400,000',
                    duration: '60-90 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Sửa chữa điện nước',
                    description: 'Xử lý các sự cố về điện nước',
                    priceRange: '300,000 - 800,000',
                    duration: '90-120 phút',
                    popular: false,
                },
            ],

            // ỐNG NƯỚC (categoryId: 7, parentId: 2)
            'Ống nước': [
                {
                    id: 1,
                    name: 'Sửa ống nước bị rò',
                    description: 'Hàn, thay ống nước bị rò rỉ',
                    priceRange: '150,000 - 400,000',
                    duration: '45-90 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Thông tắc cống',
                    description: 'Thông tắc bồn cầu, lavabo, cống rãnh',
                    priceRange: '200,000 - 500,000',
                    duration: '30-60 phút',
                    popular: true,
                },
                {
                    id: 3,
                    name: 'Lắp đặt đường ống nước mới',
                    description: 'Lắp đặt hệ thống ống nước mới',
                    priceRange: '500,000 - 1,500,000',
                    duration: '2-4 giờ',
                    popular: false,
                },
                {
                    id: 4,
                    name: 'Sửa vòi nước bị hỏng',
                    description: 'Thay thế, sửa chữa vòi nước',
                    priceRange: '100,000 - 300,000',
                    duration: '20-30 phút',
                    popular: true,
                },
            ],

            // ĐIỆN DÂN DỤNG (categoryId: 8, parentId: 2)
            'Điện dân dụng': [
                {
                    id: 1,
                    name: 'Sửa chập điện',
                    description: 'Xử lý chập điện, kiểm tra hệ thống',
                    priceRange: '200,000 - 500,000',
                    duration: '45-90 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Lắp đặt ổ cắm, công tắc',
                    description: 'Lắp mới, thay thế ổ cắm, công tắc điện',
                    priceRange: '100,000 - 300,000',
                    duration: '30-45 phút',
                    popular: true,
                },
                {
                    id: 3,
                    name: 'Sửa đèn chiếu sáng',
                    description: 'Thay bóng đèn, sửa mạch đèn',
                    priceRange: '100,000 - 250,000',
                    duration: '20-30 phút',
                    popular: false,
                },
                {
                    id: 4,
                    name: 'Lắp đặt hệ thống điện mới',
                    description: 'Thiết kế, lắp đặt hệ thống điện trong nhà',
                    priceRange: '1,000,000 - 5,000,000',
                    duration: '1-3 ngày',
                    popular: false,
                },
            ],

            // ĐIỆN TỬ - Parent category (categoryId: 3)
            'Điện tử': [
                {
                    id: 1,
                    name: 'Bảo trì thiết bị điện tử',
                    description: 'Kiểm tra, vệ sinh thiết bị điện tử',
                    priceRange: '200,000 - 400,000',
                    duration: '45-60 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Sửa chữa thiết bị điện tử',
                    description: 'Xử lý các sự cố về điện tử',
                    priceRange: '300,000 - 1,000,000',
                    duration: '60-120 phút',
                    popular: false,
                },
            ],

            // TI VI (categoryId: 9, parentId: 3)
            'Ti vi': [
                {
                    id: 1,
                    name: 'Ti vi không lên hình',
                    description: 'Kiểm tra nguồn, main, panel',
                    priceRange: '300,000 - 800,000',
                    duration: '60-90 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Ti vi không có tiếng',
                    description: 'Sửa mạch âm thanh, thay loa',
                    priceRange: '200,000 - 500,000',
                    duration: '45-60 phút',
                    popular: true,
                },
                {
                    id: 3,
                    name: 'Thay màn hình ti vi',
                    description: 'Thay thế màn hình bị vỡ, hỏng',
                    priceRange: '1,500,000 - 5,000,000',
                    duration: '1-2 giờ',
                    popular: false,
                },
                {
                    id: 4,
                    name: 'Vệ sinh ti vi',
                    description: 'Vệ sinh bụi bẩn, kiểm tra mạch',
                    priceRange: '150,000 - 300,000',
                    duration: '30-45 phút',
                    popular: false,
                },
            ],

            // MÁY TÍNH (categoryId: 10, parentId: 3)
            'Máy tính': [
                {
                    id: 1,
                    name: 'Máy tính chạy chậm',
                    description: 'Vệ sinh, nâng cấp RAM, SSD',
                    priceRange: '200,000 - 500,000',
                    duration: '45-90 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Máy tính không khởi động',
                    description: 'Kiểm tra nguồn, mainboard, CPU',
                    priceRange: '300,000 - 800,000',
                    duration: '60-120 phút',
                    popular: true,
                },
                {
                    id: 3,
                    name: 'Cài đặt Windows',
                    description: 'Cài đặt hệ điều hành, driver, phần mềm',
                    priceRange: '150,000 - 300,000',
                    duration: '60-90 phút',
                    popular: true,
                },
                {
                    id: 4,
                    name: 'Nâng cấp phần cứng',
                    description: 'Thay thế, nâng cấp linh kiện',
                    priceRange: '300,000 - 1,000,000',
                    duration: '45-90 phút',
                    popular: false,
                },
                {
                    id: 5,
                    name: 'Sửa laptop',
                    description: 'Sửa chữa, thay linh kiện laptop',
                    priceRange: '300,000 - 2,000,000',
                    duration: '60-180 phút',
                    popular: true,
                },
            ],
        };

        return services[service] || [];
    };

    const serviceDetails = getServiceDetails();

    const handleSelectService = (serviceDetail) => {
        console.log('ServiceDetail clicked:', serviceDetail);
        console.log('Navigating with params:', {
            categoryId: route.params?.categoryId,
            categoryName: service,
            serviceDetail: serviceDetail
        });
        
        // Navigate đến màn hình chọn loại đặt lịch trước
        navigation.navigate('BookingType', {
            categoryId: route.params?.categoryId,
            service: service,
            serviceDetail: {
                ...serviceDetail,
                categoryName: service,
            },
        });
    };

    // Nếu không tìm thấy dịch vụ, hiển thị thông báo
    if (!service || serviceDetails.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Dịch vụ</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={[styles.content, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
                    <Text style={{ fontSize: 16, color: '#666', marginTop: 16 }}>
                        Không tìm thấy dịch vụ
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#2196F3', borderRadius: 8 }}
                    >
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

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
                <Text style={styles.headerTitle}>{service}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm dịch vụ..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Service List */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Popular Services */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="flame" size={20} color="#FF6B6B" />
                            <Text style={styles.sectionTitle}>Dịch Vụ Phổ Biến</Text>
                        </View>

                        {serviceDetails
                            .filter(s => s.popular)
                            .map((detail) => (
                                <TouchableOpacity
                                    key={detail.id}
                                    style={styles.serviceCard}
                                    onPress={() => handleSelectService(detail)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.serviceHeader}>
                                        <View style={styles.serviceInfo}>
                                            <Text style={styles.serviceName}>{detail.name}</Text>
                                            {detail.popular && (
                                                <View style={styles.popularBadge}>
                                                    <Ionicons name="trending-up" size={12} color="#FF6B6B" />
                                                    <Text style={styles.popularText}>Phổ biến</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                    </View>

                                    <Text style={styles.serviceDescription}>{detail.description}</Text>

                                    <View style={styles.serviceFooter}>
                                        <View style={styles.priceContainer}>
                                            <Ionicons name="cash-outline" size={16} color="#2196F3" />
                                            <Text style={styles.priceText}>{detail.priceRange} ₫</Text>
                                        </View>
                                        <View style={styles.durationContainer}>
                                            <Ionicons name="time-outline" size={16} color="#666" />
                                            <Text style={styles.durationText}>{detail.duration}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                    </View>

                    {/* Other Services */}
                    {serviceDetails.filter(s => !s.popular).length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="grid-outline" size={20} color="#666" />
                                <Text style={styles.sectionTitle}>Dịch Vụ Khác</Text>
                            </View>

                            {serviceDetails
                                .filter(s => !s.popular)
                                .map((detail) => (
                                    <TouchableOpacity
                                        key={detail.id}
                                        style={styles.serviceCard}
                                        onPress={() => handleSelectService(detail)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.serviceHeader}>
                                            <Text style={styles.serviceName}>{detail.name}</Text>
                                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                        </View>

                                        <Text style={styles.serviceDescription}>{detail.description}</Text>

                                        <View style={styles.serviceFooter}>
                                            <View style={styles.priceContainer}>
                                                <Ionicons name="cash-outline" size={16} color="#2196F3" />
                                                <Text style={styles.priceText}>{detail.priceRange} ₫</Text>
                                            </View>
                                            <View style={styles.durationContainer}>
                                                <Ionicons name="time-outline" size={16} color="#666" />
                                                <Text style={styles.durationText}>{detail.duration}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                        </View>
                    )}

                    {/* Help Section */}
                    <TouchableOpacity 
                        style={styles.helpCard}
                        onPress={() => navigation.navigate('AIDiagnosis')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="bulb" size={24} color="#eedc4dff" />
                        <View style={styles.helpContent}>
                            <Text style={styles.helpTitle}>Không tìm thấy dịch vụ bạn cần?</Text>
                            <Text style={styles.helpText}>
                                Hãy mô tả sự cố của bạn, AI sẽ giúp tìm thợ phù hợp
                            </Text>
                        </View>
                        <View style={styles.contactButton}>
                            <Ionicons name="call" size={18} color="#fff" />
                        </View>
                    </TouchableOpacity>
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
        paddingBottom: 16,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginVertical: 16,
        paddingHorizontal: 15,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingLeft: 10,
        fontSize: 15,
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 0,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    serviceCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    serviceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    serviceInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    popularBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
    },
    popularText: {
        fontSize: 11,
        color: '#FF6B6B',
        fontWeight: '600',
    },
    serviceDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 12,
    },
    serviceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2196F3',
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    durationText: {
        fontSize: 13,
        color: '#666',
    },
    helpCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginTop: 8,
    },
    helpContent: {
        flex: 1,
    },
    helpTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    helpText: {
        fontSize: 12,
        color: '#666',
    },
    contactButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ServiceDetailScreen;
