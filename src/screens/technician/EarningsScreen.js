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

export default function EarningsScreen({ navigation }) {
    const stats = [
        { label: 'Hôm nay', value: '850.000đ', color: '#4CAF50', icon: 'today' },
        { label: 'Tuần này', value: '4.500.000đ', color: '#2196F3', icon: 'calendar' },
        { label: 'Tháng này', value: '18.200.000đ', color: '#FF6B35', icon: 'stats-chart' },
    ];

    const transactions = [
        {
            id: 1,
            date: '30/12/2025',
            service: 'Sửa máy lạnh',
            customer: 'Nguyễn Văn A',
            amount: 500000,
            status: 'completed',
        },
        {
            id: 2,
            date: '30/12/2025',
            service: 'Bảo trì tủ lạnh',
            customer: 'Trần Thị B',
            amount: 350000,
            status: 'completed',
        },
        {
            id: 3,
            date: '29/12/2025',
            service: 'Sửa máy giặt',
            customer: 'Lê Văn C',
            amount: 450000,
            status: 'completed',
        },
        {
            id: 4,
            date: '29/12/2025',
            service: 'Sửa bếp gas',
            customer: 'Phạm Thị D',
            amount: 300000,
            status: 'pending',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thu nhập</Text>
                <TouchableOpacity>
                    <Ionicons name="download-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View
                            key={index}
                            style={[styles.statCard, { borderLeftColor: stat.color }]}
                        >
                            <Ionicons name={stat.icon} size={24} color={stat.color} />
                            <Text style={styles.statLabel}>{stat.label}</Text>
                            <Text style={[styles.statValue, { color: stat.color }]}>
                                {stat.value}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Withdraw Button */}
                <TouchableOpacity style={styles.withdrawButton}>
                    <Ionicons name="wallet-outline" size={24} color="white" />
                    <Text style={styles.withdrawText}>Rút tiền</Text>
                </TouchableOpacity>

                {/* Transactions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
                    {transactions.map((transaction) => (
                        <View key={transaction.id} style={styles.transactionCard}>
                            <View style={styles.transactionLeft}>
                                <View
                                    style={[
                                        styles.transactionIcon,
                                        {
                                            backgroundColor:
                                                transaction.status === 'completed'
                                                    ? '#4CAF5020'
                                                    : '#FF980020',
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={
                                            transaction.status === 'completed'
                                                ? 'checkmark-circle'
                                                : 'time'
                                        }
                                        size={24}
                                        color={
                                            transaction.status === 'completed'
                                                ? '#4CAF50'
                                                : '#FF9800'
                                        }
                                    />
                                </View>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionService}>
                                        {transaction.service}
                                    </Text>
                                    <Text style={styles.transactionCustomer}>
                                        {transaction.customer}
                                    </Text>
                                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                                </View>
                            </View>
                            <View style={styles.transactionRight}>
                                <Text style={styles.transactionAmount}>
                                    +{transaction.amount ? transaction.amount.toLocaleString('vi-VN') : '0'}đ
                                </Text>
                                <Text
                                    style={[
                                        styles.transactionStatus,
                                        {
                                            color:
                                                transaction.status === 'completed'
                                                    ? '#4CAF50'
                                                    : '#FF9800',
                                        },
                                    ]}
                                >
                                    {transaction.status === 'completed'
                                        ? 'Hoàn thành'
                                        : 'Đang xử lý'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
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
    statsContainer: {
        padding: 20,
        gap: 15,
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statLabel: {
        fontSize: 14,
        color: '#999',
        marginTop: 10,
        marginBottom: 5,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    withdrawButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 18,
        borderRadius: 12,
        gap: 10,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    withdrawText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: 'white',
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    transactionLeft: {
        flexDirection: 'row',
        flex: 1,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionService: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    transactionCustomer: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: '#999',
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 4,
    },
    transactionStatus: {
        fontSize: 12,
        fontWeight: '500',
    },
});
