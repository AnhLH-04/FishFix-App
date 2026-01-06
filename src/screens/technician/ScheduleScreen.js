import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';

export default function ScheduleScreen({ navigation }) {
    const schedule = [
        {
            date: '31/12/2025',
            day: 'Hôm nay',
            jobs: [
                {
                    id: 1,
                    time: '09:00',
                    service: 'Sửa máy lạnh',
                    customer: 'Nguyễn Văn A',
                    address: '123 Nguyễn Văn Linh, Q.7',
                    status: 'upcoming',
                },
                {
                    id: 2,
                    time: '14:00',
                    service: 'Bảo trì tủ lạnh',
                    customer: 'Trần Thị B',
                    address: '456 Lê Văn Việt, Q.9',
                    status: 'upcoming',
                },
            ],
        },
        {
            date: '01/01/2026',
            day: 'Mai',
            jobs: [
                {
                    id: 3,
                    time: '10:00',
                    service: 'Sửa bếp gas',
                    customer: 'Lê Văn C',
                    address: '789 Võ Văn Ngân, Thủ Đức',
                    status: 'upcoming',
                },
            ],
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#4CAF50';
            case 'in-progress':
                return '#2196F3';
            case 'upcoming':
                return '#FF9800';
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

            <ScrollView showsVerticalScrollIndicator={false}>
                {schedule.map((daySchedule, dayIndex) => (
                    <View key={dayIndex} style={styles.daySection}>
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
                                onPress={() => navigation.navigate('JobDetail', { job })}
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
    daySection: {
        marginTop: 10,
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
});
