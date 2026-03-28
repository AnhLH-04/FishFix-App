import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TechnicianListScreen = ({ navigation, route }) => {
    const { category, problem, serviceDetail, categoryId, isScheduledBooking } = route.params || {};
    const [selectedFilter, setSelectedFilter] = useState('all');

    const technicians = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            specialty: 'Chuyên sửa máy giặt, điều hòa',
            rating: 4.9,
            reviews: 234,
            jobs: 450,
            price: '150,000đ - 300,000đ',
            distance: '2.5 km',
            verified: true,
            avatar: '👨‍🔧',
            responseTime: '< 30 phút',
            skills: ['Máy giặt', 'Điều hòa', 'Tủ lạnh'],
            experience: '8 năm',
        },
        {
            id: 2,
            name: 'Trần Thị B',
            specialty: 'Điện nước, ống nước',
            rating: 4.8,
            reviews: 189,
            jobs: 320,
            price: '120,000đ - 250,000đ',
            distance: '1.8 km',
            verified: true,
            avatar: '👩‍🔧',
            responseTime: '< 1 giờ',
            skills: ['Điện', 'Nước', 'Ống nước'],
            experience: '6 năm',
        },
        {
            id: 3,
            name: 'Lê Văn C',
            specialty: 'Đa năng - Sửa chữa tổng hợp',
            rating: 4.7,
            reviews: 156,
            jobs: 280,
            price: '100,000đ - 200,000đ',
            distance: '3.2 km',
            verified: false,
            avatar: '🧑‍🔧',
            responseTime: '< 2 giờ',
            skills: ['Đồ gia dụng', 'Điện', 'Nước'],
            experience: '5 năm',
        },
        {
            id: 4,
            name: 'Phạm Văn D',
            specialty: 'Chuyên điều hòa, tủ lạnh',
            rating: 5.0,
            reviews: 98,
            jobs: 180,
            price: '200,000đ - 400,000đ',
            distance: '4.1 km',
            verified: true,
            avatar: '👨‍🔧',
            responseTime: '< 45 phút',
            skills: ['Điều hòa', 'Tủ lạnh', 'Máy lạnh'],
            experience: '10 năm',
        },
    ];

    const filters = [
        { id: 'all', label: 'Tất Cả', icon: 'list' },
        { id: 'rating', label: 'Đánh Giá Cao', icon: 'star' },
        { id: 'nearby', label: 'Gần Nhất', icon: 'location' },
        { id: 'price', label: 'Giá Tốt', icon: 'pricetag' },
    ];

    const handleBookTechnician = (technician) => {
        navigation.navigate('Booking', { 
            technician, 
            category: serviceDetail?.categoryName || category, 
            problem,
            serviceDetail,
            categoryId,
        });
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
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Chọn Thợ Sửa Chữa</Text>
                    {category && (
                        <Text style={styles.headerSubtitle}>Dịch vụ: {category}</Text>
                    )}
                </View>
                <TouchableOpacity>
                    <Ionicons name="filter" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm theo tên, kỹ năng..."
                />
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
            >
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[
                            styles.filterChip,
                            selectedFilter === filter.id && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedFilter(filter.id)}
                    >
                        <Ionicons
                            name={filter.icon}
                            size={16}
                            color={selectedFilter === filter.id ? '#fff' : '#666'}
                        />
                        <Text
                            style={[
                                styles.filterText,
                                selectedFilter === filter.id && styles.filterTextActive,
                            ]}
                        >
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Technicians List */}
            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.resultsText}>
                    Tìm thấy {technicians.length} thợ phù hợp
                </Text>

                {technicians.map((tech) => (
                    <View key={tech.id} style={styles.techCard}>
                        <View style={styles.techHeader}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatar}>{tech.avatar}</Text>
                                {tech.verified && (
                                    <View style={styles.verifiedBadge}>
                                        <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
                                    </View>
                                )}
                            </View>
                            <View style={styles.techInfo}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.techName}>{tech.name}</Text>
                                    <View style={styles.ratingContainer}>
                                        <Ionicons name="star" size={14} color="#FFD700" />
                                        <Text style={styles.ratingText}>{tech.rating}</Text>
                                    </View>
                                </View>
                                <Text style={styles.specialty}>{tech.specialty}</Text>
                                <View style={styles.statsRow}>
                                    <View style={styles.stat}>
                                        <Ionicons name="briefcase" size={12} color="#666" />
                                        <Text style={styles.statText}>{tech.jobs} việc</Text>
                                    </View>
                                    <View style={styles.stat}>
                                        <Ionicons name="location" size={12} color="#666" />
                                        <Text style={styles.statText}>{tech.distance}</Text>
                                    </View>
                                    <View style={styles.stat}>
                                        <Ionicons name="time" size={12} color="#666" />
                                        <Text style={styles.statText}>{tech.responseTime}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Skills */}
                        <View style={styles.skillsContainer}>
                            {tech.skills.map((skill, index) => (
                                <View key={index} style={styles.skillBadge}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Experience & Reviews */}
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <Ionicons name="trophy" size={16} color="#F5A623" />
                                <Text style={styles.detailText}>{tech.experience} kinh nghiệm</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="chatbubbles" size={16} color="#4A90E2" />
                                <Text style={styles.detailText}>{tech.reviews} đánh giá</Text>
                            </View>
                        </View>

                        {/* Price & Action */}
                        <View style={styles.footer}>
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceLabel}>Giá dịch vụ:</Text>
                                <Text style={styles.price}>{tech.price}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.bookBtn}
                                onPress={() => handleBookTechnician(tech)}
                            >
                                <Text style={styles.bookBtnText}>Đặt Lịch</Text>
                                <Ionicons name="arrow-forward" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
        paddingHorizontal: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        elevation: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
    },
    filtersContainer: {
        paddingHorizontal: 20,
        paddingVertical: 13,
        maxHeight: 60,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    filterChipActive: {
        backgroundColor: '#1E88E5',
        borderColor: '#1E88E5',
    },
    filterText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#fff',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    resultsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    techCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    techHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        fontSize: 48,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    techInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    techName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    specialty: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 11,
        color: '#666',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    skillBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    skillText: {
        fontSize: 11,
        color: '#1976D2',
        fontWeight: '500',
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 12,
        color: '#666',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 2,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E88E5',
    },
    bookBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 2,
    },
    bookBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 20,
    },
});

export default TechnicianListScreen;
