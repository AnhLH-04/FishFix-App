import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colors';

export default function JobsScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('available'); // available, accepted, completed

    const availableJobs = [
        {
            id: 1,
            service: 'Sửa máy lạnh',
            address: '123 Nguyễn Văn Linh, Q.7',
            customer: 'Nguyễn Văn A',
            time: '14:00 - Hôm nay',
            price: 500000,
            distance: '2.5 km',
            description: 'Máy lạnh không lạnh, có tiếng kêu lạ',
            urgent: true,
        },
        {
            id: 2,
            service: 'Bảo trì tủ lạnh',
            address: '456 Lê Văn Việt, Q.9',
            customer: 'Trần Thị B',
            time: '16:00 - Hôm nay',
            price: 350000,
            distance: '4.2 km',
            description: 'Bảo trì định kỳ, vệ sinh tủ lạnh',
            urgent: false,
        },
        {
            id: 3,
            service: 'Sửa máy giặt',
            address: '789 Võ Văn Ngân, Thủ Đức',
            customer: 'Lê Văn C',
            time: '09:00 - Mai',
            price: 450000,
            distance: '5.8 km',
            description: 'Máy giặt không vắt được, còi báo lỗi',
            urgent: false,
        },
    ];

    const acceptedJobs = [
        {
            id: 4,
            service: 'Sửa bếp gas',
            address: '321 Điện Biên Phủ, Q.3',
            customer: 'Phạm Thị D',
            time: '10:00 - Mai',
            price: 300000,
            distance: '3.5 km',
            description: 'Bếp gas không đánh lửa được',
            status: 'accepted',
        },
    ];

    const tabs = [
        { key: 'available', label: 'Có sẵn', icon: 'search', count: availableJobs.length },
        { key: 'accepted', label: 'Đã nhận', icon: 'checkmark-circle', count: acceptedJobs.length },
        { key: 'completed', label: 'Hoàn thành', icon: 'trophy', count: 12 },
    ];

    const renderJobCard = (job, showActions = true) => (
        <View key={job.id} style={styles.jobCard}>
            {job.urgent && (
                <View style={styles.urgentBadge}>
                    <Ionicons name="alert-circle" size={14} color="white" />
                    <Text style={styles.urgentText}>Gấp</Text>
                </View>
            )}

            <View style={styles.jobHeader}>
                <Text style={styles.jobService}>{job.service}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>{job.price ? job.price.toLocaleString('vi-VN') : '0'}đ</Text>
                </View>
            </View>

            <View style={styles.jobInfo}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.jobInfoText}>{job.address}</Text>
            </View>

            <View style={styles.jobInfo}>
                <Ionicons name="navigate-outline" size={16} color="#666" />
                <Text style={styles.jobInfoText}>{job.distance}</Text>
            </View>

            <View style={styles.jobInfo}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.jobInfoText}>{job.time}</Text>
            </View>

            <View style={styles.jobInfo}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.jobInfoText}>{job.customer}</Text>
            </View>

            <Text style={styles.jobDescription}>{job.description}</Text>

            {showActions && (
                <View style={styles.jobActions}>
                    <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() => navigation.navigate('JobDetail', { job })}
                    >
                        <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
                    </TouchableOpacity>
                    {activeTab === 'available' && (
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => handleAcceptJob(job)}
                        >
                            <Text style={styles.acceptButtonText}>Nhận việc</Text>
                        </TouchableOpacity>
                    )}
                    {activeTab === 'accepted' && (
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => navigation.navigate('JobInProgress', { job })}
                        >
                            <Text style={styles.startButtonText}>Bắt đầu</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    const handleAcceptJob = (job) => {
        // Logic nhận việc
        alert(`Đã nhận việc: ${job.service}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Công việc</Text>
                <TouchableOpacity onPress={() => navigation.navigate('JobFilter')}>
                    <Ionicons name="filter" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm công việc..."
                    placeholderTextColor="#999"
                />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={20}
                            color={activeTab === tab.key ? '#FF6B35' : '#999'}
                        />
                        <Text
                            style={[
                                styles.tabLabel,
                                activeTab === tab.key && styles.activeTabLabel,
                            ]}
                        >
                            {tab.label}
                        </Text>
                        <View
                            style={[
                                styles.countBadge,
                                activeTab === tab.key && styles.activeCountBadge,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.countText,
                                    activeTab === tab.key && styles.activeCountText,
                                ]}
                            >
                                {tab.count}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Jobs List */}
            <ScrollView style={styles.jobsList} showsVerticalScrollIndicator={false}>
                {activeTab === 'available' &&
                    availableJobs.map((job) => renderJobCard(job, true))}
                {activeTab === 'accepted' &&
                    acceptedJobs.map((job) => renderJobCard(job, true))}
                {activeTab === 'completed' && (
                    <View style={styles.emptyState}>
                        <Ionicons name="trophy-outline" size={80} color="#DDD" />
                        <Text style={styles.emptyText}>Chưa có công việc hoàn thành</Text>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 20,
        marginBottom: 10,
        paddingHorizontal: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        fontSize: 14,
        color: '#333',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 12,
        gap: 5,
    },
    activeTab: {
        backgroundColor: '#FF6B3520',
    },
    tabLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    activeTabLabel: {
        color: '#FF6B35',
        fontWeight: 'bold',
    },
    countBadge: {
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    activeCountBadge: {
        backgroundColor: '#FF6B35',
    },
    countText: {
        fontSize: 11,
        color: '#666',
        fontWeight: 'bold',
    },
    activeCountText: {
        color: 'white',
    },
    jobsList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    jobCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        position: 'relative',
    },
    urgentBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF3B30',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    urgentText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingRight: 50,
    },
    jobService: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    priceContainer: {
        backgroundColor: '#4CAF5020',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    jobInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    jobInfoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    jobDescription: {
        fontSize: 13,
        color: '#999',
        marginTop: 8,
        marginBottom: 12,
        lineHeight: 18,
    },
    jobActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    viewDetailsButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF6B35',
        alignItems: 'center',
    },
    viewDetailsText: {
        color: '#FF6B35',
        fontSize: 14,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#FF6B35',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    startButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    startButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 20,
        fontSize: 16,
        color: '#999',
    },
});
