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
            'Điều Hòa': [
                {
                    id: 1,
                    name: 'Vệ sinh điều hòa treo tường',
                    description: 'Vệ sinh, kiểm tra gas, làm sạch dàn nóng/lạnh',
                    priceRange: '150,000 - 250,000',
                    duration: '45-60 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Điều hòa không lạnh',
                    description: 'Kiểm tra gas, sửa chữa dàn nóng, thay linh kiện',
                    priceRange: '200,000 - 500,000',
                    duration: '60-90 phút',
                    popular: true,
                },
                {
                    id: 3,
                    name: 'Điều hòa kêu to',
                    description: 'Kiểm tra motor quạt, vệ sinh, bảo dưỡng',
                    priceRange: '150,000 - 400,000',
                    duration: '30-60 phút',
                    popular: false,
                },
                {
                    id: 4,
                    name: 'Bơm gas điều hòa',
                    description: 'Bơm gas R410, R32 cho điều hòa',
                    priceRange: '300,000 - 600,000',
                    duration: '30-45 phút',
                    popular: false,
                },
                {
                    id: 5,
                    name: 'Di dời điều hòa',
                    description: 'Tháo lắp, di chuyển điều hòa sang vị trí khác',
                    priceRange: '500,000 - 800,000',
                    duration: '2-3 giờ',
                    popular: false,
                },
            ],
            'Máy Giặt': [
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
            'Tủ Lạnh': [
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
                    name: 'Vệ sinh tủ lạnh',
                    description: 'Vệ sinh toàn bộ, khử mùi, kiểm tra kỹ thuật',
                    priceRange: '150,000 - 250,000',
                    duration: '45-60 phút',
                    popular: false,
                },
                {
                    id: 3,
                    name: 'Tủ lạnh đóng tuyết',
                    description: 'Kiểm tra timer, cảm biến, sửa hệ thống làm lạnh',
                    priceRange: '200,000 - 500,000',
                    duration: '60-90 phút',
                    popular: true,
                },
                {
                    id: 4,
                    name: 'Tủ lạnh kêu to',
                    description: 'Kiểm tra compressor, quạt, chống rung',
                    priceRange: '200,000 - 450,000',
                    duration: '45-60 phút',
                    popular: false,
                },
            ],
            'Điện Nước': [
                {
                    id: 1,
                    name: 'Sửa ổ cắm, công tắc',
                    description: 'Thay, sửa công tắc, ổ cắm điện',
                    priceRange: '100,000 - 200,000',
                    duration: '30 phút',
                    popular: true,
                },
                {
                    id: 2,
                    name: 'Sửa chập điện',
                    description: 'Kiểm tra, sửa chữa hệ thống điện bị chập',
                    priceRange: '200,000 - 500,000',
                    duration: '60-120 phút',
                    popular: true,
                },
                {
                    id: 3,
                    name: 'Sửa vòi nước, sen vòi',
                    description: 'Thay vòi, sửa rò rỉ, thay sen tắm',
                    priceRange: '100,000 - 300,000',
                    duration: '30-45 phút',
                    popular: true,
                },
                {
                    id: 4,
                    name: 'Thông tắc bồn cầu, chậu rửa',
                    description: 'Thông tắc đường ống, bồn cầu',
                    priceRange: '150,000 - 400,000',
                    duration: '45-90 phút',
                    popular: true,
                },
            ],
        };

        return services[service] || [];
    };

    const serviceDetails = getServiceDetails();

    const handleSelectService = (serviceDetail) => {
        navigation.navigate('BookingType', {
            service: service,
            serviceDetail: serviceDetail
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
                    <View style={styles.helpCard}>
                        <Ionicons name="help-circle" size={24} color="#2196F3" />
                        <View style={styles.helpContent}>
                            <Text style={styles.helpTitle}>Không tìm thấy dịch vụ?</Text>
                            <Text style={styles.helpText}>
                                Hãy liên hệ với chúng tôi để được tư vấn
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.contactButton}>
                            <Ionicons name="call" size={18} color="#fff" />
                        </TouchableOpacity>
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
