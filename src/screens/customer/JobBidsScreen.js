import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBidsForJob, acceptBid } from '../../services/bidService';
import { createBooking, getBookingByBidId } from '../../services/bookingService';
import { getJobById, updateJobStatus } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { notifyWorkerNewBooking } from '../../services/notificationService';
import workerService from '../../services/workerService';

export default function JobBidsScreen({ route, navigation }) {
    const { jobId, jobTitle } = route.params;
    const authContext = useAuth();
    const user = authContext?.user;
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [acceptingBidId, setAcceptingBidId] = useState(null);
    const [workersInfo, setWorkersInfo] = useState({});

    useEffect(() => {
        fetchBids();
    }, [jobId]);

    const fetchBids = async () => {
        try {
            setLoading(true);
            const bidsData = await getBidsForJob(jobId);
            
            // Sort by amount (lowest first) and created date
            const sortedBids = bidsData.sort((a, b) => {
                if (a.amount !== b.amount) return a.amount - b.amount;
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
            
            setBids(sortedBids);
            
            // Fetch worker info for each bid
            fetchWorkersInfo(sortedBids);
        } catch (error) {
            console.error('Error fetching bids:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách báo giá');
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkersInfo = async (bidsData) => {
        const workersMap = {};
        
        for (const bid of bidsData) {
            if (!workersMap[bid.workerId]) {
                try {
                    const workerInfo = await workerService.getWorkerById(bid.workerId);
                    workersMap[bid.workerId] = workerInfo;
                } catch (error) {
                    console.error(`Error fetching worker ${bid.workerId}:`, error);
                    workersMap[bid.workerId] = { fullName: 'Thợ sửa chữa', bio: '' };
                }
            }
        }
        
        setWorkersInfo(workersMap);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBids();
        setRefreshing(false);
    };

    const handleAcceptBid = (bid) => {
        console.log('🎯 handleAcceptBid CALLED with bid:', bid.bidId);
        const worker = workersInfo[bid.workerId];
        
        Alert.alert(
            'Chấp nhận báo giá',
            `Bạn muốn chấp nhận báo giá ${bid.amount.toLocaleString('vi-VN')}đ từ ${worker?.fullName || 'thợ này'}?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Chấp nhận',
                    onPress: () => {
                        console.log('🚀 User confirmed accept bid');
                        confirmAcceptBid(bid);
                    },
                },
            ]
        );
    };

    const confirmAcceptBid = async (bid) => {
        console.log('🎬 confirmAcceptBid STARTED for bid:', bid.bidId);
        console.log('📋 JobId:', jobId);
        try {
            setAcceptingBidId(bid.bidId);
            
            // Step 1: Accept the bid
            console.log('🔄 Step 1: Accepting bid...');
            console.log('📋 Bid ID:', bid.bidId);
            await acceptBid(bid.bidId);
            console.log('✅ Bid accepted');
            
            // Step 2: Update job status to 'assigned' IMMEDIATELY
            console.log('🔄 Step 2: Updating job status to assigned...');
            console.log('📋 Job ID to update:', jobId);
            try {
                const updateResponse = await updateJobStatus(jobId, 'completed');
                console.log('✅ Job status updated successfully to completed');
                console.log('✅ Update response:', updateResponse);
            } catch (statusError) {
                console.error('❌ CRITICAL: Failed to update job status:', statusError);
                console.error('❌ Error details:', statusError.response?.data);
                console.error('❌ Error status:', statusError.response?.status);
                // Show alert but continue
                Alert.alert('Cảnh báo', 'Không thể cập nhật trạng thái công việc, nhưng booking vẫn được tạo.');
            }
            
            // Step 3: Get job details
            console.log('🔄 Step 3: Fetching job details...');
            const jobDetails = await getJobById(jobId);
            
            // Step 4: Calculate booking details using bid data we already have
            console.log('🔄 Step 4: Preparing booking data...');
            const now = new Date();
            const depositAmount = Math.round(bid.amount * 0.3); // 30% deposit
            
            // Determine scheduled date/time
            let scheduledDate, scheduledTimeStart;
            if (bid.estimatedCompletion) {
                const estimatedDate = new Date(bid.estimatedCompletion);
                scheduledDate = estimatedDate.toISOString().split('T')[0];
                scheduledTimeStart = estimatedDate.toTimeString().slice(0, 8);
            } else {
                // Default: schedule for tomorrow morning
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                scheduledDate = tomorrow.toISOString().split('T')[0];
                scheduledTimeStart = '09:00:00';
            }
            
            // Step 5: Create booking
            const bookingData = {
                jobId: jobId,
                bidId: bid.bidId,
                customerId: user?.id || jobDetails.customerId,
                workerId: bid.workerId,
                finalAmount: bid.amount,
                scheduledDate: scheduledDate,
                scheduledTimeStart: scheduledTimeStart,
                scheduledTimeEnd: '18:00:00', // Default end time
                depositAmount: depositAmount,
            };
            
            console.log('📦 Step 5: Creating booking with data:', bookingData);
            const bookingResult = await createBooking(bookingData);
            
            console.log('✅ Booking created successfully:', bookingResult);
            console.log('📋 Booking ID:', bookingResult.bookingId);
            
            // Step 6: Send notification to worker
            console.log('🔔 Step 6: Notifying worker...');
            try {
                await notifyWorkerNewBooking(bid.workerId, bookingResult, jobDetails);
                console.log('✅ Worker notified successfully');
            } catch (notifError) {
                console.warn('⚠️ Could not send notification to worker:', notifError);
                // Continue even if notification fails
            }
            
            Alert.alert(
                'Thành công',
                `Đã tạo booking thành công!\n\nMã booking: ${bookingResult.bookingId}\nSố tiền đặt cọc: ${depositAmount.toLocaleString('vi-VN')}đ\nThời gian hẹn: ${scheduledDate} ${scheduledTimeStart}\n\nThợ sẽ nhận được thông báo và liên hệ với bạn.`,
                [
                    {
                        text: 'Theo dõi đơn hàng',
                        onPress: () => {
                            // Navigate to JobTracking screen
                            navigation.navigate('JobTracking', {
                                bookingId: bookingResult.bookingId,
                            });
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('❌ Error in accept bid flow:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể chấp nhận báo giá';
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setAcceptingBidId(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleBidCardPress = async (bid) => {
        if (bid.status === 'accepted') {
            try {
                console.log('🔍 Fetching booking for accepted bid:', bid.bidId);
                
                // Use API to get booking by bidId
                const booking = await getBookingByBidId(bid.bidId);
                
                if (booking && booking.bookingId) {
                    console.log('✅ Found booking:', booking.bookingId);
                    navigation.navigate('JobTracking', {
                        bookingId: booking.bookingId,
                    });
                } else {
                    console.warn('⚠️ No booking found for bid:', bid.bidId);
                    Alert.alert('Thông báo', 'Không tìm thấy thông tin đơn hàng');
                }
            } catch (error) {
                console.error('❌ Error fetching booking:', error);
                Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { text: 'Chờ duyệt', color: '#FF9800', icon: 'time' },
            accepted: { text: 'Đã chấp nhận', color: '#4CAF50', icon: 'checkmark-circle' },
            rejected: { text: 'Đã từ chối', color: '#F44336', icon: 'close-circle' },
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        
        return (
            <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
                <Ionicons name={config.icon} size={16} color={config.color} />
                <Text style={[styles.statusText, { color: config.color }]}>
                    {config.text}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Danh sách báo giá</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Báo giá</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Job Info */}
                <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>{jobTitle}</Text>
                    <Text style={styles.bidsCount}>
                        {bids.length} báo giá đã nhận
                    </Text>
                </View>

                {bids.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Chưa có báo giá nào</Text>
                        <Text style={styles.emptySubtext}>
                            Các thợ sẽ gửi báo giá cho công việc của bạn
                        </Text>
                    </View>
                ) : (
                    <View style={styles.bidsContainer}>
                        {bids.map((bid, index) => {
                            const worker = workersInfo[bid.workerId] || {};
                            const isLowestBid = index === 0;
                            const isAccepted = bid.status === 'accepted';
                            
                            const CardWrapper = isAccepted ? TouchableOpacity : View;
                            
                            return (
                                <CardWrapper
                                    key={bid.bidId}
                                    style={[
                                        styles.bidCard,
                                        isLowestBid && styles.lowestBidCard,
                                        isAccepted && styles.acceptedBidCard,
                                    ]}
                                    onPress={isAccepted ? () => handleBidCardPress(bid) : undefined}
                                    activeOpacity={isAccepted ? 0.7 : 1}
                                >
                                    {isLowestBid && (
                                        <View style={styles.lowestBadge}>
                                            <Ionicons name="trophy" size={16} color="#FFD700" />
                                            <Text style={styles.lowestText}>Giá tốt nhất</Text>
                                        </View>
                                    )}

                                    {/* Worker Info */}
                                    <View style={styles.workerSection}>
                                        <View style={styles.workerAvatar}>
                                            <Ionicons name="person" size={32} color="#FF6B35" />
                                        </View>
                                        <View style={styles.workerInfo}>
                                            <Text style={styles.workerName}>
                                                {worker.fullName || 'Thợ sửa chữa'}
                                            </Text>
                                            {worker.bio && (
                                                <Text style={styles.workerBio} numberOfLines={2}>
                                                    {worker.bio}
                                                </Text>
                                            )}
                                            <View style={styles.workerStats}>
                                                <View style={styles.statItem}>
                                                    <Ionicons name="star" size={14} color="#FFD700" />
                                                    <Text style={styles.statText}>
                                                        {worker.ratingAvg?.toFixed(1) || '0.0'}
                                                    </Text>
                                                </View>
                                                <View style={styles.statItem}>
                                                    <Ionicons name="briefcase" size={14} color="#666" />
                                                    <Text style={styles.statText}>
                                                        {worker.completedJobs || 0} việc
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Bid Details */}
                                    <View style={styles.bidDetails}>
                                        <View style={styles.priceSection}>
                                            <Text style={styles.priceLabel}>Giá đề nghị</Text>
                                            <Text style={styles.priceAmount}>
                                                {bid.amount.toLocaleString('vi-VN')}đ
                                            </Text>
                                        </View>

                                        {bid.estimatedHours && (
                                            <View style={styles.detailRow}>
                                                <Ionicons name="time-outline" size={16} color="#666" />
                                                <Text style={styles.detailText}>
                                                    Hoàn thành trong {bid.estimatedHours} giờ
                                                </Text>
                                            </View>
                                        )}

                                        {bid.message && (
                                            <View style={styles.messageBox}>
                                                <Ionicons name="chatbubble-outline" size={16} color="#666" />
                                                <Text style={styles.messageText}>{bid.message}</Text>
                                            </View>
                                        )}

                                        <View style={styles.bidFooter}>
                                            {getStatusBadge(bid.status)}
                                            <Text style={styles.dateText}>
                                                {formatDate(bid.createdAt)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Accept Button */}
                                    {bid.status === 'pending' && (
                                        <TouchableOpacity
                                            style={[
                                                styles.acceptButton,
                                                acceptingBidId === bid.bidId && styles.acceptButtonDisabled,
                                            ]}
                                            disabled={acceptingBidId === bid.bidId}
                                            onPress={() => handleAcceptBid(bid)}
                                        >
                                            {acceptingBidId === bid.bidId ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <>
                                                    <Ionicons name="checkmark-circle" size={20} color="white" />
                                                    <Text style={styles.acceptButtonText}>
                                                        Chấp nhận báo giá
                                                    </Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    
                                    {/* Tracking hint for accepted bids */}
                                    {isAccepted && (
                                        <View style={styles.trackingHint}>
                                            <Ionicons name="navigate" size={16} color="#4CAF50" />
                                            <Text style={styles.trackingHintText}>
                                                Nhấn vào để theo dõi tiến trình
                                            </Text>
                                        </View>
                                    )}
                                </CardWrapper>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    jobInfo: {
        backgroundColor: 'white',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    bidsCount: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    bidsContainer: {
        padding: 15,
        gap: 15,
    },
    bidCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lowestBidCard: {
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    acceptedBidCard: {
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    lowestBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFF9E6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    lowestText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#F9A825',
    },
    workerSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    workerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF6B3520',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    workerInfo: {
        flex: 1,
    },
    workerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    workerBio: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        lineHeight: 18,
    },
    workerStats: {
        flexDirection: 'row',
        gap: 15,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: '#666',
    },
    bidDetails: {
        gap: 12,
    },
    priceSection: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    priceLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    priceAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
    },
    messageBox: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
    },
    messageText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    bidFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FF6B35',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 15,
    },
    acceptButtonDisabled: {
        opacity: 0.6,
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    trackingHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
    },
    trackingHintText: {
        fontSize: 13,
        color: '#4CAF50',
        fontWeight: '600',
    },
});
