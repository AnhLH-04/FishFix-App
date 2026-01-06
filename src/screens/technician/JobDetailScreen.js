import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';

export default function JobDetailScreen({ route, navigation }) {
    const { job } = route.params || {
        job: {
            service: 'Sửa máy lạnh',
            address: '123 Nguyễn Văn Linh, Q.7',
            customer: 'Nguyễn Văn A',
            phone: '0123456789',
            time: '14:00 - Hôm nay',
            price: 500000,
            distance: '2.5 km',
            description: 'Máy lạnh không lạnh, có tiếng kêu lạ',
        },
    };

    const jobDetails = [
        { icon: 'construct', label: 'Dịch vụ', value: job.service },
        { icon: 'location', label: 'Địa chỉ', value: job.address },
        { icon: 'person', label: 'Khách hàng', value: job.customer },
        { icon: 'call', label: 'Số điện thoại', value: job.phone },
        { icon: 'time', label: 'Thời gian', value: job.time },
        { icon: 'navigate', label: 'Khoảng cách', value: job.distance },
        { icon: 'wallet', label: 'Thu nhập', value: (job.price ? job.price.toLocaleString('vi-VN') : '0') + 'đ' },
    ];

    const equipmentNeeded = [
        'Máy đo áp suất',
        'Gas điều hòa',
        'Bộ dụng cụ sửa chữa cơ bản',
        'Máy hút chân không',
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết công việc</Text>
                <TouchableOpacity>
                    <Ionicons name="share-social" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Service Info */}
                <View style={styles.section}>
                    <View style={styles.serviceHeader}>
                        <View style={styles.serviceIcon}>
                            <Ionicons name="construct" size={32} color="#FF6B35" />
                        </View>
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceName}>{job.service}</Text>
                            <View style={styles.priceTag}>
                                <Text style={styles.priceText}>
                                    {job.price ? job.price.toLocaleString('vi-VN') : '0'}đ
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mô tả vấn đề</Text>
                    <View style={styles.descriptionBox}>
                        <Text style={styles.description}>{job.description}</Text>
                    </View>
                </View>

                {/* Job Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
                    {jobDetails.map((detail, index) => (
                        <View key={index} style={styles.detailRow}>
                            <View style={styles.detailIcon}>
                                <Ionicons name={detail.icon} size={20} color="#666" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>{detail.label}</Text>
                                <Text style={styles.detailValue}>{detail.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Equipment Needed */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thiết bị cần mang</Text>
                    {equipmentNeeded.map((equipment, index) => (
                        <View key={index} style={styles.equipmentItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={styles.equipmentText}>{equipment}</Text>
                        </View>
                    ))}
                </View>

                {/* Map Preview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vị trí</Text>
                    <TouchableOpacity
                        style={styles.mapPreview}
                        onPress={() => navigation.navigate('MapView', { address: job.address })}
                    >
                        <Ionicons name="map" size={40} color="#FF6B35" />
                        <Text style={styles.mapText}>Xem bản đồ</Text>
                    </TouchableOpacity>
                </View>

                {/* Customer Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                    <View style={styles.customerCard}>
                        <View style={styles.customerAvatar}>
                            <Ionicons name="person" size={30} color="#FF6B35" />
                        </View>
                        <View style={styles.customerInfo}>
                            <Text style={styles.customerName}>{job.customer}</Text>
                            <View style={styles.customerRating}>
                                <Ionicons name="star" size={14} color="#FFB800" />
                                <Text style={styles.ratingText}>4.8</Text>
                                <Text style={styles.ratingCount}>(25 đánh giá)</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.callButton}>
                            <Ionicons name="call" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.rejectButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.rejectText}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => {
                        alert('Đã nhận việc!');
                        navigation.goBack();
                    }}
                >
                    <Text style={styles.acceptText}>Nhận việc</Text>
                </TouchableOpacity>
            </View>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        backgroundColor: 'white',
        marginTop: 10,
        padding: 20,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF6B3520',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    priceTag: {
        backgroundColor: '#4CAF5020',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    descriptionBox: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B35',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    equipmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    equipmentText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#666',
    },
    mapPreview: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    mapText: {
        marginTop: 10,
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '600',
    },
    customerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
    },
    customerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FF6B3520',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    customerRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    ratingCount: {
        marginLeft: 5,
        fontSize: 12,
        color: '#999',
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        gap: 10,
    },
    rejectButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF3B30',
        alignItems: 'center',
    },
    rejectText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    acceptButton: {
        flex: 2,
        paddingVertical: 15,
        borderRadius: 12,
        backgroundColor: '#FF6B35',
        alignItems: 'center',
    },
    acceptText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});
