import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getJobsByCustomer } from '../services/jobService';

const BookingsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Fetch jobs từ API
    useEffect(() => {
        console.log('📱 BookingsScreen mounted');
        console.log('👤 Current user:', user);
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching jobs for userId:', user?.id);
            
            if (user?.id) {
                const data = await getJobsByCustomer(user.id);
                setJobs(data || []);
            } else {
                console.log('❌ No userId found');
            }
        } catch (error) {
            console.error('❌ Error fetching jobs:', error);
            console.error('Error details:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchJobs();
        setRefreshing(false);
    };

    // Lọc jobs theo tab
    const getFilteredJobs = () => {
        if (activeTab === 'all') {
            return jobs;
        }
        if (activeTab === 'searching') {
            return jobs.filter(job => job.status === 'open' || job.status === 'pending' || job.status === 'bidding');
        }
        if (activeTab === 'inProgress') {
            return jobs.filter(job => job.status === 'accepted' || job.status === 'in_progress');
        }
        if (activeTab === 'rebook') {
            return jobs.filter(job => job.status === 'completed');
        }
        return jobs;
    };

    const filteredJobs = getFilteredJobs();

    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
            case 'pending':
            case 'bidding':
                return '#FF9800'; // Đang tìm
            case 'accepted':
                return '#2196F3'; // Đang tiến hành
            case 'in_progress':
            case 'completed':
                return '#4CAF50'; // Hoàn thành
            case 'cancelled':
                return '#F44336'; // Đã hủy
            default:
                return '#999';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'open':
                return 'Đang tìm thợ';
            case 'pending':
                return 'Chờ xác nhận';
            case 'bidding':
                return 'Đang tìm thợ';
            case 'accepted':
                return 'Đã chấp nhận';
            case 'in_progress':
                return 'Đang tiến hành';
            case 'completed':
                return 'Hoàn thành';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const renderBookingCard = (job) => (
        <TouchableOpacity 
            key={job.jobId} 
            style={styles.bookingCard}
            onPress={() => navigation.navigate('JobDetail', { jobId: job.jobId })}
        >
            <View style={styles.bookingHeader}>
                <View style={styles.jobInfo}>
                    <Text style={styles.jobId}>#{job.jobId}</Text>
                    <Text style={styles.service}>{job.title || job.description}</Text>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(job.status) + '20' },
                    ]}
                >
                    <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                        {getStatusText(job.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.bookingDetails}>
                {job.preferredDate && (
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color="#666" />
                        <Text style={styles.detailText}>
                            {new Date(job.preferredDate).toLocaleDateString('vi-VN')}
                        </Text>
                    </View>
                )}
                {(job.preferredTimeStart && job.preferredTimeEnd) && (
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={18} color="#666" />
                        <Text style={styles.detailText}>
                            {job.preferredTimeStart.substring(0, 5)} - {job.preferredTimeEnd.substring(0, 5)}
                        </Text>
                    </View>
                )}
                {job.estimatedBudget && (
                    <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={18} color="#666" />
                        <Text style={styles.detailText}>
                            {job.estimatedBudget.toLocaleString('vi-VN')}đ
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.bookingActions}>
                {(job.status === 'open' || job.status === 'bidding') && (
                    <TouchableOpacity 
                        style={[styles.actionBtnPrimary, { flex: 1 }]}
                        onPress={() => navigation.navigate('JobDetail', { jobId: job.jobId })}
                    >
                        <Ionicons name="eye-outline" size={18} color="#fff" />
                        <Text style={styles.actionBtnPrimaryText}>Xem báo giá</Text>
                    </TouchableOpacity>
                )}
                {(job.status === 'accepted' || job.status === 'in_progress') && (
                    <TouchableOpacity style={[styles.actionBtnPrimary, { flex: 1 }]}>
                        <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
                        <Text style={styles.actionBtnPrimaryText}>Nhắn tin</Text>
                    </TouchableOpacity>
                )}
                {job.status === 'completed' && !job.rating && (
                    <TouchableOpacity style={[styles.actionBtnPrimary, { flex: 1 }]}>
                        <Ionicons name="star-outline" size={18} color="#fff" />
                        <Text style={styles.actionBtnPrimaryText}>Đánh giá</Text>
                    </TouchableOpacity>
                )}
                {job.status === 'completed' && (
                    <TouchableOpacity 
                        style={[styles.actionBtnSecondary, { flex: 1 }]}
                        onPress={() => navigation.navigate('CreateJob', { rebookJob: job })}
                    >
                        <Ionicons name="repeat-outline" size={18} color="#2196F3" />
                        <Text style={[styles.actionBtnSecondaryText, { color: '#2196F3' }]}>Đặt lại</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hoạt động</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="search-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                >
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text
                        style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}
                    >
                        Tất cả
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'searching' && styles.activeTab]}
                    onPress={() => setActiveTab('searching')}
                >
                    <Text style={[styles.tabText, activeTab === 'searching' && styles.activeTabText]}>
                        Đang tìm
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'inProgress' && styles.activeTab]}
                    onPress={() => setActiveTab('inProgress')}
                >
                    <Text style={[styles.tabText, activeTab === 'inProgress' && styles.activeTabText]}>
                        Đang tiến hành
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'rebook' && styles.activeTab]}
                    onPress={() => setActiveTab('rebook')}
                >
                    <Text style={[styles.tabText, activeTab === 'rebook' && styles.activeTabText]}>
                        Đặt lại
                    </Text>
                </TouchableOpacity>
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                </View>
            ) : (
                <ScrollView 
                    style={styles.scrollView} 
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View style={styles.bookingsList}>
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map(renderBookingCard)
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={80} color="#ccc" />
                                <Text style={styles.emptyTitle}>Chưa có hoạt động</Text>
                                <Text style={styles.emptyText}>
                                    {activeTab === 'all' && 'Bạn chưa có hoạt động nào'}
                                    {activeTab === 'searching' && 'Không có công việc đang tìm thợ'}
                                    {activeTab === 'inProgress' && 'Không có công việc đang tiến hành'}
                                    {activeTab === 'rebook' && 'Không có công việc để đặt lại'}
                                </Text>
                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={() => navigation.navigate('HomeTab')}
                                >
                                    <Text style={styles.emptyButtonText}>Tạo công việc mới</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Lịch sử Section */}
                    {activeTab === 'all' && jobs.filter(j => j.status === 'cancelled').length > 0 && (
                        <View style={styles.historySection}>
                            <Text style={styles.historyTitle}>Lịch sử</Text>
                            {jobs.filter(j => j.status === 'cancelled').map(renderBookingCard)}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f7fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
        marginRight: 8,
        minWidth: 100,
    },
    activeTab: {
        backgroundColor: '#2196F3',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#909090ff',
        whiteSpace: 'nowrap',
    },
    activeTabText: {
        color: '#000000ff',
    },
    scrollView: {
        flex: 1,
    },
    bookingsList: {
        padding: 20,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    jobInfo: {
        flex: 1,
    },
    jobId: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    technicianInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        fontSize: 40,
        marginRight: 12,
    },
    techInfo: {
        flex: 1,
    },
    techName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    service: {
        fontSize: 13,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    bookingDetails: {
        backgroundColor: '#f5f7fa',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    ratingLabel: {
        fontSize: 13,
        color: '#666',
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
    },
    bookingActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtnPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionBtnPrimaryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    actionBtnSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F44336',
    },
    actionBtnSecondaryText: {
        color: '#F44336',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    historySection: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
});

export default BookingsScreen;
