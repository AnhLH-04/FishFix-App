import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Image,
    Dimensions,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import workerService from '../../services/workerService';

const { width } = Dimensions.get('window');

export default function TechnicianProfileScreen({ navigation }) {
    const { user, logout, login, userRole } = useAuth();
    const [selectedTab, setSelectedTab] = useState('overview'); // overview, portfolio, services, reviews
    const [selectedCert, setSelectedCert] = useState(null);
    const [certModalVisible, setCertModalVisible] = useState(false);
    const [checkingWorker, setCheckingWorker] = useState(true);
    const [workerProfile, setWorkerProfile] = useState(null);
    const [certifications, setCertifications] = useState([]);
    const [loadingCerts, setLoadingCerts] = useState(false);

    // Danh sách categories để map từ categoryId sang tên
    const skillCategories = {
        1: { name: 'Máy lạnh', icon: 'snow' },
        2: { name: 'Tủ lạnh', icon: 'cube' },
        3: { name: 'Máy giặt', icon: 'water' },
        4: { name: 'Điện dân dụng', icon: 'flash' },
        5: { name: 'Điện tử', icon: 'hardware-chip' },
        6: { name: 'Sửa ống nước', icon: 'water-outline' },
        7: { name: 'Thợ mộc', icon: 'hammer' },
        8: { name: 'Sơn tường', icon: 'color-palette' },
        9: { name: 'Hàn xì', icon: 'flame' },
        10: { name: 'Lắp đặt điện', icon: 'bulb' },
    };

    // Check worker profile on mount
    useEffect(() => {
        checkWorkerProfile();
    }, []);

    const checkWorkerProfile = async () => {
        if (!user?.id) return;
        
        setCheckingWorker(true);
        try {
            const profile = await workerService.getWorkerByUserId(user.id);
            
            if (profile && profile.workerId) {
                setWorkerProfile(profile);
                
                // Có worker profile rồi, lưu workerId vào context
                if (!user.workerId || user.workerId !== profile.workerId) {
                    const updatedUser = {
                        ...user,
                        workerId: profile.workerId,
                    };
                    login(updatedUser, userRole);
                }
                
                // Load certifications
                loadCertifications(profile.workerId);
            }
        } catch (error) {
            console.error('Check worker profile error:', error);
        } finally {
            setCheckingWorker(false);
        }
    };

    const loadCertifications = async (workerId) => {
        if (!workerId) return;
        
        setLoadingCerts(true);
        try {
            const certs = await workerService.getWorkerCertifications(workerId);
            setCertifications(certs || []);
        } catch (error) {
            console.error('Load certifications error:', error);
            setCertifications([]);
        } finally {
            setLoadingCerts(false);
        }
    };

    // Convert skills từ API sang format hiển thị
    const getSkillsDisplay = () => {
        if (!workerProfile?.skills) return [];
        
        return workerProfile.skills.map(skill => {
            const category = skillCategories[skill.categoryId];
            const level = skill.yearsOfExperience >= 7 ? 'Chuyên gia' : 
                         skill.yearsOfExperience >= 4 ? 'Thành thạo' : 'Trung bình';
            
            return {
                name: category?.name || 'Khác',
                icon: category?.icon || 'construct',
                level: level,
                years: skill.yearsOfExperience,
                isPrimary: skill.isPrimarySkill,
            };
        });
    };

    // Format response time
    const getResponseTimeText = (minutes) => {
        if (!minutes || minutes === 0) return '< 15 phút';
        if (minutes < 60) return `< ${minutes} phút`;
        const hours = Math.floor(minutes / 60);
        return `< ${hours} giờ`;
    };

    // Mock data cho demo
    const technicianData = {
        name: user?.fullName || 'Nguyễn Văn An',
        specialization: 'Chuyên gia Điện Lạnh',
        experience: 8,
        rating: 4.9,
        totalJobs: 345,
        responseTime: '< 15 phút',
        completionRate: 98,
        verified: true,
        bio: 'Thợ điện lạnh chuyên nghiệp với hơn 8 năm kinh nghiệm. Chuyên sửa chữa và bảo trì các thiết bị điện lạnh gia đình và thương mại.',
    };

    const skills = [
        { name: 'Máy lạnh', level: 'Chuyên gia', years: 8, icon: 'snow' },
        { name: 'Tủ lạnh', level: 'Chuyên gia', years: 8, icon: 'cube' },
        { name: 'Máy giặt', level: 'Thành thạo', years: 6, icon: 'water' },
        { name: 'Điện dân dụng', level: 'Thành thạo', years: 7, icon: 'flash' },
    ];

    const services = [
        { name: 'Sửa máy lạnh', price: '150,000 - 500,000đ', icon: 'snow', time: '1-2 giờ' },
        { name: 'Vệ sinh máy lạnh', price: '120,000 - 200,000đ', icon: 'brush', time: '30-45 phút' },
        { name: 'Nạp gas máy lạnh', price: '200,000 - 400,000đ', icon: 'flask', time: '1 giờ' },
        { name: 'Sửa tủ lạnh', price: '150,000 - 600,000đ', icon: 'cube', time: '1-3 giờ' },
        { name: 'Sửa máy giặt', price: '120,000 - 450,000đ', icon: 'water', time: '1-2 giờ' },
        { name: 'Bảo trì định kỳ', price: '100,000 - 300,000đ', icon: 'build', time: '30-60 phút' },
    ];

    const portfolio = [
        { id: 1, type: 'Sửa máy lạnh', description: 'Thay block máy lạnh 2HP', before: '❄️', after: '✅' },
        { id: 2, type: 'Vệ sinh máy lạnh', description: 'Vệ sinh máy lạnh inverter', before: '❄️', after: '✅' },
        { id: 3, type: 'Sửa tủ lạnh', description: 'Thay cáp lo tủ lạnh Samsung', before: '🧊', after: '✅' },
        { id: 4, type: 'Sửa máy giặt', description: 'Thay motor máy giặt LG', before: '🌀', after: '✅' },
    ];

    const profileItems = [
        { icon: 'person-outline', label: 'Chỉnh sửa hồ sơ', screen: 'EditProfile' },
        { icon: 'ribbon-outline', label: 'Quản lý Chứng chỉ', screen: 'ManageCertifications' },
        { icon: 'construct-outline', label: 'Quản lý Kỹ năng', screen: 'ManageSkills' },
        { icon: 'card-outline', label: 'Phương thức thanh toán', screen: 'PaymentMethods' },
        { icon: 'stats-chart-outline', label: 'Thống kê chi tiết', screen: 'Statistics' },
        { icon: 'settings-outline', label: 'Cài đặt', screen: 'Settings' },
    ];

    const renderOverview = () => {
        const skills = getSkillsDisplay();
        const primarySkill = skills.find(s => s.isPrimary);
        
        return (
            <View>
                {/* Bio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Giới thiệu</Text>
                    <Text style={styles.bioText}>
                        {workerProfile?.bio || 'Chưa có giới thiệu'}
                    </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thống kê nổi bật</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Ionicons name="briefcase" size={24} color="#FF6B35" />
                            <Text style={styles.statValue}>{workerProfile?.completedJobs || 100}</Text>
                            <Text style={styles.statLabel}>Công việc</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="time" size={24} color="#2196F3" />
                            <Text style={styles.statValue}>
                                {getResponseTimeText(workerProfile?.responseTimeMinutes)}
                            </Text>
                            <Text style={styles.statLabel}>Phản hồi</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="location" size={24} color="#4CAF50" />
                            <Text style={styles.statValue}>{workerProfile?.workingRadiusKm || 0} km</Text>
                            <Text style={styles.statLabel}>Bán kính</Text>
                        </View>
                    </View>
                </View>

                {/* Skills */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kỹ năng chuyên môn</Text>
                    {skills.length > 0 ? (
                        skills.map((skill, index) => (
                            <View key={index} style={styles.skillCard}>
                                <View style={styles.skillIcon}>
                                    <Ionicons name={skill.icon} size={24} color="#FF6B35" />
                                </View>
                                <View style={styles.skillInfo}>
                                    <View style={styles.skillHeader}>
                                        <Text style={styles.skillName}>{skill.name}</Text>
                                        <View style={styles.levelBadge}>
                                            <Text style={styles.levelText}>{skill.level}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.skillYears}>{skill.years} năm kinh nghiệm</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Chưa có kỹ năng nào</Text>
                    )}
                </View>

                {/* Certifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chứng chỉ & Bằng cấp</Text>
                    {loadingCerts ? (
                        <Text style={styles.emptyText}>Đang tải...</Text>
                    ) : certifications.length > 0 ? (
                        certifications.map((cert, index) => {
                            const getStatusColor = (status) => {
                                switch (status) {
                                    case 'verified': return '#4CAF50';
                                    case 'pending': return '#FF9800';
                                    case 'rejected': return '#F44336';
                                    default: return '#999';
                                }
                            };
                            
                            const getStatusText = (status) => {
                                switch (status) {
                                    case 'verified': return 'Đã xác minh';
                                    case 'pending': return 'Chờ xác minh';
                                    case 'rejected': return 'Từ chối';
                                    default: return 'Chưa xác minh';
                                }
                            };
                            
                            return (
                                <TouchableOpacity
                                    key={cert.certificationId || index}
                                    style={styles.certCard}
                                    onPress={() => {
                                        setSelectedCert(cert);
                                        setCertModalVisible(true);
                                    }}
                                >
                                    <Ionicons name="ribbon" size={20} color="#FFB800" />
                                    <View style={styles.certInfo}>
                                        <Text style={styles.certName}>{cert.certName}</Text>
                                        <Text style={styles.certOrg}>
                                            {cert.issuedBy} • {new Date(cert.issuedDate).getFullYear()}
                                        </Text>
                                        <View style={[styles.certStatus, { backgroundColor: getStatusColor(cert.verificationStatus) + '20' }]}>
                                            <Text style={[styles.certStatusText, { color: getStatusColor(cert.verificationStatus) }]}>
                                                {getStatusText(cert.verificationStatus)}
                                            </Text>
                                        </View>
                                    </View>
                                    <Ionicons name="eye-outline" size={20} color="#2196F3" />
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <Text style={styles.emptyText}>Chưa có chứng chỉ nào</Text>
                    )}
                </View>
            </View>
        );
    };

    const renderPortfolio = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hình ảnh công việc đã hoàn thành</Text>
            <Text style={styles.sectionSubtitle}>Một số dự án tiêu biểu</Text>
            {portfolio.map((item) => (
                <View key={item.id} style={styles.portfolioCard}>
                    <View style={styles.portfolioHeader}>
                        <View style={styles.portfolioType}>
                            <Ionicons name="construct" size={16} color="#FF6B35" />
                            <Text style={styles.portfolioTypeText}>{item.type}</Text>
                        </View>
                    </View>
                    <Text style={styles.portfolioDesc}>{item.description}</Text>
                    <View style={styles.portfolioImages}>
                        <View style={styles.imageBox}>
                            <Text style={styles.imageEmoji}>{item.before}</Text>
                            <Text style={styles.imageLabel}>Trước</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color="#999" />
                        <View style={styles.imageBox}>
                            <Text style={styles.imageEmoji}>{item.after}</Text>
                            <Text style={styles.imageLabel}>Sau</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderServices = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dịch vụ & Bảng giá</Text>
            <Text style={styles.sectionSubtitle}>Giá tham khảo cho các dịch vụ phổ biến</Text>
            {services.map((service, index) => (
                <View key={index} style={styles.serviceCard}>
                    <View style={styles.serviceIcon}>
                        <Ionicons name={service.icon} size={24} color="#FF6B35" />
                    </View>
                    <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <View style={styles.serviceDetails}>
                            <View style={styles.serviceDetail}>
                                <Ionicons name="cash-outline" size={14} color="#4CAF50" />
                                <Text style={styles.servicePrice}>{service.price}</Text>
                            </View>
                            <View style={styles.serviceDetail}>
                                <Ionicons name="time-outline" size={14} color="#2196F3" />
                                <Text style={styles.serviceTime}>{service.time}</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.bookButton}>
                        <Text style={styles.bookButtonText}>Đặt</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <Text style={styles.priceNote}>* Giá cuối cùng phụ thuộc vào tình trạng thực tế</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ sơ nghề nghiệp</Text>
                <TouchableOpacity onPress={() => {}}>
                    <Ionicons name="share-social-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle" size={80} color="#FF6B35" />
                        {workerProfile?.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.userName}>{user?.fullName || 'Thợ'}</Text>
                    <Text style={styles.specialization}>
                        {getSkillsDisplay().find(s => s.isPrimary)?.name || 'Thợ sửa chữa'}
                    </Text>
                    <View style={styles.experienceBadge}>
                        <Ionicons name="briefcase" size={14} color="#FF6B35" />
                        <Text style={styles.experienceText}>
                            {workerProfile?.completedJobs || 100} công việc hoàn thành
                        </Text>
                    </View>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={18} color="#FFB800" />
                        <Text style={styles.rating}>
                            {workerProfile?.ratingAvg ? workerProfile.ratingAvg.toFixed(1) : '4.9'}
                        </Text>
                        <Text style={styles.ratingCount}>
                            ({workerProfile?.ratingCount || 99} đánh giá)
                        </Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
                        onPress={() => setSelectedTab('overview')}
                    >
                        <Ionicons name="person" size={20} color={selectedTab === 'overview' ? '#FF6B35' : '#999'} />
                        <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>Tổng quan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'portfolio' && styles.activeTab]}
                        onPress={() => setSelectedTab('portfolio')}
                    >
                        <Ionicons name="images" size={20} color={selectedTab === 'portfolio' ? '#FF6B35' : '#999'} />
                        <Text style={[styles.tabText, selectedTab === 'portfolio' && styles.activeTabText]}>Portfolio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'services' && styles.activeTab]}
                        onPress={() => setSelectedTab('services')}
                    >
                        <Ionicons name="pricetag" size={20} color={selectedTab === 'services' ? '#FF6B35' : '#999'} />
                        <Text style={[styles.tabText, selectedTab === 'services' && styles.activeTabText]}>Giá dịch vụ</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {selectedTab === 'overview' && renderOverview()}
                {selectedTab === 'portfolio' && renderPortfolio()}
                {selectedTab === 'services' && renderServices()}

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quản lý</Text>
                    
                    {/* Worker Profile Setup Warning */}
                    {!user?.workerId && (
                        <TouchableOpacity 
                            style={styles.setupWarning}
                            onPress={() => navigation.navigate('WorkerProfileSetup')}
                        >
                            <Ionicons name="warning" size={24} color="#FF9800" />
                            <View style={styles.setupWarningText}>
                                <Text style={styles.setupWarningTitle}>Chưa hoàn tất hồ sơ</Text>
                                <Text style={styles.setupWarningDesc}>
                                    Nhấn để thiết lập hồ sơ thợ và bắt đầu nhận việc
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FF9800" />
                        </TouchableOpacity>
                    )}
                    
                    {profileItems.map((item, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.menuItem}
                            onPress={() => {
                                if (item.screen === 'EditProfile' || item.screen === 'ManageCertifications' || item.screen === 'ManageSkills') {
                                    // Kiểm tra workerId
                                    if (!user?.workerId) {
                                        Alert.alert(
                                            'Chưa có hồ sơ thợ', 
                                            'Bạn cần thiết lập hồ sơ thợ trước.',
                                            [
                                                { text: 'Hủy', style: 'cancel' },
                                                { 
                                                    text: 'Thiết lập ngay', 
                                                    onPress: () => navigation.navigate('WorkerProfileSetup')
                                                }
                                            ]
                                        );
                                        return;
                                    }
                                    
                                    // Pass workerId from user data
                                    navigation.navigate(item.screen, { 
                                        workerId: user.workerId 
                                    });
                                } else if (item.screen) {
                                    navigation.navigate(item.screen);
                                }
                            }}
                        >
                            <View style={styles.menuLeft}>
                                <Ionicons name={item.icon} size={22} color="#666" />
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#CCC" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Certificate Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={certModalVisible}
                onRequestClose={() => setCertModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chi tiết chứng chỉ</Text>
                            <TouchableOpacity onPress={() => setCertModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {selectedCert && (
                            <ScrollView style={styles.modalBody}>
                                {/* Certificate Image */}
                                <View style={styles.certImageContainer}>
                                    {selectedCert.documentUrl ? (
                                        <Image 
                                            source={{ uri: selectedCert.documentUrl }}
                                            style={styles.certImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <View style={styles.certImageMock}>
                                            <Ionicons name="ribbon" size={60} color="#FFB800" />
                                            <Text style={styles.certImageTitle}>{selectedCert.certName}</Text>
                                            <Text style={styles.certImageSubtitle}>Chưa có ảnh chứng chỉ</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Certificate Details */}
                                <View style={styles.certDetails}>
                                    <View style={styles.certDetailRow}>
                                        <Ionicons name="document-text" size={20} color="#FF6B35" />
                                        <View style={styles.certDetailText}>
                                            <Text style={styles.certDetailLabel}>Tên chứng chỉ</Text>
                                            <Text style={styles.certDetailValue}>{selectedCert.certName}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.certDetailRow}>
                                        <Ionicons name="shield-checkmark" size={20} color="#FF6B35" />
                                        <View style={styles.certDetailText}>
                                            <Text style={styles.certDetailLabel}>Mã chứng chỉ</Text>
                                            <Text style={styles.certDetailValue}>{selectedCert.certNumber}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.certDetailRow}>
                                        <Ionicons name="business" size={20} color="#FF6B35" />
                                        <View style={styles.certDetailText}>
                                            <Text style={styles.certDetailLabel}>Tổ chức cấp</Text>
                                            <Text style={styles.certDetailValue}>{selectedCert.issuedBy}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.certDetailRow}>
                                        <Ionicons name="calendar" size={20} color="#FF6B35" />
                                        <View style={styles.certDetailText}>
                                            <Text style={styles.certDetailLabel}>Ngày cấp</Text>
                                            <Text style={styles.certDetailValue}>
                                                {new Date(selectedCert.issuedDate).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </View>
                                    </View>

                                    {selectedCert.expiryDate && (
                                        <View style={styles.certDetailRow}>
                                            <Ionicons name="time" size={20} color="#FF6B35" />
                                            <View style={styles.certDetailText}>
                                                <Text style={styles.certDetailLabel}>Ngày hết hạn</Text>
                                                <Text style={styles.certDetailValue}>
                                                    {new Date(selectedCert.expiryDate).toLocaleDateString('vi-VN')}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.certDetailRow}>
                                        <Ionicons 
                                            name={selectedCert.isVerified ? "checkmark-circle" : "time"} 
                                            size={20} 
                                            color={selectedCert.isVerified ? "#4CAF50" : "#FF9800"} 
                                        />
                                        <View style={styles.certDetailText}>
                                            <Text style={styles.certDetailLabel}>Trạng thái</Text>
                                            <Text style={[
                                                styles.certDetailValue,
                                                { color: selectedCert.isVerified ? '#4CAF50' : '#FF9800' }
                                            ]}>
                                                {selectedCert.isVerified ? 'Đã xác thực ✓' : 'Chờ xác thực'}
                                            </Text>
                                        </View>
                                    </View>

                                    {selectedCert.verifiedAt && (
                                        <View style={styles.certDetailRow}>
                                            <Ionicons name="checkmark-done" size={20} color="#4CAF50" />
                                            <View style={styles.certDetailText}>
                                                <Text style={styles.certDetailLabel}>Ngày xác thực</Text>
                                                <Text style={styles.certDetailValue}>
                                                    {new Date(selectedCert.verifiedAt).toLocaleDateString('vi-VN')}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {selectedCert.isExpired && (
                                        <View style={styles.certDetailRow}>
                                            <Ionicons name="warning" size={20} color="#F44336" />
                                            <View style={styles.certDetailText}>
                                                <Text style={styles.certDetailLabel}>Cảnh báo</Text>
                                                <Text style={[styles.certDetailValue, { color: '#F44336' }]}>
                                                    Chứng chỉ đã hết hạn
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.certNote}>
                                    <Ionicons 
                                        name="information-circle" 
                                        size={18} 
                                        color={selectedCert.isVerified ? "#2196F3" : "#FF9800"} 
                                    />
                                    <Text style={styles.certNoteText}>
                                        {selectedCert.isVerified 
                                            ? 'Chứng chỉ này đã được xác thực bởi hệ thống và đảm bảo tính chính xác.'
                                            : 'Chứng chỉ đang chờ admin xác minh. Bạn sẽ nhận thông báo khi được duyệt.'}
                                    </Text>
                                </View>
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setCertModalVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    profileHeader: {
        backgroundColor: 'white',
        padding: 30,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    verifiedBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    specialization: {
        fontSize: 16,
        color: '#FF6B35',
        fontWeight: '600',
        marginBottom: 10,
    },
    experienceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 10,
        gap: 5,
    },
    experienceText: {
        fontSize: 13,
        color: '#FF6B35',
        fontWeight: '600',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    rating: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 3,
    },
    ratingCount: {
        fontSize: 14,
        color: '#999',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        gap: 5,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#FF6B35',
    },
    tabText: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FF6B35',
        fontWeight: '600',
    },
    section: {
        backgroundColor: 'white',
        marginTop: 10,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#999',
        marginBottom: 15,
    },
    bioText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    skillCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 10,
        gap: 12,
    },
    skillIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#FFF5F0',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skillInfo: {
        flex: 1,
    },
    skillHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    skillName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    levelBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    levelText: {
        fontSize: 11,
        color: 'white',
        fontWeight: '600',
    },
    skillYears: {
        fontSize: 13,
        color: '#999',
    },
    certCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FFFEF5',
        borderRadius: 12,
        marginBottom: 10,
        gap: 12,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    certInfo: {
        flex: 1,
    },
    certName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
    },
    certOrg: {
        fontSize: 13,
        color: '#999',
    },
    portfolioCard: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    portfolioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    portfolioType: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    portfolioTypeText: {
        fontSize: 13,
        color: '#FF6B35',
        fontWeight: '600',
    },
    portfolioDesc: {
        fontSize: 15,
        color: '#333',
        marginBottom: 15,
    },
    portfolioImages: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    imageBox: {
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        width: width * 0.35,
    },
    imageEmoji: {
        fontSize: 40,
        marginBottom: 8,
    },
    imageLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    serviceIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#FFF5F0',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    serviceDetails: {
        flexDirection: 'row',
        gap: 15,
    },
    serviceDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    servicePrice: {
        fontSize: 13,
        color: '#4CAF50',
        fontWeight: '600',
    },
    serviceTime: {
        fontSize: 13,
        color: '#2196F3',
    },
    bookButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    bookButtonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },
    priceNote: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        marginTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuLabel: {
        fontSize: 15,
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
        marginBottom: 40,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },
    certStatus: {
        marginTop: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    certStatusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 20,
        fontStyle: 'italic',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalBody: {
        padding: 20,
    },
    certImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    certImage: {
        width: '100%',
        height: 250,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: '#FFB800',
        backgroundColor: '#F8F9FA',
    },
    certImageMock: {
        width: '100%',
        height: 200,
        backgroundColor: '#FFF5F0',
        borderRadius: 15,
        borderWidth: 3,
        borderColor: '#FFB800',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
    },
    certImageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    certImageSubtitle: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
    },
    setupWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FFF3E0',
        borderRadius: 10,
        marginBottom: 15,
        gap: 12,
    },
    setupWarningText: {
        flex: 1,
    },
    setupWarningTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#F57C00',
        marginBottom: 4,
    },
    setupWarningDesc: {
        fontSize: 13,
        color: '#666',
    },
    certDetails: {
        gap: 15,
        marginBottom: 20,
    },
    certDetailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 15,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    certDetailText: {
        flex: 1,
    },
    certDetailLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    certDetailValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
    },
    certStatusValid: {
        fontSize: 15,
        color: '#4CAF50',
        fontWeight: '600',
    },
    certNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 15,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        marginBottom: 20,
    },
    certNoteText: {
        flex: 1,
        fontSize: 13,
        color: '#1976D2',
        lineHeight: 20,
    },
    modalCloseButton: {
        backgroundColor: '#FF6B35',
        margin: 20,
        marginTop: 0,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
