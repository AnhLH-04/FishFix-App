import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    Image,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import workerService from '../../services/workerService';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../../services/uploadService';

export default function ManageCertificationsScreen({ navigation, route }) {
    const { workerId } = route.params || {};
    
    // Debug log
    console.log('ManageCertificationsScreen - workerId:', workerId);
    console.log('ManageCertificationsScreen - route.params:', route.params);
    
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);
    
    // Form states
    const [certName, setCertName] = useState('');
    const [certNumber, setCertNumber] = useState('');
    const [issuedBy, setIssuedBy] = useState('');
    const [issuedDate, setIssuedDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
    const [imageUri, setImageUri] = useState(null);

    useEffect(() => {
        loadCertifications();
    }, []);

    const loadCertifications = async () => {
        if (!workerId) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin Worker ID');
            return;
        }

        setLoading(true);
        try {
            const certs = await workerService.getWorkerCertifications(workerId);
            setCertifications(certs || []);
        } catch (error) {
            console.error('Load certifications error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách chứng chỉ');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            
            // Upload ảnh lên Cloudinary
            try {
                Alert.alert('Đang tải ảnh lên...', 'Vui lòng đợi');
                const uploadedUrl = await uploadImageToCloudinary(result.assets[0].uri);
                setDocumentUrl(uploadedUrl);
                Alert.alert('Thành công', 'Ảnh đã được tải lên');
            } catch (error) {
                console.error('Upload error:', error);
                Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
                setImageUri(null);
            }
        }
    };

    const handleAddCertification = async () => {
        if (!certName || !certNumber || !issuedBy || !issuedDate) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            await workerService.addWorkerCertification(workerId, {
                certName,
                certNumber,
                issuedBy,
                issuedDate,
                expiryDate: expiryDate || null,
                documentUrl: documentUrl || '',
            });

            Alert.alert('Thành công', 'Đã thêm chứng chỉ mới');
            resetForm();
            setModalVisible(false);
            loadCertifications();
        } catch (error) {
            console.error('Add certification error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể thêm chứng chỉ');
        }
    };

    const handleDeleteCertification = async (certId) => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc muốn xóa chứng chỉ này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await workerService.deleteCertification(certId);
                            Alert.alert('Thành công', 'Đã xóa chứng chỉ');
                            loadCertifications();
                        } catch (error) {
                            console.error('Delete certification error:', error);
                            Alert.alert('Lỗi', 'Không thể xóa chứng chỉ');
                        }
                    },
                },
            ]
        );
    };

    const resetForm = () => {
        setCertName('');
        setCertNumber('');
        setIssuedBy('');
        setIssuedDate('');
        setExpiryDate('');
        setDocumentUrl('');
        setImageUri(null);
        setEditMode(false);
        setSelectedCert(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified':
                return '#4CAF50';
            case 'pending':
                return '#FF9800';
            case 'rejected':
                return '#F44336';
            default:
                return '#999';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'verified':
                return 'Đã xác minh';
            case 'pending':
                return 'Chờ xác minh';
            case 'rejected':
                return 'Từ chối';
            default:
                return 'Chưa xác minh';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Quản lý Chứng chỉ</Text>
                    {workerId && <Text style={styles.headerSubtitle}>ID: {workerId}</Text>}
                </View>
                <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color="#FF6B35" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={24} color="#2196F3" />
                    <Text style={styles.infoText}>
                        Thêm chứng chỉ nghề nghiệp để tăng uy tín. Admin sẽ xác minh trong 24-48h.
                    </Text>
                </View>

                {/* Certifications List */}
                {certifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Chưa có chứng chỉ nào</Text>
                        <Text style={styles.emptySubtext}>Thêm chứng chỉ để tăng độ tin cậy</Text>
                    </View>
                ) : (
                    certifications.map((cert, index) => (
                        <View key={cert.certId || index} style={styles.certCard}>
                            <View style={styles.certHeader}>
                                <View style={styles.certInfo}>
                                    <Text style={styles.certName}>{cert.certName}</Text>
                                    <Text style={styles.certNumber}>Số: {cert.certNumber}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDeleteCertification(cert.certId)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.certDetails}>
                                <View style={styles.certRow}>
                                    <Ionicons name="business-outline" size={16} color="#666" />
                                    <Text style={styles.certDetailText}>{cert.issuedBy}</Text>
                                </View>
                                <View style={styles.certRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#666" />
                                    <Text style={styles.certDetailText}>
                                        Cấp: {cert.issuedDate}
                                        {cert.expiryDate && ` - Hết hạn: ${cert.expiryDate}`}
                                    </Text>
                                </View>
                            </View>

                            {/* Status Badge */}
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cert.status) + '20' }]}>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(cert.status) }]} />
                                <Text style={[styles.statusText, { color: getStatusColor(cert.status) }]}>
                                    {getStatusText(cert.status)}
                                </Text>
                            </View>

                            {/* Document Image */}
                            {cert.documentUrl && (
                                <TouchableOpacity
                                    style={styles.documentPreview}
                                    onPress={() => {
                                        setSelectedCert(cert);
                                    }}
                                >
                                    <Image source={{ uri: cert.documentUrl }} style={styles.documentImage} />
                                    <View style={styles.viewOverlay}>
                                        <Ionicons name="eye" size={24} color="#fff" />
                                        <Text style={styles.viewText}>Xem ảnh</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add Certification Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thêm Chứng chỉ</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tên chứng chỉ *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="VD: Chứng chỉ Điện lạnh"
                                    value={certName}
                                    onChangeText={setCertName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Số chứng chỉ *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="VD: DL-2024-001"
                                    value={certNumber}
                                    onChangeText={setCertNumber}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tổ chức cấp *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="VD: Bộ Công Thương"
                                    value={issuedBy}
                                    onChangeText={setIssuedBy}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Ngày cấp (YYYY-MM-DD) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="2024-01-15"
                                    value={issuedDate}
                                    onChangeText={setIssuedDate}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Ngày hết hạn (YYYY-MM-DD)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="2029-01-15 (để trống nếu vô thời hạn)"
                                    value={expiryDate}
                                    onChangeText={setExpiryDate}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Ảnh chứng chỉ</Text>
                                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                                    <Ionicons name="cloud-upload-outline" size={24} color="#FF6B35" />
                                    <Text style={styles.uploadText}>
                                        {imageUri ? 'Đã chọn ảnh' : 'Tải lên ảnh chứng chỉ'}
                                    </Text>
                                </TouchableOpacity>
                                {imageUri && (
                                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                                )}
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleAddCertification}>
                                <Text style={styles.submitButtonText}>Thêm Chứng chỉ</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    addButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    infoBanner: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1976D2',
        lineHeight: 18,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 5,
    },
    certCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    certHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    certInfo: {
        flex: 1,
    },
    certName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    certNumber: {
        fontSize: 13,
        color: '#666',
    },
    deleteButton: {
        padding: 5,
    },
    certDetails: {
        marginTop: 10,
        gap: 8,
    },
    certRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    certDetailText: {
        fontSize: 13,
        color: '#666',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 12,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    documentPreview: {
        marginTop: 15,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    documentImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    viewOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 5,
    },
    viewText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalForm: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#333',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF3E0',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FF6B35',
        borderStyle: 'dashed',
        gap: 10,
    },
    uploadText: {
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '500',
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginTop: 10,
    },
    submitButton: {
        backgroundColor: '#FF6B35',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
