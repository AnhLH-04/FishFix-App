import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import workerService from '../../services/workerService';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../../services/uploadService';

export default function WorkerProfileSetupScreen({ navigation }) {
    const { user, login, userRole } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [bio, setBio] = useState('');
    const [workingRadiusKm, setWorkingRadiusKm] = useState('10');
    const [hourlyRate, setHourlyRate] = useState('');
    const [idCardNumber, setIdCardNumber] = useState('');
    const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
    const [idCardBackUrl, setIdCardBackUrl] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');
    const [bankAccountNumber, setBankAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');
    
    // Image URIs for preview
    const [frontImageUri, setFrontImageUri] = useState(null);
    const [backImageUri, setBackImageUri] = useState(null);
    
    const pickImage = async (type) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            
            try {
                Alert.alert('Đang tải ảnh lên...', 'Vui lòng đợi');
                const uploadedUrl = await uploadImageToCloudinary(uri);
                
                if (type === 'front') {
                    setFrontImageUri(uri);
                    setIdCardFrontUrl(uploadedUrl);
                } else {
                    setBackImageUri(uri);
                    setIdCardBackUrl(uploadedUrl);
                }
                
                Alert.alert('Thành công', 'Ảnh đã được tải lên');
            } catch (error) {
                console.error('Upload error:', error);
                Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
            }
        }
    };

    const handleSubmit = async () => {
        // Validate
        if (!bio || !hourlyRate || !idCardNumber || !bankAccountName || !bankAccountNumber || !bankName) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setLoading(true);
        try {
            const profileData = {
                userId: user.id,
                bio,
                workingRadiusKm: parseInt(workingRadiusKm) || 10,
                hourlyRate: parseInt(hourlyRate),
                idCardNumber,
                idCardFrontUrl,
                idCardBackUrl,
                bankAccountName,
                bankAccountNumber,
                bankName,
            };

            const response = await workerService.createWorkerProfile(profileData);
            
            // Cập nhật user context với workerId
            const updatedUser = {
                ...user,
                workerId: response.workerId,
            };
            login(updatedUser, userRole);
            
            Alert.alert('Thành công', 'Hồ sơ thợ đã được tạo!', [
                {
                    text: 'OK',
                    onPress: () => navigation.replace('TechnicianHome'),
                }
            ]);
        } catch (error) {
            console.error('Create worker profile error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tạo hồ sơ thợ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thiết lập hồ sơ thợ</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={24} color="#2196F3" />
                    <Text style={styles.infoText}>
                        Điền đầy đủ thông tin để hoàn tất hồ sơ và bắt đầu nhận việc.
                    </Text>
                </View>

                {/* Bio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Giới thiệu bản thân *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="VD: Thợ điện lạnh với 5 năm kinh nghiệm..."
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Working Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin làm việc</Text>
                    
                    <Text style={styles.label}>Bán kính làm việc (km) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="10"
                        value={workingRadiusKm}
                        onChangeText={setWorkingRadiusKm}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Giá theo giờ (VNĐ) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="150000"
                        value={hourlyRate}
                        onChangeText={setHourlyRate}
                        keyboardType="numeric"
                    />
                </View>

                {/* ID Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chứng minh thư / CCCD *</Text>
                    
                    <Text style={styles.label}>Số CMND/CCCD *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="001234567890"
                        value={idCardNumber}
                        onChangeText={setIdCardNumber}
                        keyboardType="numeric"
                    />

                    <View style={styles.imageRow}>
                        <View style={styles.imageContainer}>
                            <Text style={styles.label}>Mặt trước</Text>
                            <TouchableOpacity 
                                style={styles.imageButton} 
                                onPress={() => pickImage('front')}
                            >
                                {frontImageUri ? (
                                    <Image source={{ uri: frontImageUri }} style={styles.previewImage} />
                                ) : (
                                    <>
                                        <Ionicons name="camera-outline" size={32} color="#999" />
                                        <Text style={styles.imageButtonText}>Chọn ảnh</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.imageContainer}>
                            <Text style={styles.label}>Mặt sau</Text>
                            <TouchableOpacity 
                                style={styles.imageButton} 
                                onPress={() => pickImage('back')}
                            >
                                {backImageUri ? (
                                    <Image source={{ uri: backImageUri }} style={styles.previewImage} />
                                ) : (
                                    <>
                                        <Ionicons name="camera-outline" size={32} color="#999" />
                                        <Text style={styles.imageButtonText}>Chọn ảnh</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Bank Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin ngân hàng *</Text>
                    
                    <Text style={styles.label}>Tên chủ tài khoản *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="NGUYEN VAN A"
                        value={bankAccountName}
                        onChangeText={setBankAccountName}
                    />

                    <Text style={styles.label}>Số tài khoản *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0123456789"
                        value={bankAccountNumber}
                        onChangeText={setBankAccountNumber}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Tên ngân hàng *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="VD: Vietcombank, Techcombank..."
                        value={bankName}
                        onChangeText={setBankName}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.submitButtonText}>Hoàn tất & Bắt đầu</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    infoBanner: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 15,
        margin: 15,
        borderRadius: 10,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1976D2',
        lineHeight: 20,
    },
    section: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: '#FAFAFA',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    imageRow: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 10,
    },
    imageContainer: {
        flex: 1,
    },
    imageButton: {
        height: 120,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    imageButtonText: {
        marginTop: 8,
        fontSize: 12,
        color: '#999',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    submitButton: {
        backgroundColor: '#FF6B35',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        margin: 15,
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#CCC',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
