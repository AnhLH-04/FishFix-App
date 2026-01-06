import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';

export default function ReviewsScreen({ navigation }) {
    const [activeFilter, setActiveFilter] = useState('all'); // all, 5, 4, 3, 2, 1

    const stats = {
        average: 4.8,
        total: 125,
        breakdown: {
            5: 90,
            4: 25,
            3: 7,
            2: 2,
            1: 1,
        },
    };

    const reviews = [
        {
            id: 1,
            customer: 'Nguyễn Văn A',
            rating: 5,
            date: '30/12/2025',
            comment: 'Thợ đến đúng giờ, sửa nhanh và chuyên nghiệp. Máy lạnh hoạt động rất tốt. Rất hài lòng!',
            service: 'Sửa máy lạnh',
            helpful: 12,
        },
        {
            id: 2,
            customer: 'Trần Thị B',
            rating: 5,
            date: '29/12/2025',
            comment: 'Anh thợ nhiệt tình, tư vấn kỹ càng. Giá cả hợp lý, chất lượng tốt. Sẽ giới thiệu cho bạn bè!',
            service: 'Bảo trì tủ lạnh',
            helpful: 8,
        },
        {
            id: 3,
            customer: 'Lê Văn C',
            rating: 4,
            date: '28/12/2025',
            comment: 'Tốt, nhưng đến muộn hơn dự kiến 15 phút. Tuy nhiên công việc hoàn thành tốt.',
            service: 'Sửa máy giặt',
            helpful: 5,
        },
        {
            id: 4,
            customer: 'Phạm Thị D',
            rating: 5,
            date: '27/12/2025',
            comment: 'Xuất sắc! Thợ rất am hiểu, sửa nhanh và giải thích rõ ràng về vấn đề.',
            service: 'Sửa bếp gas',
            helpful: 10,
        },
        {
            id: 5,
            customer: 'Hoàng Văn E',
            rating: 3,
            date: '26/12/2025',
            comment: 'Công việc hoàn thành nhưng cần cải thiện về thái độ phục vụ.',
            service: 'Sửa quạt điện',
            helpful: 3,
        },
    ];

    const filteredReviews = reviews.filter((review) => {
        if (activeFilter === 'all') return true;
        return review.rating === parseInt(activeFilter);
    });

    const getPercentage = (count) => {
        return ((count / stats.total) * 100).toFixed(0);
    };

    const renderStarBar = (star) => {
        const count = stats.breakdown[star];
        const percentage = getPercentage(count);

        return (
            <TouchableOpacity
                key={star}
                style={styles.starBarRow}
                onPress={() => setActiveFilter(star.toString())}
            >
                <View style={styles.starBarLeft}>
                    <Text style={styles.starBarNumber}>{star}</Text>
                    <Ionicons name="star" size={14} color="#FFB800" />
                </View>
                <View style={styles.starBarContainer}>
                    <View
                        style={[
                            styles.starBarFill,
                            { width: `${percentage}%` },
                        ]}
                    />
                </View>
                <Text style={styles.starBarCount}>{count}</Text>
            </TouchableOpacity>
        );
    };

    const renderReview = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                    <Ionicons name="person-circle" size={40} color="#FF6B35" />
                    <View style={styles.reviewerDetails}>
                        <Text style={styles.reviewerName}>{item.customer}</Text>
                        <View style={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= item.rating ? 'star' : 'star-outline'}
                                    size={14}
                                    color="#FFB800"
                                />
                            ))}
                            <Text style={styles.reviewDate}> • {item.date}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.serviceTag}>
                <Ionicons name="construct" size={14} color="#666" />
                <Text style={styles.serviceText}>{item.service}</Text>
            </View>

            <Text style={styles.reviewComment}>{item.comment}</Text>

            <View style={styles.reviewFooter}>
                <TouchableOpacity style={styles.helpfulButton}>
                    <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                    <Text style={styles.helpfulText}>Hữu ích ({item.helpful})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.replyButton}>
                    <Ionicons name="chatbubble-outline" size={16} color="#2196F3" />
                    <Text style={styles.replyText}>Phản hồi</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đánh giá của tôi</Text>
                <TouchableOpacity>
                    <Ionicons name="filter" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredReviews}
                renderItem={renderReview}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        {/* Stats Card */}
                        <View style={styles.statsCard}>
                            <View style={styles.averageSection}>
                                <Text style={styles.averageScore}>{stats.average}</Text>
                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Ionicons
                                            key={star}
                                            name="star"
                                            size={20}
                                            color="#FFB800"
                                        />
                                    ))}
                                </View>
                                <Text style={styles.totalReviews}>
                                    {stats.total} đánh giá
                                </Text>
                            </View>

                            <View style={styles.breakdownSection}>
                                {[5, 4, 3, 2, 1].map((star) => renderStarBar(star))}
                            </View>
                        </View>

                        {/* Filter Buttons */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.filterContainer}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    activeFilter === 'all' && styles.filterButtonActive,
                                ]}
                                onPress={() => setActiveFilter('all')}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        activeFilter === 'all' && styles.filterTextActive,
                                    ]}
                                >
                                    Tất cả ({stats.total})
                                </Text>
                            </TouchableOpacity>
                            {[5, 4, 3, 2, 1].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    style={[
                                        styles.filterButton,
                                        activeFilter === star.toString() &&
                                            styles.filterButtonActive,
                                    ]}
                                    onPress={() => setActiveFilter(star.toString())}
                                >
                                    <Ionicons name="star" size={14} color="#FFB800" />
                                    <Text
                                        style={[
                                            styles.filterText,
                                            activeFilter === star.toString() &&
                                                styles.filterTextActive,
                                        ]}
                                    >
                                        {star} ({stats.breakdown[star]})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Section Title */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {filteredReviews.length} đánh giá
                            </Text>
                        </View>
                    </>
                }
            />
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
    statsCard: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    averageSection: {
        alignItems: 'center',
        paddingRight: 20,
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
    },
    averageScore: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 8,
        gap: 2,
    },
    totalReviews: {
        fontSize: 13,
        color: '#666',
    },
    breakdownSection: {
        flex: 1,
        paddingLeft: 20,
        justifyContent: 'center',
    },
    starBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 3,
        gap: 8,
    },
    starBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        width: 35,
    },
    starBarNumber: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
    starBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    starBarFill: {
        height: '100%',
        backgroundColor: '#FFB800',
    },
    starBarCount: {
        fontSize: 12,
        color: '#666',
        width: 30,
        textAlign: 'right',
    },
    filterContainer: {
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'white',
        borderRadius: 20,
        marginRight: 10,
        gap: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterButtonActive: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    filterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    filterTextActive: {
        color: 'white',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    reviewCard: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        marginBottom: 12,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    reviewHeader: {
        marginBottom: 12,
    },
    reviewerInfo: {
        flexDirection: 'row',
        gap: 12,
    },
    reviewerDetails: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    reviewDate: {
        fontSize: 12,
        color: '#999',
    },
    serviceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 5,
        marginBottom: 12,
    },
    serviceText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    reviewComment: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        marginBottom: 15,
    },
    reviewFooter: {
        flexDirection: 'row',
        gap: 15,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    helpfulButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    helpfulText: {
        fontSize: 13,
        color: '#666',
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    replyText: {
        fontSize: 13,
        color: '#2196F3',
        fontWeight: '500',
    },
});
