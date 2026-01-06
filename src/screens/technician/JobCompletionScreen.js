import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Image,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';

export default function JobCompletionScreen({ navigation, route }) {
    const { job, workDuration } = route.params;
    const [notes, setNotes] = useState('');
    const [beforePhotos, setBeforePhotos] = useState([]);
    const [afterPhotos, setAfterPhotos] = useState([]);
    const [additionalCost, setAdditionalCost] = useState('0');
    const [costDescription, setCostDescription] = useState('');

    const totalPrice = parseInt(job.price || 0) + parseInt(additionalCost || 0);

    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) {
            return `${hrs} giờ ${mins} phút`;
        }
        return `${mins} phút`;
    };

    const handleAddPhoto = (type) => {
        // Trong thực tế, mở camera hoặc gallery
        Alert.alert('Thêm ảnh', `Chọn ảnh ${type === 'before' ? 'trước' : 'sau'} khi sửa`);
    };

    const handleRequestPayment = () => {
        Alert.alert(
            'Yêu cầu thanh toán',
            `Tổng tiền: ${totalPrice.toLocaleString('vi-VN')} ₫\n\nGửi yêu cầu thanh toán đến khách hàng?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Gửi',
                    onPress: () => {
                        // Gửi request đến server
                        navigation.navigate('TechnicianHome', {
                            showSuccess: true,
                            message: 'Đã gửi yêu cầu thanh toán!',
                        });
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hoàn thành công việc</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Success Message */}
                <View style={styles.successCard}>
                    <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                    <Text style={styles.successTitle}>Công việc hoàn tất!</Text>
                    <Text style={styles.successDescription}>
                        Vui lòng xác nhận thông tin để thanh toán
                    </Text>
                </View>

                {/* Job Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tóm tắt công việc</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Dịch vụ</Text>
                        <Text style={styles.summaryValue}>{job.service}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Khách hàng</Text>
                        <Text style={styles.summaryValue}>{job.customer}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Thời gian làm</Text>
                        <Text style={styles.summaryValue}>{formatDuration(workDuration)}</Text>
                    </View>
                </View>

                {/* Photos */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Ảnh trước và sau sửa chữa</Text>
                    <Text style={styles.photoNote}>
                        Thêm ảnh để khách hàng xem công việc đã hoàn thành
                    </Text>

                    {/* Before Photos */}
                    <View style={styles.photoSection}>
                        <Text style={styles.photoLabel}>Trước khi sửa</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity
                                style={styles.addPhotoButton}
                                onPress={() => handleAddPhoto('before')}
                            >
                                <Ionicons name="camera" size={32} color="#FF6B35" />
                                <Text style={styles.addPhotoText}>Thêm ảnh</Text>
                            </TouchableOpacity>
                            {beforePhotos.map((photo, index) => (
                                <View key={index} style={styles.photoItem}>
                                    <Image source={{ uri: photo }} style={styles.photo} />
                                    <TouchableOpacity style={styles.removePhoto}>
                                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* After Photos */}
                    <View style={styles.photoSection}>
                        <Text style={styles.photoLabel}>Sau khi sửa</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity
                                style={styles.addPhotoButton}
                                onPress={() => handleAddPhoto('after')}
                            >
                                <Ionicons name="camera" size={32} color="#4CAF50" />
                                <Text style={styles.addPhotoText}>Thêm ảnh</Text>
                            </TouchableOpacity>
                            {afterPhotos.map((photo, index) => (
                                <View key={index} style={styles.photoItem}>
                                    <Image source={{ uri: photo }} style={styles.photo} />
                                    <TouchableOpacity style={styles.removePhoto}>
                                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Work Notes */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Ghi chú công việc</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="Mô tả chi tiết công việc đã làm, vấn đề đã khắc phục..."
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                {/* Additional Cost */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Chi phí phát sinh (nếu có)</Text>
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Giá dịch vụ ban đầu</Text>
                        <Text style={styles.costValue}>
                            {(job.price || 0).toLocaleString('vi-VN')} ₫
                        </Text>
                    </View>

                    <View style={styles.additionalCostInput}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Chi phí thêm</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={additionalCost}
                                    onChangeText={setAdditionalCost}
                                />
                                <Text style={styles.currency}>₫</Text>
                            </View>
                        </View>
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Lý do phát sinh (vật tư, linh kiện thêm...)"
                            value={costDescription}
                            onChangeText={setCostDescription}
                        />
                    </View>

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                        <Text style={styles.totalValue}>
                            {totalPrice.toLocaleString('vi-VN')} ₫
                        </Text>
                    </View>
                </View>

                {/* Payment Methods */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
                    <TouchableOpacity style={styles.paymentOption}>
                        <View style={styles.paymentLeft}>
                            <Ionicons name="cash" size={24} color="#4CAF50" />
                            <Text style={styles.paymentText}>Tiền mặt</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.paymentOption}>
                        <View style={styles.paymentLeft}>
                            <Ionicons name="card" size={24} color="#2196F3" />
                            <Text style={styles.paymentText}>Chuyển khoản</Text>
                        </View>
                        <View style={styles.radioButton} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Action Button */}
            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerLabel}>Tổng tiền</Text>
                    <Text style={styles.footerPrice}>
                        {totalPrice.toLocaleString('vi-VN')} ₫
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleRequestPayment}
                >
                    <Ionicons name="send" size={20} color="white" />
                    <Text style={styles.submitText}>Gửi yêu cầu thanh toán</Text>
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
    successCard: {
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 15,
        padding: 30,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 15,
        marginBottom: 8,
    },
    successDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    photoNote: {
        fontSize: 13,
        color: '#999',
        marginBottom: 15,
    },
    photoSection: {
        marginBottom: 20,
    },
    photoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    addPhotoButton: {
        width: 100,
        height: 100,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    addPhotoText: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
    photoItem: {
        marginRight: 10,
        position: 'relative',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    removePhoto: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    notesInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 15,
        fontSize: 14,
        color: '#333',
        textAlignVertical: 'top',
        minHeight: 100,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        marginBottom: 15,
    },
    costLabel: {
        fontSize: 14,
        color: '#666',
    },
    costValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    additionalCostInput: {
        backgroundColor: '#FFF8E1',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    inputGroup: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 15,
    },
    priceInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        paddingVertical: 12,
    },
    currency: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    descriptionInput: {
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#4CAF5015',
        padding: 15,
        borderRadius: 12,
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    paymentOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    paymentText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#DDD',
    },
    footer: {
        backgroundColor: 'white',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    footerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    footerLabel: {
        fontSize: 15,
        color: '#666',
    },
    footerPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
