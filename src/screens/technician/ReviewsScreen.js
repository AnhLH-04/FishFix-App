import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReviewsScreen({ navigation }) {
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState('all');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [responseModalVisible, setResponseModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState({
        average: 0,
        total: 0,
        breakdown: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        },
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            if (user?.workerId) {
                // Fetch reviews and rating summary
                const [reviewsData, ratingSummary] = await Promise.all([
                    reviewService.getWorkerReviews(user.workerId),
                    reviewService.getWorkerRatingSummary(user.workerId)
                ]);
                
                console.log('Fetched reviews:', reviewsData);
                console.log('Rating summary:', ratingSummary);
                
                setReviews(reviewsData || []);
                
                // Use rating summary from API if available, otherwise calculate manually
                if (ratingSummary) {
                    setStats({
                        average: ratingSummary.averageRating || 0,
                        total: ratingSummary.totalReviews || 0,
                        breakdown: calculateBreakdown(reviewsData || []),
                    });
                } else {
                    calculateStats(reviewsData || []);
                }
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            Alert.alert('Lỗi', 'Không thể tải đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const calculateBreakdown = (reviewsData) => {
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach((review) => {
            const rating = Math.round(review.rating);
            breakdown[rating] = (breakdown[rating] || 0) + 1;
        });
        return breakdown;
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchReviews();
        setRefreshing(false);
    };

    const handleRespondToReview = (review) => {
        setSelectedReview(review);
        setResponseText('');
        setResponseModalVisible(true);
    };

    const submitResponse = async () => {
        if (!responseText || responseText.trim().length === 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập phản hồi');
            return;
        }
        
        try {
            setSubmitting(true);
            await reviewService.respondToReview(selectedReview.reviewId, responseText.trim());
            Alert.alert('Thành công', 'Đã gửi phản hồi');
            setResponseModalVisible(false);
            setResponseText('');
            setSelectedReview(null);
            await fetchReviews(); // Refresh to show the response
        } catch (error) {
            console.error('Error responding to review:', error);
            Alert.alert('Lỗi', 'Không thể gửi phản hồi');
        } finally {
            setSubmitting(false);
        }
    };

    const closeResponseModal = () => {
        setResponseModalVisible(false);
        setResponseText('');
        setSelectedReview(null);
    };

    const calculateStats = (reviewsData) => {
        if (!reviewsData || reviewsData.length === 0) {
            setStats({
                average: 0,
                total: 0,
                breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            });
            return;
        }

        const total = reviewsData.length;
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let sum = 0;

        reviewsData.forEach((review) => {
            const rating = Math.round(review.rating);
            breakdown[rating] = (breakdown[rating] || 0) + 1;
            sum += review.rating;
        });

        const average = (sum / total).toFixed(1);

        setStats({
            average: parseFloat(average),
            total,
            breakdown,
        });
    };

    const filteredReviews = reviews.filter((review) => {
        if (activeFilter === 'all') return true;
        return Math.round(review.rating) === parseInt(activeFilter);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderReview = ({ item }) => {
        const customerName = item.reviewerName || 'Khách hàng';
        const displayRating = Math.round(item.rating);
        
        return (
            <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                        <Ionicons name="person-circle" size={40} color="#FF6B35" />
                        <View style={styles.reviewerDetails}>
                            <Text style={styles.reviewerName}>{customerName}</Text>
                            <View style={styles.ratingRow}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Ionicons
                                        key={star}
                                        name={star <= displayRating ? 'star' : 'star-outline'}
                                        size={14}
                                        color="#FFB800"
                                    />
                                ))}
                                <Text style={styles.reviewDate}> • {formatDate(item.createdAt)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Detailed Ratings */}
                <View style={styles.detailedRatings}>
                    {item.punctualityRating && (
                        <View style={styles.ratingDetail}>
                            <Text style={styles.ratingLabel}>Đúng giờ:</Text>
                            <Text style={styles.ratingValue}>{item.punctualityRating}/5</Text>
                        </View>
                    )}
                    {item.qualityRating && (
                        <View style={styles.ratingDetail}>
                            <Text style={styles.ratingLabel}>Chất lượng:</Text>
                            <Text style={styles.ratingValue}>{item.qualityRating}/5</Text>
                        </View>
                    )}
                    {item.friendlinessRating && (
                        <View style={styles.ratingDetail}>
                            <Text style={styles.ratingLabel}>Thân thiện:</Text>
                            <Text style={styles.ratingValue}>{item.friendlinessRating}/5</Text>
                        </View>
                    )}
                </View>

                {item.comment ? (
                    <Text style={styles.reviewComment}>{item.comment}</Text>
                ) : (
                    <Text style={styles.noComment}>Không có nhận xét</Text>
                )}

                {item.workerResponse && (
                    <View style={styles.responseBox}>
                        <Text style={styles.responseLabel}>Phản hồi của bạn:</Text>
                        <Text style={styles.responseText}>{item.workerResponse}</Text>
                        {item.responseAt && (
                            <Text style={styles.responseDate}>
                                {formatDate(item.responseAt)}
                            </Text>
                        )}
                    </View>
                )}

                {!item.workerResponse && (
                    <TouchableOpacity 
                        style={styles.respondButton}
                        onPress={() => handleRespondToReview(item)}
                    >
                        <Ionicons name="chatbox-outline" size={16} color="#FF6B35" />
                        <Text style={styles.respondButtonText}>Phản hồi đánh giá</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

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

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredReviews}
                    renderItem={renderReview}
                    keyExtractor={(item) => item.reviewId?.toString() || Math.random().toString()}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#FF6B35']}
                        />
                    }
                    ListHeaderComponent={
                        <>
                            {/* Stats Card */}
                            <View style={styles.statsCard}>
                                <View style={styles.averageSection}>
                                    <Text style={styles.averageScore}>{stats.average ? stats.average.toFixed(1) : '0.0'}</Text>
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
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="star-outline" size={60} color="#CCC" />
                            <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
                            <Text style={styles.emptySubText}>
                                Hoàn thành công việc để nhận đánh giá từ khách hàng
                            </Text>
                        </View>
                    )
                }
            />
            )}

            {/* Response Modal */}
            <Modal
                visible={responseModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeResponseModal}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={closeResponseModal}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {}}
                            style={styles.modalContent}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Phản hồi đánh giá</Text>
                                <TouchableOpacity onPress={closeResponseModal}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            {selectedReview && (
                                <View style={styles.reviewSummary}>
                                    <View style={styles.reviewSummaryHeader}>
                                        <Ionicons name="person-circle" size={32} color="#FF6B35" />
                                        <Text style={styles.reviewSummaryName}>
                                            {selectedReview.reviewerName || 'Khách hàng'}
                                        </Text>
                                    </View>
                                    <View style={styles.reviewSummaryRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons
                                                key={star}
                                                name={star <= Math.round(selectedReview.rating) ? 'star' : 'star-outline'}
                                                size={16}
                                                color="#FFB800"
                                            />
                                        ))}
                                    </View>
                                    {selectedReview.comment && (
                                        <Text style={styles.reviewSummaryComment}>
                                            "{selectedReview.comment}"
                                        </Text>
                                    )}
                                </View>
                            )}

                            <TextInput
                                style={styles.responseInput}
                                placeholder="Nhập phản hồi của bạn..."
                                placeholderTextColor="#999"
                                value={responseText}
                                onChangeText={setResponseText}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <Text style={styles.characterCount}>
                                {responseText.length}/500
                            </Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={closeResponseModal}
                                    disabled={submitting}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.submitButton]}
                                    onPress={submitResponse}
                                    disabled={submitting || !responseText.trim()}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Gửi</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
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
    detailedRatings: {
        flexDirection: 'row',
        gap: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
        marginBottom: 12,
    },
    ratingDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    ratingLabel: {
        fontSize: 12,
        color: '#666',
    },
    ratingValue: {
        fontSize: 13,
        color: '#FF6B35',
        fontWeight: '600',
    },
    reviewComment: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        marginBottom: 10,
    },
    noComment: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        marginBottom: 10,
    },
    responseBox: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B35',
    },
    responseLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        marginBottom: 5,
    },
    responseText: {
        fontSize: 13,
        color: '#333',
        lineHeight: 20,
    },
    responseDate: {
        fontSize: 11,
        color: '#999',
        marginTop: 5,
    },
    respondButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF6B35',
        marginTop: 10,
        gap: 8,
    },
    respondButtonText: {
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 30,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginTop: 15,
        marginBottom: 5,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        paddingBottom: 35,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    reviewSummary: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    reviewSummaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    reviewSummaryName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    reviewSummaryRating: {
        flexDirection: 'row',
        gap: 3,
        marginBottom: 8,
    },
    reviewSummaryComment: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    responseInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        color: '#333',
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    characterCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#999',
        marginTop: 5,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#FF6B35',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});
