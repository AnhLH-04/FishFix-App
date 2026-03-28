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
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import workerService from '../../services/workerService';

export default function ManageSkillsScreen({ navigation, route }) {
    const { workerId } = route.params || {};
    
    // Debug log
    console.log('ManageSkillsScreen - workerId:', workerId);
    console.log('ManageSkillsScreen - route.params:', route.params);
    
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Form states
    const [categoryId, setCategoryId] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState('');
    const [isPrimarySkill, setIsPrimarySkill] = useState(false);

    // Danh sách categories mẫu (nên lấy từ API)
    const categories = [
        { id: 1, name: 'Máy lạnh', icon: 'snow' },
        { id: 2, name: 'Tủ lạnh', icon: 'cube' },
        { id: 3, name: 'Máy giặt', icon: 'water' },
        { id: 4, name: 'Điện dân dụng', icon: 'flash' },
        { id: 5, name: 'Điện tử', icon: 'hardware-chip' },
        { id: 6, name: 'Sửa ống nước', icon: 'water-outline' },
        { id: 8, name: 'Sơn tường', icon: 'color-palette' },
        { id: 10, name: 'Lắp đặt điện', icon: 'bulb' },
    ];

    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        if (!workerId) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin Worker ID');
            return;
        }

        setLoading(true);
        try {
            const profile = await workerService.getWorkerProfile(workerId);
            setSkills(profile.skills || []);
        } catch (error) {
            console.error('Load skills error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách kỹ năng');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async () => {
        if (!categoryId || !yearsOfExperience) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            await workerService.addWorkerSkill(workerId, {
                categoryId: parseInt(categoryId),
                yearsOfExperience: parseInt(yearsOfExperience),
                isPrimarySkill,
            });

            Alert.alert('Thành công', 'Đã thêm kỹ năng mới');
            resetForm();
            setModalVisible(false);
            loadSkills();
        } catch (error) {
            console.error('Add skill error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể thêm kỹ năng');
        }
    };

    const resetForm = () => {
        setCategoryId('');
        setYearsOfExperience('');
        setIsPrimarySkill(false);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const getCategoryName = (catId) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.name : 'Khác';
    };

    const getCategoryIcon = (catId) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.icon : 'construct';
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
                <Text style={styles.headerTitle}>Quản lý Kỹ năng</Text>
                <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color="#FF6B35" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={24} color="#2196F3" />
                    <Text style={styles.infoText}>
                        Thêm kỹ năng và năm kinh nghiệm để khách hàng dễ dàng tìm thấy bạn.
                    </Text>
                </View>

                {/* Skills List */}
                {skills.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="construct-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Chưa có kỹ năng nào</Text>
                        <Text style={styles.emptySubtext}>Thêm kỹ năng để tăng cơ hội nhận việc</Text>
                    </View>
                ) : (
                    <View style={styles.skillsGrid}>
                        {skills.map((skill, index) => (
                            <View key={skill.skillId || index} style={styles.skillCard}>
                                {skill.isPrimarySkill && (
                                    <View style={styles.primaryBadge}>
                                        <Ionicons name="star" size={12} color="#FFD700" />
                                        <Text style={styles.primaryText}>Chính</Text>
                                    </View>
                                )}
                                
                                <View style={[styles.skillIcon, { backgroundColor: '#FF6B35' + '20' }]}>
                                    <Ionicons 
                                        name={getCategoryIcon(skill.categoryId)} 
                                        size={32} 
                                        color="#FF6B35" 
                                    />
                                </View>
                                
                                <Text style={styles.skillName}>{getCategoryName(skill.categoryId)}</Text>
                                
                                <View style={styles.experienceBadge}>
                                    <Ionicons name="time-outline" size={14} color="#666" />
                                    <Text style={styles.experienceText}>
                                        {skill.yearsOfExperience} năm
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Add Skill Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thêm Kỹ năng</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Chọn kỹ năng *</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.categoryButton,
                                                categoryId === cat.id.toString() && styles.categoryButtonActive
                                            ]}
                                            onPress={() => setCategoryId(cat.id.toString())}
                                        >
                                            <Ionicons 
                                                name={cat.icon} 
                                                size={24} 
                                                color={categoryId === cat.id.toString() ? '#FF6B35' : '#666'} 
                                            />
                                            <Text style={[
                                                styles.categoryButtonText,
                                                categoryId === cat.id.toString() && styles.categoryButtonTextActive
                                            ]}>
                                                {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Số năm kinh nghiệm *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="VD: 5"
                                    value={yearsOfExperience}
                                    onChangeText={setYearsOfExperience}
                                    keyboardType="number-pad"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setIsPrimarySkill(!isPrimarySkill)}
                            >
                                <View style={[styles.checkbox, isPrimarySkill && styles.checkboxChecked]}>
                                    {isPrimarySkill && <Ionicons name="checkmark" size={18} color="white" />}
                                </View>
                                <Text style={styles.checkboxLabel}>Đây là kỹ năng chính của tôi</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.submitButton} onPress={handleAddSkill}>
                                <Text style={styles.submitButtonText}>Thêm Kỹ năng</Text>
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
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    skillCard: {
        width: '47%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    primaryText: {
        fontSize: 10,
        color: '#F57C00',
        fontWeight: 'bold',
    },
    skillIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    skillName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    experienceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    experienceText: {
        fontSize: 12,
        color: '#666',
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
        maxHeight: '80%',
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
        marginBottom: 12,
    },
    categoryScroll: {
        marginTop: 5,
    },
    categoryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
        marginRight: 10,
        minWidth: 80,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryButtonActive: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF6B35',
    },
    categoryButtonText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        fontWeight: '500',
    },
    categoryButtonTextActive: {
        color: '#FF6B35',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#333',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#FF6B35',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
