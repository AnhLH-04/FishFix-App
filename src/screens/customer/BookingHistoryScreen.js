import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import { getBookings } from '../../services/bookingService';
import colors from '../../utils/colors';

const BookingHistoryScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [viewReviewModalVisible, setViewReviewModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [punctualityRating, setPunctualityRating] = useState(5);
    const [qualityRating, setQualityRating] = useState(5);
    const [friendlinessRating, setFriendlinessRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchBookingHistory();
    }, []);

    const fetchBookingHistory = async () => {
        try {
            setLoading(true);
            if (user?.id) {
                // Lấy tất cả bookings của customer
                const data = await getBookings({ customerId: user.id });
                
                // Lọc chỉ những booking đã hoàn thành
                const completedBookings = data.filter(
                    booking => booking.status === 'completed' || booking.status === 'confirmed' || booking.status === 'paid'
                );
                
                console.log('✅ Completed Bookings count:', completedBookings.length);
                
                // Kiểm tra từng booking xem đã có review chưa
                const bookingsWithReviewStatus = await Promise.all(
                    completedBookings.map(async (booking) => {
                        try {
                            // Lấy reviews của worker này
                            const reviews = await reviewService.getWorkerReviews(booking.workerId);
                            // Tìm review của customer này cho booking này
                            const existingReview = reviews?.find(
                                r => r.reviewerId === user.id && r.bookingId === booking.bookingId
                            );
                            
                            // Chỉ lưu reviewId, không lưu toàn bộ review object
                            return {
                                ...booking,
                                hasReview: !!existingReview,
                                reviewId: existingReview?.reviewId || null,
                            };
                        } catch (error) {
                            console.log('Could not fetch review status for booking:', booking.bookingId);
                            return {
                                ...booking,
                                hasReview: false,
                                reviewId: null,
                            };
                        }
                    })
                );
                
                setBookings(bookingsWithReviewStatus || []);
            }
        } catch (error) {
            console.error('Error fetching booking history:', error);
            Alert.alert('Lỗi', 'Không thể tải lịch sử đặt lịch');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBookingHistory();
        setRefreshing(false);
    };

    const openReviewModal = async (booking) => {
        if (booking.hasReview && booking.reviewId) {
            // Nếu đã có review, gọi API lấy chi tiết review theo ID
            try {
                const reviewDetail = await reviewService.getReviewById(booking.reviewId);
                setSelectedReview(reviewDetail);
                setViewReviewModalVisible(true);
            } catch (error) {
                console.error('Error fetching review detail:', error);
                Alert.alert('Lỗi', 'Không thể tải chi tiết đánh giá');
            }
        } else {
            // Nếu chưa có review, mở modal tạo review mới
            console.log('🔍 Opening review for booking:', {
                bookingId: booking.bookingId,
                workerId: booking.workerId,
                customerId: booking.customerId,
            });
            
            setSelectedBooking(booking);
            setRating(5);
            setComment('');
            setPunctualityRating(5);
            setQualityRating(5);
            setFriendlinessRating(5);
            setReviewModalVisible(true);
        }
    };

    const closeReviewModal = () => {
        setReviewModalVisible(false);
        setSelectedBooking(null);
        setComment('');
    };

    const closeViewReviewModal = () => {
        setViewReviewModalVisible(false);
        setSelectedReview(null);
    };

    const submitReview = async () => {
        if (!selectedBooking) return;

        if (comment.trim().length < 10) {
            Alert.alert('Thông báo', 'Vui lòng nhập nhận xét ít nhất 10 ký tự');
            return;
        }

        try {
            setSubmittingReview(true);
            
            // Lấy bookingId và workerId trực tiếp từ data
            const bookingId = selectedBooking.bookingId;
            const workerId = selectedBooking.workerId;
            
            console.log('📝 Submitting review:', {
                bookingId,
                workerId,
                reviewerId: user.id,
                rating,
            });
            
            if (!bookingId) {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin booking');
                setSubmittingReview(false);
                return;
            }
            
            if (!workerId) {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin thợ. Vui lòng thử lại sau.');
                console.error('❌ WorkerId not found in booking');
                setSubmittingReview(false);
                return;
            }
            
            const reviewData = {
                reviewerId: user.id,
                revieweeId: workerId,
                rating: rating,
                comment: comment.trim(),
                punctualityRating: punctualityRating,
                qualityRating: qualityRating,
                friendlinessRating: friendlinessRating,
            };
            
            console.log('📤 Sending review data:', JSON.stringify(reviewData, null, 2));

            const response = await reviewService.createReview(bookingId, reviewData);
            console.log('✅ Review created successfully:', JSON.stringify(response, null, 2));
            
            Alert.alert(
                'Thành công',
                `Cảm ơn bạn đã đánh giá!\n\nBooking ID: ${bookingId.substring(0, 8)}...\nWorker ID: ${workerId.substring(0, 8)}...`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            closeReviewModal();
                            fetchBookingHistory();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error submitting review:', error);
            Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const renderStarRating = (value, onChange, size = 24) => {
        return (
            <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onChange(star)}
                        style={styles.starButton}
                    >
                        <Ionicons
                            name={star <= value ? 'star' : 'star-outline'}
                            size={size}
                            color="#FFD700"
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderBookingItem = ({ item }) => {
        const bookingDate = item.scheduledDate 
            ? new Date(item.scheduledDate).toLocaleDateString('vi-VN')
            : item.createdAt 
            ? new Date(item.createdAt).toLocaleDateString('vi-VN')
            : 'N/A';
        
        const jobId = item.jobId;
        const bookingId = item.bookingId;

        return (
            <TouchableOpacity
                style={styles.bookingCard}
                onPress={() => {
                    console.log('📍 Navigating to JobTracking with:', { bookingId, jobId });
                    navigation.navigate('HomeTab', { 
                        screen: 'JobTracking', 
                        params: { bookingId, jobId } 
                    });
                }}
            >
                <View style={styles.bookingHeader}>
                    <View style={styles.bookingInfo}>
                        <Text style={styles.bookingTitle} numberOfLines={2}>
                            {item.title || `Booking #${bookingId?.substring(0, 8)}`}
                        </Text>
                        <Text style={styles.bookingDate}>{bookingDate}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        <Text style={styles.statusText}>Hoàn thành</Text>
                    </View>
                </View>

                {item.workerId && (
                    <View style={styles.workerInfo}>
                        <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                        <Text style={styles.workerName}>
                            Worker ID: {item.workerId.substring(0, 8)}...
                        </Text>
                    </View>
                )}

                {item.completionNotes && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.completionNotes}
                    </Text>
                )}

                {item.finalAmount && (
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Tổng chi phí:</Text>
                        <Text style={styles.priceValue}>
                            {item.finalAmount.toLocaleString('vi-VN')} đ
                        </Text>
                    </View>
                )}

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.viewDetailButton}
                        onPress={() => {
                            console.log('📍 View detail clicked with:', { bookingId, jobId });
                            navigation.navigate('HomeTab', { 
                                screen: 'JobTracking', 
                                params: { bookingId, jobId } 
                            });
                        }}
                    >
                        <Ionicons name="eye-outline" size={18} color={colors.primary} />
                        <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.reviewButton,
                            item.hasReview && styles.reviewedButton
                        ]}
                        onPress={() => openReviewModal(item)}
                    >
                        <Ionicons
                            name={item.hasReview ? "checkmark-circle" : "star-outline"}
                            size={18}
                            color="#fff"
                        />
                        <Text style={styles.reviewButtonText}>
                            {item.hasReview ? 'Đã đánh giá' : 'Đánh giá'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyList = () => {
        if (loading) return null;
        
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>Chưa có lịch sử đặt lịch</Text>
                <Text style={styles.emptySubText}>
                    Các công việc đã hoàn thành sẽ hiển thị ở đây
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lịch sử đặt lịch</Text>
                <View style={styles.placeholder} />
            </View>

            <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(item, index) => item.bookingId || `booking-${index}`}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            />

            {/* Review Modal */}
            <Modal
                visible={reviewModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeReviewModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Đánh giá dịch vụ</Text>
                            <TouchableOpacity onPress={closeReviewModal}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            style={styles.modalBody}
                            contentContainerStyle={styles.modalBodyContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {selectedBooking && (
                                <View style={styles.bookingInfoModal}>
                                    <View style={styles.bookingInfoHeader}>
                                        <Ionicons name="calendar" size={20} color={colors.primary} />
                                        <Text style={styles.modalBookingTitle}>
                                            Booking #{selectedBooking.bookingId?.substring(0, 8)}
                                        </Text>
                                    </View>
                                    {selectedBooking.scheduledDate && (
                                        <Text style={styles.modalBookingDate}>
                                            {new Date(selectedBooking.scheduledDate).toLocaleDateString('vi-VN')}
                                        </Text>
                                    )}
                                </View>
                            )}

                            <View style={styles.ratingSection}>
                                <View style={styles.ratingHeader}>
                                    <Ionicons name="star" size={20} color="#FFD700" />
                                    <Text style={styles.ratingLabel}>Đánh giá tổng thể</Text>
                                </View>
                                <View style={styles.ratingValue}>
                                    <Text style={styles.ratingNumber}>{rating}.0</Text>
                                    {renderStarRating(rating, setRating, 40)}
                                </View>
                            </View>

                            <View style={styles.detailedRatingsContainer}>
                                <Text style={styles.detailedRatingsTitle}>Chi tiết đánh giá</Text>
                                
                                <View style={styles.detailedRatingRow}>
                                    <View style={styles.detailedRatingLeft}>
                                        <Ionicons name="time-outline" size={20} color={colors.primary} />
                                        <Text style={styles.detailedRatingLabel}>Đúng giờ</Text>
                                    </View>
                                    {renderStarRating(punctualityRating, setPunctualityRating, 20)}
                                </View>

                                <View style={styles.detailedRatingRow}>
                                    <View style={styles.detailedRatingLeft}>
                                        <Ionicons name="checkmark-done-outline" size={20} color={colors.primary} />
                                        <Text style={styles.detailedRatingLabel}>Chất lượng công việc</Text>
                                    </View>
                                    {renderStarRating(qualityRating, setQualityRating, 20)}
                                </View>

                                <View style={styles.detailedRatingRow}>
                                    <View style={styles.detailedRatingLeft}>
                                        <Ionicons name="happy-outline" size={20} color={colors.primary} />
                                        <Text style={styles.detailedRatingLabel}>Thái độ phục vụ</Text>
                                    </View>
                                    {renderStarRating(friendlinessRating, setFriendlinessRating, 20)}
                                </View>
                            </View>

                            <View style={styles.commentSection}>
                                <View style={styles.commentHeader}>
                                    <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                                    <Text style={styles.commentLabel}>Nhận xét của bạn</Text>
                                </View>
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Chia sẻ trải nghiệm của bạn (tối thiểu 10 ký tự)..."
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={4}
                                    value={comment}
                                    onChangeText={setComment}
                                    textAlignVertical="top"
                                />
                                <Text style={styles.characterCount}>
                                    {comment.length}/200 ký tự
                                </Text>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={closeReviewModal}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.submitButton,
                                        (submittingReview || comment.length < 10) && styles.submitButtonDisabled
                                    ]}
                                    onPress={submitReview}
                                    disabled={submittingReview || comment.length < 10}
                                >
                                    {submittingReview ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="send" size={18} color="#fff" />
                                            <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* View Review Modal */}
            <Modal
                visible={viewReviewModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeViewReviewModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Đánh giá của bạn</Text>
                            <TouchableOpacity onPress={closeViewReviewModal}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            style={styles.modalBody}
                            contentContainerStyle={styles.modalBodyContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {selectedReview && (
                                <>
                                    <View style={styles.reviewCard}>
                                        <View style={styles.reviewHeaderSection}>
                                            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                                            <View style={styles.reviewHeaderText}>
                                                <Text style={styles.reviewCompletedText}>Đã đánh giá</Text>
                                                <Text style={styles.reviewDateText}>
                                                    {selectedReview.createdAt 
                                                        ? new Date(selectedReview.createdAt).toLocaleDateString('vi-VN')
                                                        : ''
                                                    }
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.divider} />

                                        <View style={styles.reviewRatingRow}>
                                            <Text style={styles.reviewRatingLabel}>Tổng thể</Text>
                                            <View style={styles.reviewStars}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Ionicons
                                                        key={star}
                                                        name={star <= (selectedReview.rating || 0) ? 'star' : 'star-outline'}
                                                        size={20}
                                                        color="#FFD700"
                                                        style={{ marginHorizontal: 2 }}
                                                    />
                                                ))}
                                                <Text style={styles.reviewRatingNumber}>
                                                    {selectedReview.rating}/5
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.reviewRatingRow}>
                                            <Text style={styles.reviewRatingLabel}>Đúng giờ</Text>
                                            <View style={styles.reviewStars}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Ionicons
                                                        key={star}
                                                        name={star <= (selectedReview.punctualityRating || 0) ? 'star' : 'star-outline'}
                                                        size={20}
                                                        color="#FFD700"
                                                        style={{ marginHorizontal: 2 }}
                                                    />
                                                ))}
                                                <Text style={styles.reviewRatingNumber}>
                                                    {selectedReview.punctualityRating}/5
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.reviewRatingRow}>
                                            <Text style={styles.reviewRatingLabel}>Chất lượng</Text>
                                            <View style={styles.reviewStars}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Ionicons
                                                        key={star}
                                                        name={star <= (selectedReview.qualityRating || 0) ? 'star' : 'star-outline'}
                                                        size={20}
                                                        color="#FFD700"
                                                        style={{ marginHorizontal: 2 }}
                                                    />
                                                ))}
                                                <Text style={styles.reviewRatingNumber}>
                                                    {selectedReview.qualityRating}/5
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.reviewRatingRow}>
                                            <Text style={styles.reviewRatingLabel}>Thái độ</Text>
                                            <View style={styles.reviewStars}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Ionicons
                                                        key={star}
                                                        name={star <= (selectedReview.friendlinessRating || 0) ? 'star' : 'star-outline'}
                                                        size={20}
                                                        color="#FFD700"
                                                        style={{ marginHorizontal: 2 }}
                                                    />
                                                ))}
                                                <Text style={styles.reviewRatingNumber}>
                                                    {selectedReview.friendlinessRating}/5
                                                </Text>
                                            </View>
                                        </View>

                                        {selectedReview.comment && (
                                            <>
                                                <View style={styles.divider} />
                                                <View style={styles.commentViewSection}>
                                                    <Text style={styles.commentViewLabel}>Nhận xét của bạn:</Text>
                                                    <Text style={styles.commentViewText}>
                                                        {selectedReview.comment}
                                                    </Text>
                                                </View>
                                            </>
                                        )}

                                        {selectedReview.workerResponse && (
                                            <>
                                                <View style={styles.divider} />
                                                <View style={styles.workerResponseSection}>
                                                    <View style={styles.workerResponseHeader}>
                                                        <Ionicons name="chatbubbles" size={20} color={colors.primary} />
                                                        <Text style={styles.workerResponseLabel}>Phản hồi từ thợ:</Text>
                                                    </View>
                                                    <Text style={styles.workerResponseText}>
                                                        {selectedReview.workerResponse}
                                                    </Text>
                                                    {selectedReview.responseAt && (
                                                        <Text style={styles.workerResponseDate}>
                                                            {new Date(selectedReview.responseAt).toLocaleDateString('vi-VN')}
                                                        </Text>
                                                    )}
                                                </View>
                                            </>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        style={styles.closeReviewButton}
                                        onPress={closeViewReviewModal}
                                    >
                                        <Text style={styles.closeReviewButtonText}>Đóng</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 40,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    bookingInfo: {
        flex: 1,
        marginRight: 12,
    },
    bookingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    bookingDate: {
        fontSize: 13,
        color: '#666',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        color: colors.success,
        fontWeight: '500',
    },
    workerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    workerName: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    priceValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    viewDetailButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: 6,
    },
    viewDetailText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    reviewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: colors.primary,
        gap: 6,
    },
    reviewedButton: {
        backgroundColor: '#4CAF50',
    },
    reviewButtonText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
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
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalBody: {
        padding: 20,
    },
    modalBodyContent: {
        paddingBottom: 40,
    },
    bookingInfoModal: {
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    bookingInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    modalBookingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    modalBookingDate: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    modalWorkerName: {
        fontSize: 14,
        color: '#666',
    },
    ratingSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    ratingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    ratingValue: {
        alignItems: 'center',
        gap: 12,
    },
    ratingNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    detailedRatingsContainer: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    detailedRatingsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    detailedRatingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    detailedRatingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    detailedRatingLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    starButton: {
        padding: 4,
    },
    commentSection: {
        marginBottom: 24,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    commentLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    commentInput: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#333',
        minHeight: 100,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        maxLength: 200,
    },
    characterCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 8,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    submitButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
        shadowOpacity: 0,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    // View Review Modal Styles
    reviewCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    reviewHeaderSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    reviewHeaderText: {
        flex: 1,
    },
    reviewCompletedText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.success,
    },
    reviewDateText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 16,
    },
    reviewRatingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    reviewRatingLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },
    reviewStars: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reviewRatingNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    commentViewSection: {
        marginTop: 8,
    },
    commentViewLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    commentViewText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
    },
    workerResponseSection: {
        marginTop: 8,
    },
    workerResponseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    workerResponseLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.primary,
    },
    workerResponseText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        backgroundColor: '#FFF3E0',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    workerResponseDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        textAlign: 'right',
    },
    closeReviewButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    closeReviewButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default BookingHistoryScreen;
