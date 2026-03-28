import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import workerService from '../../services/workerService';
import apiClient from '../../services/apiClient';

export default function ScheduleScreen({ navigation }) {
    const { user } = useAuth();
    const [rawBookings, setRawBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [workerId, setWorkerId] = useState(null);

    const normalizeStatus = (status) => {
        const value = String(status || '').toLowerCase();

        if (['completed', 'paid'].includes(value)) return 'completed';
        if (['in_progress', 'in-progress', 'arrived', 'on_the_way'].includes(value)) return 'in-progress';
        if (['confirmed', 'pending', 'assigned'].includes(value)) return 'upcoming';
        if (['cancelled', 'canceled'].includes(value)) return 'cancelled';

        return 'upcoming';
    };

    const getAddress = (booking) => {
        const jobAddress = booking?.Job?.address || booking?.address || booking?.jobAddress || '';
        const ward = booking?.Job?.ward || booking?.ward || '';
        const district = booking?.Job?.district || booking?.district || '';

        const parts = [jobAddress, ward, district].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Địa chỉ chưa cập nhật';
    };

    const parseScheduleDate = (dateString) => {
        if (!dateString) return null;

        if (dateString.includes('/')) {
            const [dd, mm, yyyy] = dateString.split('/').map(Number);
            if (!dd || !mm || !yyyy) return null;
            return new Date(yyyy, mm - 1, dd);
        }

        const parsed = new Date(dateString);
        if (Number.isNaN(parsed.getTime())) return null;
        return parsed;
    };

    const toDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateDisplay = (date) => {
        return date.toLocaleDateString('vi-VN');
    };

    const getDayLabel = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const inputDate = new Date(date);
        inputDate.setHours(0, 0, 0, 0);

        if (inputDate.getTime() === today.getTime()) return 'Hôm nay';
        if (inputDate.getTime() === tomorrow.getTime()) return 'Ngày mai';

        return inputDate.toLocaleDateString('vi-VN', { weekday: 'long' });
    };

    const formatTime = (timeValue) => {
        if (!timeValue) return '--:--';
        if (timeValue.length >= 5) return timeValue.slice(0, 5);
        return timeValue;
    };

    const schedule = useMemo(() => {
        const grouped = {};

        rawBookings
            .forEach((booking) => {
                const dateValue = parseScheduleDate(booking?.scheduledDate);
                const safeDate = dateValue || new Date();
                const dateKey = toDateKey(safeDate);

                if (!grouped[dateKey]) {
                    grouped[dateKey] = {
                        dateKey,
                        dateObj: safeDate,
                        date: formatDateDisplay(safeDate),
                        day: getDayLabel(safeDate),
                        jobs: [],
                    };
                }

                grouped[dateKey].jobs.push({
                    id: booking?.bookingId || booking?.id,
                    bookingId: booking?.bookingId,
                    jobId: booking?.jobId,
                    rawBooking: booking,
                    time: formatTime(booking?.scheduledTimeStart),
                    service: booking?.Job?.title || booking?.serviceName || 'Dịch vụ sửa chữa',
                    customer: booking?.Customer?.fullName || booking?.customerName || 'Khách hàng',
                    address: getAddress(booking),
                    status: normalizeStatus(booking?.status),
                });
            });

        const sortedDays = Object.values(grouped).sort((a, b) => a.dateObj - b.dateObj);
        sortedDays.forEach((day) => {
            day.jobs.sort((a, b) => a.time.localeCompare(b.time));
        });

        return sortedDays;
    }, [rawBookings]);

    const fetchWorkerId = useCallback(async () => {
        if (!user?.id) return null;

        if (user?.workerId) {
            setWorkerId(user.workerId);
            return user.workerId;
        }

        try {
            const profile = await workerService.getWorkerByUserId(user.id);
            const resolvedWorkerId = profile?.workerId || user.id;
            setWorkerId(resolvedWorkerId);
            return resolvedWorkerId;
        } catch (error) {
            console.warn('⚠️ Không lấy được workerId từ profile, fallback user.id');
            setWorkerId(user.id);
            return user.id;
        }
    }, [user?.id, user?.workerId]);

    const fetchSchedule = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);

            const resolvedWorkerId = await fetchWorkerId();
            if (!resolvedWorkerId) {
                setRawBookings([]);
                return;
            }

            const response = await apiClient.get('/api/bookings', {
                params: { workerId: resolvedWorkerId },
            });

            let bookings = response?.data || [];

            // Fallback: một số môi trường map workerId = userId
            if (bookings.length === 0 && user?.id && resolvedWorkerId !== user.id) {
                const fallbackResponse = await apiClient.get('/api/bookings', {
                    params: { workerId: user.id },
                });
                bookings = fallbackResponse?.data || [];
            }

        } catch (error) {
            console.error('❌ Lỗi tải lịch làm việc:', error);
            if (!silent) {
                Alert.alert('Lỗi', 'Không thể tải lịch làm việc. Vui lòng thử lại.');
            }
        } finally {
            if (!silent) setLoading(false);
            setRefreshing(false);
        }
    }, [fetchWorkerId, user?.id]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSchedule(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#4CAF50';
            case 'in-progress':
                return '#2196F3';
            case 'upcoming':
                return '#FF9800';
            case 'cancelled':
                return '#F44336';
            default:
                return '#999';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Hoàn thành';
            case 'in-progress':
                return 'Đang làm';
            case 'upcoming':
                return 'Sắp tới';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return '';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lịch làm việc</Text>
                <TouchableOpacity>
                    <Ionicons name="calendar-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Đang tải lịch làm việc...</Text>
                </View>
            ) : (
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {schedule.map((daySchedule, dayIndex) => (
                    <View key={daySchedule.dateKey || dayIndex} style={styles.daySection}>
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayText}>{daySchedule.day}</Text>
                            <Text style={styles.dateText}>{daySchedule.date}</Text>
                            <View style={styles.jobCountBadge}>
                                <Text style={styles.jobCountText}>
                                    {daySchedule.jobs.length} công việc
                                </Text>
                            </View>
                        </View>

                        {daySchedule.jobs.map((job) => (
                            <TouchableOpacity
                                key={job.id}
                                style={styles.jobCard}
                                onPress={() =>
                                    navigation.navigate('JobDetail', {
                                        jobId: job.jobId,
                                        job: job.rawBooking?.Job || job.rawBooking,
                                        booking: job.rawBooking,
                                    })
                                }
                            >
                                <View style={styles.timeSection}>
                                    <Ionicons name="time" size={20} color="#FF6B35" />
                                    <Text style={styles.timeText}>{job.time}</Text>
                                </View>

                                <View style={styles.jobContent}>
                                    <View style={styles.jobHeader}>
                                        <Text style={styles.jobService}>{job.service}</Text>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                {
                                                    backgroundColor:
                                                        getStatusColor(job.status) + '20',
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: getStatusColor(job.status) },
                                                ]}
                                            >
                                                {getStatusText(job.status)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.jobInfo}>
                                        <Ionicons name="person-outline" size={16} color="#666" />
                                        <Text style={styles.jobInfoText}>{job.customer}</Text>
                                    </View>

                                    <View style={styles.jobInfo}>
                                        <Ionicons name="location-outline" size={16} color="#666" />
                                        <Text style={styles.jobInfoText}>{job.address}</Text>
                                    </View>

                                    <View style={styles.jobActions}>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <Ionicons name="call" size={18} color="#4CAF50" />
                                            <Text style={styles.actionText}>Gọi</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <Ionicons name="navigate" size={18} color="#2196F3" />
                                            <Text style={styles.actionText}>Chỉ đường</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <Ionicons name="chatbubble" size={18} color="#FF9800" />
                                            <Text style={styles.actionText}>Nhắn tin</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                {/* Empty State */}
                {schedule.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={80} color="#DDD" />
                        <Text style={styles.emptyText}>Chưa có lịch làm việc</Text>
                        <Text style={styles.emptySubText}>Kéo xuống để tải lại dữ liệu</Text>
                    </View>
                )}
            </ScrollView>
            )}
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
    daySection: {
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dayText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    dateText: {
        fontSize: 14,
        color: '#999',
        flex: 1,
    },
    jobCountBadge: {
        backgroundColor: '#FF6B3520',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    jobCountText: {
        fontSize: 12,
        color: '#FF6B35',
        fontWeight: '600',
    },
    jobCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    timeSection: {
        alignItems: 'center',
        paddingRight: 15,
        borderRightWidth: 2,
        borderRightColor: '#FF6B35',
        minWidth: 70,
    },
    timeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
    },
    jobContent: {
        flex: 1,
        paddingLeft: 15,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    jobService: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    jobInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    jobInfoText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    jobActions: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 5,
    },
    actionText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        marginTop: 20,
        fontSize: 16,
        color: '#999',
    },
    emptySubText: {
        marginTop: 8,
        fontSize: 13,
        color: '#BBB',
    },
});
