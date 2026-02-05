import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Image,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';
import jobService from '../../services/jobService';
import locationService from '../../services/locationService';

export default function JobDetailScreen({ route, navigation }) {
    const { jobId } = route.params || {};
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (jobId) {
            fetchJobDetail();
        } else {
            setLoading(false);
        }
    }, [jobId]);

    const fetchJobDetail = async () => {
        try {
            setLoading(true);
            const jobData = await jobService.getJobById(jobId);
            console.log('📍 Job detail loaded:', jobData);
            setJob(jobData);
        } catch (error) {
            console.error('Error fetching job detail:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin công việc');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết công việc</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!job) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết công việc</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Không tìm thấy công việc</Text>
                </View>
            </SafeAreaView>
        );
    }

    const jobDetails = [
        { icon: 'construct', label: 'Dịch vụ', value: job.title || 'N/A' },
        { icon: 'location', label: 'Địa chỉ', value: `${job.address}, ${job.ward}, ${job.district}` },
        { icon: 'business', label: 'Thành phố', value: job.city },
        { icon: 'time', label: 'Thời gian', value: `${new Date(job.preferredDate).toLocaleDateString('vi-VN')} - ${job.preferredTimeStart?.substring(0, 5)}` },
        { icon: 'wallet', label: 'Ngân sách', value: (job.estimatedBudget ? job.estimatedBudget.toLocaleString('vi-VN') : '0') + 'đ' },
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
                            <Text style={styles.serviceName}>{job.title}</Text>
                            <View style={styles.priceTag}>
                                <Text style={styles.priceText}>
                                    {job.estimatedBudget ? job.estimatedBudget.toLocaleString('vi-VN') : '0'}đ
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
                {job.photoUrls && job.photoUrls.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hình ảnh</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {job.photoUrls.map((url, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: url }}
                                    style={styles.jobPhoto}
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Map Preview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vị trí</Text>
                    <TouchableOpacity
                        style={styles.mapPreview}
                        onPress={() => {
                            const url = locationService.getDirectionsUrl(
                                null, null, 
                                job.latitude, 
                                job.longitude
                            );
                            Linking.openURL(url);
                        }}
                    >
                        <Ionicons name="map" size={40} color="#FF6B35" />
                        <Text style={styles.mapText}>Chỉ đường</Text>
                    </TouchableOpacity>
                </View>

                {/* Customer Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trạng thái</Text>
                    <View style={styles.statusBadge}>
                        <Ionicons 
                            name={job.status === 'open' ? 'time-outline' : 'checkmark-circle'} 
                            size={20} 
                            color={job.status === 'open' ? '#FF9800' : '#4CAF50'} 
                        />
                        <Text style={[
                            styles.statusText,
                            { color: job.status === 'open' ? '#FF9800' : '#4CAF50' }
                        ]}>
                            {job.status === 'open' ? 'Đang chờ' : 'Đã xử lý'}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.rejectButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.rejectText}>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => {
                        Alert.alert(
                            'Xác nhận',
                            'Bạn có chắc muốn nhận công việc này?',
                            [
                                { text: 'Hủy', style: 'cancel' },
                                { 
                                    text: 'Nhận việc', 
                                    onPress: () => {
                                        Alert.alert('Thành công', 'Đã nhận công việc!');
                                        navigation.goBack();
                                    }
                                }
                            ]
                        );
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    jobPhoto: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginRight: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
