import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import workerService from '../../services/workerService';
import { uploadImageToCloudinary } from '../../services/uploadService';

export default function EditProfileScreen({ navigation, route }) {
    const { user } = useAuth();
    const { workerId } = route.params;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form data
    const [bio, setBio] = useState('');
    const [workingRadiusKm, setWorkingRadiusKm] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [idCardNumber, setIdCardNumber] = useState('');
    const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
    const [idCardBackUrl, setIdCardBackUrl] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');
    const [bankAccountNumber, setBankAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');

    useEffect(() => {
        loadWorkerProfile();
    }, []);

    const loadWorkerProfile = async () => {
        try {
            setLoading(true);
            const profile = await workerService.getWorkerById(workerId);
            
            if (profile) {
                setBio(profile.bio || '');
                setWorkingRadiusKm(profile.workingRadiusKm?.toString() || '');
                setHourlyRate(profile.hourlyRate?.toString() || '');
                setIdCardNumber(profile.idCardNumber || '');
                setIdCardFrontUrl(profile.idCardFrontUrl || '');
                setIdCardBackUrl(profile.idCardBackUrl || '');
                setBankAccountName(profile.bankAccountName || '');
                setBankAccountNumber(profile.bankAccountNumber || '');
                setBankName(profile.bankName || '');
            }
        } catch (error) {
            console.error('Error loading worker profile:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async (type) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri, type);
        }
    };

    const uploadImage = async (uri, type) => {
        try {
            setUploading(true);
            const imageUrl = await uploadImageToCloudinary(uri);
            
            if (type === 'front') {
                setIdCardFrontUrl(imageUrl);
            } else {
                setIdCardBackUrl(imageUrl);
            }
            
            Alert.alert('Thành công', 'Tải ảnh lên thành công!');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Lỗi', 'Không thể tải ảnh lên');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!bio.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập giới thiệu');
            return;
        }

        if (!workingRadiusKm || isNaN(workingRadiusKm) || parseFloat(workingRadiusKm) <= 0) {
            Alert.alert('Thông báo', 'Vui lòng nhập bán kính hoạt động hợp lệ');
            return;
        }

        if (!hourlyRate || isNaN(hourlyRate) || parseFloat(hourlyRate) <= 0) {
            Alert.alert('Thông báo', 'Vui lòng nhập giá theo giờ hợp lệ');
            return;
        }

        if (!idCardNumber.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập số CMND/CCCD');
            return;
        }

        if (!idCardFrontUrl || !idCardBackUrl) {
            Alert.alert('Thông báo', 'Vui lòng tải lên ảnh mặt trước và mặt sau CMND/CCCD');
            return;
        }

        if (!bankAccountName.trim() || !bankAccountNumber.trim() || !bankName.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng');
            return;
        }

        try {
            setSaving(true);

            const profileData = {
                bio: bio.trim(),
                workingRadiusKm: parseFloat(workingRadiusKm),
                hourlyRate: parseFloat(hourlyRate),
                idCardNumber: idCardNumber.trim(),
                idCardFrontUrl,
                idCardBackUrl,
                bankAccountName: bankAccountName.trim(),
                bankAccountNumber: bankAccountNumber.trim(),
                bankName: bankName.trim(),
            };

            await workerService.updateWorkerProfile(workerId, profileData);

            Alert.alert(
                'Thành công',
                'Cập nhật hồ sơ thành công!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>

                {/* Bio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Giới thiệu</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Giới thiệu về bản thân, kinh nghiệm làm việc..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Working Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin làm việc</Text>
                    
                    <Text style={styles.label}>Bán kính hoạt động (km)</Text>
                    <TextInput
                        style={styles.input}
                        value={workingRadiusKm}
                        onChangeText={setWorkingRadiusKm}
                        placeholder="Ví dụ: 10"
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Giá theo giờ (VNĐ)</Text>
                    <TextInput
                        style={styles.input}
                        value={hourlyRate}
                        onChangeText={setHourlyRate}
                        placeholder="Ví dụ: 150000"
                        keyboardType="numeric"
                    />
                </View>

                {/* ID Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CMND/CCCD</Text>
                    
                    <Text style={styles.label}>Số CMND/CCCD</Text>
                    <TextInput
                        style={styles.input}
                        value={idCardNumber}
                        onChangeText={setIdCardNumber}
                        placeholder="Nhập số CMND/CCCD"
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Ảnh mặt trước</Text>
                    <TouchableOpacity
                        style={styles.imageButton}
                        onPress={() => pickImage('front')}
                        disabled={uploading}
                    >
                        {idCardFrontUrl ? (
                            <Image source={{ uri: idCardFrontUrl }} style={styles.imagePreview} />
                        ) : (
                            <Text style={styles.imageButtonText}>Chọn ảnh mặt trước</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.label}>Ảnh mặt sau</Text>
                    <TouchableOpacity
                        style={styles.imageButton}
                        onPress={() => pickImage('back')}
                        disabled={uploading}
                    >
                        {idCardBackUrl ? (
                            <Image source={{ uri: idCardBackUrl }} style={styles.imagePreview} />
                        ) : (
                            <Text style={styles.imageButtonText}>Chọn ảnh mặt sau</Text>
                        )}
                    </TouchableOpacity>

                    {uploading && (
                        <View style={styles.uploadingContainer}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={styles.uploadingText}>Đang tải ảnh lên...</Text>
                        </View>
                    )}
                </View>

                {/* Bank Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin ngân hàng</Text>
                    
                    <Text style={styles.label}>Tên chủ tài khoản</Text>
                    <TextInput
                        style={styles.input}
                        value={bankAccountName}
                        onChangeText={setBankAccountName}
                        placeholder="Nhập tên chủ tài khoản"
                    />

                    <Text style={styles.label}>Số tài khoản</Text>
                    <TextInput
                        style={styles.input}
                        value={bankAccountNumber}
                        onChangeText={setBankAccountNumber}
                        placeholder="Nhập số tài khoản"
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Tên ngân hàng</Text>
                    <TextInput
                        style={styles.input}
                        value={bankName}
                        onChangeText={setBankName}
                        placeholder="Ví dụ: Vietcombank, Techcombank..."
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, (saving || uploading) && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving || uploading}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingTop: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 10,
        color: '#666',
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFF',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    imageButton: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9F9F9',
        minHeight: 120,
    },
    imageButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
    imagePreview: {
        width: '100%',
        height: 120,
        borderRadius: 8,
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        padding: 10,
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
    },
    uploadingText: {
        marginLeft: 10,
        color: '#007AFF',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#CCC',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 30,
    },
});
