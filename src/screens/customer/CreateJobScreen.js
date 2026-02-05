import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { createJob } from '../../services/jobService';
import { uploadMultipleImages } from '../../services/uploadService';

const CreateJobScreen = ({ route, navigation }) => {
    const authContext = useAuth();
    const user = authContext?.user;
    const userLocation = authContext?.userLocation;
    
    const { categoryId, categoryName, serviceName, serviceDescription, estimatedPrice } = route.params || {};

    const [description, setDescription] = useState(serviceDescription || '');
    const [address, setAddress] = useState('');
    const [ward, setWard] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('TP. Hồ Chí Minh');
    const [estimatedBudget, setEstimatedBudget] = useState('');
    const [urgency, setUrgency] = useState('medium'); // low, medium, high, emergency
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Tự động điền địa chỉ từ location khi có
    React.useEffect(() => {
        if (userLocation && !address) {
            setAddress(userLocation.street || userLocation.fullAddress || '');
            setWard(userLocation.ward || '');
            setDistrict(userLocation.district || '');
            setCity(userLocation.city || 'TP. Hồ Chí Minh');
        }
    }, [userLocation]);

    const urgencyOptions = [
        { value: 'low', label: 'Thấp', color: '#3374f6ff', icon: 'time-outline' },
        { value: 'medium', label: 'Trung bình', color: '#28e748ff', icon: 'timer-outline' },
        { value: 'high', label: 'Cao', color: '#f7a72fff', icon: 'alert-circle-outline' },
        { value: 'emergency', label: 'Khẩn cấp', color: '#D32F2F', icon: 'warning-outline' },
    ];

    const pickImages = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => asset.uri);
                setImages([...images, ...newImages]);
            }
        } catch (error) {
            console.error('Pick image error:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    const takePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                setImages([...images, result.assets[0].uri]);
            }
        } catch (error) {
            console.error('Take photo error:', error);
            Alert.alert('Lỗi', 'Không thể chụp ảnh');
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleCreateJob = async () => {
        // Validation
        if (!description.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập mô tả vấn đề');
            return;
        }

        if (!address.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ');
            return;
        }

        try {
            setLoading(true);

            // Upload images lên Cloudinary
            let photoUrls = [];
            if (images.length > 0) {
                photoUrls = await uploadMultipleImages(images);
            }

            // Tạo job data
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
            
            const jobData = {
                customerId: user.id, // AuthContext lưu userId vào field 'id'
                categoryId: categoryId,
                title: serviceName || categoryName || 'Yêu cầu sửa chữa',
                description: description.trim(),
                photoUrls: photoUrls,
                address: address.trim(),
                ward: ward.trim() || 'Phường 1',
                district: district.trim() || 'Quận 1',
                city: city.trim(),
                latitude: userLocation?.latitude || 10.7285, // Lấy từ GPS nếu có
                longitude: userLocation?.longitude || 106.7214, // Fallback TP.HCM
                urgency: urgency,
                estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : 500000,
                preferredDate: now.toISOString().split('T')[0], // YYYY-MM-DD (hôm nay)
                preferredTimeStart: currentTime, // Giờ hiện tại
                preferredTimeEnd: "18:00:00",
            };

            console.log('📍 Creating job with location:', {
                source: userLocation ? 'GPS' : 'Default (HCM)',
                latitude: jobData.latitude,
                longitude: jobData.longitude,
                address: jobData.address,
            });

            console.log('Sending job data:', jobData);

            // Gọi API tạo job
            const response = await createJob(jobData);
            
            Alert.alert(
                'Thành công',
                'Tạo yêu cầu sửa chữa thành công!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate đến màn hình xem job hoặc danh sách thợ
                            navigation.navigate('TechnicianList', {
                                jobId: response.jobId,
                                categoryName: categoryName,
                            });
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Create job error:', error);
            Alert.alert('Lỗi', 'Không thể tạo yêu cầu. Vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    // Thêm check để tránh lỗi khi chưa có user
    if (!user) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tạo Yêu Cầu Sửa Chữa</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={{ marginTop: 16, color: '#666' }}>Đang tải...</Text>
                </View>
            </View>
        );
    }

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
                <Text style={styles.headerTitle}>Tạo Yêu Cầu Sửa Chữa</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Category */}
                <View style={styles.section}>
                    <Text style={styles.label}>Dịch vụ</Text>
                    <View style={styles.categoryBox}>
                        <Ionicons name="construct" size={20} color="#2196F3" />
                        <Text style={styles.categoryText}>{categoryName || 'Chưa chọn'}</Text>
                    </View>
                    {serviceName && (
                        <View style={[styles.categoryBox, { marginTop: 8, backgroundColor: '#F5F5F5' }]}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={[styles.categoryText, { color: '#666' }]}>{serviceName}</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.label}>Mô tả vấn đề *</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Mô tả chi tiết vấn đề cần sửa chữa..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                    />
                </View>

                {/* Photos */}
                <View style={styles.section}>
                    <Text style={styles.label}>Hình ảnh</Text>
                    <View style={styles.photoContainer}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.photoItem}>
                                <Image source={{ uri }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.removePhoto}
                                    onPress={() => removeImage(index)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#F44336" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
                            <Ionicons name="images-outline" size={32} color="#2196F3" />
                            <Text style={styles.addPhotoText}>Thêm ảnh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addPhotoBtn} onPress={takePhoto}>
                            <Ionicons name="camera-outline" size={32} color="#2196F3" />
                            <Text style={styles.addPhotoText}>Chụp ảnh</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Urgency */}
                <View style={styles.section}>
                    <Text style={styles.label}>Mức độ khẩn cấp</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.urgencyScrollContent}
                    >
                        {urgencyOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.urgencyBtn,
                                    urgency === option.value && {
                                        borderColor: option.color,
                                        backgroundColor: option.color + '15',
                                    },
                                ]}
                                onPress={() => setUrgency(option.value)}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={24}
                                    color={urgency === option.value ? option.color : '#666'}
                                />
                                <Text
                                    style={[
                                        styles.urgencyText,
                                        urgency === option.value && { color: option.color, fontWeight: 'bold' },
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Address */}
                <View style={styles.section}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Địa chỉ *</Text>
                        {authContext?.refreshLocation && (
                            <TouchableOpacity 
                                style={styles.refreshLocationBtn}
                                onPress={async () => {
                                    try {
                                        await authContext.refreshLocation();
                                        Alert.alert('Thành công', 'Đã cập nhật vị trí của bạn');
                                    } catch (error) {
                                        Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
                                    }
                                }}
                            >
                                <Ionicons name="location" size={18} color="#2196F3" />
                                <Text style={styles.refreshLocationText}>Dùng vị trí hiện tại</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Số nhà, tên đường..."
                        value={address}
                        onChangeText={setAddress}
                    />
                    <View style={styles.addressRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 8 }]}
                            placeholder="Phường/Xã"
                            value={ward}
                            onChangeText={setWard}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Quận/Huyện"
                            value={district}
                            onChangeText={setDistrict}
                        />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Thành phố"
                        value={city}
                        onChangeText={setCity}
                    />
                </View>

                {/* Budget */}
                <View style={styles.section}>
                    <Text style={styles.label}>Ngân sách dự kiến (VNĐ)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ví dụ: 500000"
                        value={estimatedBudget}
                        onChangeText={setEstimatedBudget}
                        keyboardType="numeric"
                    />
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleCreateJob}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color="#fff" />
                            <Text style={styles.submitBtnText}>Tạo Yêu Cầu</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
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
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    refreshLocationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#E3F2FD',
    },
    refreshLocationText: {
        fontSize: 13,
        color: '#2196F3',
        fontWeight: '500',
    },
    categoryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        gap: 12,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2196F3',
    },
    textArea: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 120,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 12,
    },
    addressRow: {
        flexDirection: 'row',
    },
    photoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    photoItem: {
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
    },
    addPhotoBtn: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2196F3',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3F2FD',
    },
    addPhotoText: {
        fontSize: 12,
        color: '#2196F3',
        marginTop: 4,
    },
    urgencyContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    urgencyScrollContent: {
        paddingVertical: 4,
        gap: 12,
    },
    urgencyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
        gap: 8,
        // minWidth: 140,
    },
    urgencyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default CreateJobScreen;
