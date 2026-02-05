import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { analyzeImage, analyzeText } from '../../services/aiService';

const AIDiagnosisScreen = ({ navigation }) => {
    const [inputMode, setInputMode] = useState('text'); // 'text' or 'image'
    const [textDescription, setTextDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [diagnosis, setDiagnosis] = useState(null);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Quyền truy cập',
                'Ứng dụng cần quyền truy cập thư viện ảnh để hoạt động.'
            );
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setDiagnosis(null);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Quyền truy cập',
                'Ứng dụng cần quyền truy cập camera để hoạt động.'
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setDiagnosis(null);
        }
    };

    const handleAnalyze = async () => {
        if (inputMode === 'text') {
            if (!textDescription.trim()) {
                Alert.alert('Thông báo', 'Vui lòng mô tả sự cố để phân tích');
                return;
            }
            setIsAnalyzing(true);
            try {
                const result = await analyzeText(textDescription);
                setDiagnosis(result);
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể phân tích. Vui lòng thử lại.');
            } finally {
                setIsAnalyzing(false);
            }
        } else {
            if (!selectedImage) {
                Alert.alert('Thông báo', 'Vui lòng chọn ảnh để phân tích');
                return;
            }
            setIsAnalyzing(true);
            try {
                const result = await analyzeImage(selectedImage);
                setDiagnosis(result);
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể phân tích ảnh. Vui lòng thử lại.');
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    const handleBookTechnician = () => {
        if (diagnosis) {
            navigation.navigate('TechnicianList', {
                category: diagnosis.category,
                problem: diagnosis.problem,
            });
        }
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
                <Text style={styles.headerTitle}>AI Chẩn Đoán Sự Cố</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Info Card - Fixed at top */}
            <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={24} color="#1E88E5" />
                <Text style={styles.infoText}>
                    Mô tả sự cố hoặc tải ảnh, AI sẽ phân tích và gợi ý giải pháp cho bạn
                </Text>
            </View>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
                <TouchableOpacity
                    style={[styles.modeTab, inputMode === 'text' && styles.modeTabActive]}
                    onPress={() => {
                        setInputMode('text');
                        setDiagnosis(null);
                    }}
                >
                    <Ionicons
                        name="create-outline"
                        size={20}
                        color={inputMode === 'text' ? '#fff' : '#1E88E5'}
                    />
                    <Text style={[styles.modeTabText, inputMode === 'text' && styles.modeTabTextActive]}>
                        Mô Tả Text
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeTab, inputMode === 'image' && styles.modeTabActive]}
                    onPress={() => {
                        setInputMode('image');
                        setDiagnosis(null);
                    }}
                >
                    <Ionicons
                        name="camera-outline"
                        size={20}
                        color={inputMode === 'image' ? '#fff' : '#1E88E5'}
                    />
                    <Text style={[styles.modeTabText, inputMode === 'image' && styles.modeTabTextActive]}>
                        Hình Ảnh
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent}>
                {/* Text Input Mode */}
                {inputMode === 'text' && (
                    <View style={styles.textInputSection}>
                        <Text style={styles.textInputLabel}>Mô tả sự cố của bạn:</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ví dụ: Máy giặt của tôi không quay được, khi bấm nút giặt thì có tiếng kêu nhưng lồng giặt không chuyển động..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={textDescription}
                            onChangeText={setTextDescription}
                        />
                        <View style={styles.textInputHints}>
                            <Text style={styles.hintText}>💡 Gợi ý: Mô tả chi tiết giúp AI phân tích chính xác hơn</Text>
                            <Text style={styles.hintText}>• Loại thiết bị (máy giặt, điều hòa, tủ lạnh...)</Text>
                            <Text style={styles.hintText}>• Triệu chứng cụ thể (không hoạt động, kêu ồn, rò nước...)</Text>
                        </View>
                    </View>
                )}

                {/* Image Selection Mode */}
                {inputMode === 'image' && (
                    <>
                        <View style={styles.imageSection}>
                            {selectedImage ? (
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: selectedImage }} style={styles.image} />
                                    <TouchableOpacity
                                        style={styles.removeImageBtn}
                                        onPress={() => {
                                            setSelectedImage(null);
                                            setDiagnosis(null);
                                        }}
                                    >
                                        <Ionicons name="close-circle" size={30} color="#EF5350" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.placeholderContainer}>
                                    <Ionicons name="image-outline" size={80} color="#ccc" />
                                    <Text style={styles.placeholderText}>
                                        Chưa có ảnh nào được chọn
                                    </Text>
                                    <Text style={styles.placeholderSubText}>
                                        (Chức năng này sẽ được cập nhật sau)
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
                                <Ionicons name="camera" size={24} color="#fff" />
                                <Text style={styles.actionBtnText}>Chụp Ảnh</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
                                <Ionicons name="images" size={24} color="#fff" />
                                <Text style={styles.actionBtnText}>Chọn Từ Thư Viện</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Analyze Button */}
                <TouchableOpacity
                    style={[
                        styles.analyzeButton,
                        ((inputMode === 'text' && !textDescription.trim()) ||
                            (inputMode === 'image' && !selectedImage) ||
                            isAnalyzing) && styles.analyzeButtonDisabled,
                    ]}
                    onPress={handleAnalyze}
                    disabled={(inputMode === 'text' && !textDescription.trim()) ||
                        (inputMode === 'image' && !selectedImage) ||
                        isAnalyzing}
                >
                    {isAnalyzing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="analytics" size={24} color="#fff" />
                            <Text style={styles.analyzeButtonText}>Phân Tích Ngay</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Diagnosis Results */}
                {diagnosis && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>📋 Kết Quả Phân Tích</Text>

                        <View style={styles.resultCard}>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Loại Thiết Bị:</Text>
                                <Text style={styles.resultValue}>{diagnosis.category}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Vấn Đề:</Text>
                                <Text style={styles.resultValue}>{diagnosis.problem}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Mức Độ:</Text>
                                <View
                                    style={[
                                        styles.severityBadge,
                                        {
                                            backgroundColor:
                                                diagnosis.severity === 'Cao'
                                                    ? '#EF5350'
                                                    : diagnosis.severity === 'Trung Bình'
                                                        ? '#FFA726'
                                                        : '#66BB6A',
                                        },
                                    ]}
                                >
                                    <Text style={styles.severityText}>{diagnosis.severity}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.solutionCard}>
                            <Text style={styles.solutionTitle}>💡 Giải Pháp Đề Xuất</Text>
                            <Text style={styles.solutionText}>{diagnosis.solution}</Text>
                        </View>

                        <View style={styles.costCard}>
                            <Text style={styles.costLabel}>Chi Phí Ước Tính:</Text>
                            <View style={styles.costValueContainer}>
                                <Text style={[
                                    styles.costValue,
                                    diagnosis.estimatedCost.length > 30 && styles.costValueSmall
                                ]}>
                                    {diagnosis.estimatedCost.includes('(')
                                        ? diagnosis.estimatedCost.split('(')[0].trim()
                                        : diagnosis.estimatedCost}
                                </Text>
                                {diagnosis.estimatedCost.includes('(') && (
                                    <Text style={styles.costNote}>
                                        ({diagnosis.estimatedCost.split('(')[1]}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Recommended Technicians */}
                        <View style={styles.technicianPreview}>
                            <Text style={styles.technicianPreviewTitle}>
                                🔧 Thợ Gợi Ý Cho Bạn
                            </Text>
                            {diagnosis.recommendedTechnicians.map((tech, index) => (
                                <View key={index} style={styles.techCard}>
                                    <View style={styles.techInfo}>
                                        <Text style={styles.techName}>{tech.name}</Text>
                                        <View style={styles.techRating}>
                                            <Ionicons name="star" size={14} color="#FFD700" />
                                            <Text style={styles.techRatingText}>{tech.rating}</Text>
                                            <Text style={styles.techJobs}>({tech.jobs} công việc)</Text>
                                        </View>
                                        <Text style={styles.techSpecialty}>{tech.specialty}</Text>
                                    </View>
                                    <Text style={styles.techPrice}>{tech.price}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.bookButton}
                            onPress={handleBookTechnician}
                        >
                            <Text style={styles.bookButtonText}>Đặt Lịch Ngay</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
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
    infoCard: {
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
        fontSize: 14,
        color: '#1976D2',
        lineHeight: 20,
    },
    modeToggle: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 4,
    },
    modeTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        gap: 8,
    },
    modeTabActive: {
        backgroundColor: '#1E88E5',
    },
    modeTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E88E5',
    },
    modeTabTextActive: {
        color: '#fff',
    },
    textInputSection: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    textInputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    textInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 16,
        fontSize: 14,
        color: '#333',
        minHeight: 140,
        lineHeight: 22,
    },
    textInputHints: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#FFF9E6',
        borderRadius: 8,
    },
    hintText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
    },
    placeholderSubText: {
        marginTop: 8,
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    imageSection: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 16,
    },
    removeImageBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    placeholderContainer: {
        height: 300,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#1E88E5',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    analyzeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#1E88E5',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        elevation: 3,
        marginBottom: 20,
    },
    analyzeButtonDisabled: {
        backgroundColor: '#ccc',
    },
    analyzeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultsContainer: {
        padding: 20,
    },
    resultsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    resultCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    resultLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    resultValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    severityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    severityText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    solutionCard: {
        backgroundColor: '#FFF9E6',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    solutionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFA726',
        marginBottom: 8,
    },
    solutionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    costCard: {
        backgroundColor: '#E8F5E9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    costLabel: {
        fontSize: 14,
        color: '#2E7D32',
        fontWeight: '500',
        marginBottom: 8,
    },
    costValueContainer: {
        flexDirection: 'column',
    },
    costValue: {
        fontSize: 18,
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    costValueSmall: {
        fontSize: 15,
    },
    costNote: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 6,
        fontStyle: 'italic',
        lineHeight: 18,
    },
    technicianPreview: {
        marginBottom: 16,
    },
    technicianPreviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    techCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 1,
    },
    techInfo: {
        flex: 1,
    },
    techName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    techRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    techRatingText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    techJobs: {
        fontSize: 12,
        color: '#999',
    },
    techSpecialty: {
        fontSize: 12,
        color: '#666',
    },
    techPrice: {
        fontSize: 14,
        color: '#1E88E5',
        fontWeight: 'bold',
    },
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 12,
        elevation: 3,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AIDiagnosisScreen;
