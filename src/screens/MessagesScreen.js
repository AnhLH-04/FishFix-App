import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MessagesScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const messages = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            avatar: '👨‍🔧',
            lastMessage: 'Tôi sẽ đến đúng giờ nhé!',
            time: '10:30',
            unread: 2,
            online: true,
        },
        {
            id: 2,
            name: 'Trần Thị B',
            avatar: '👩‍🔧',
            lastMessage: 'Cảm ơn bạn đã đặt lịch',
            time: 'Hôm qua',
            unread: 0,
            online: false,
        },
        {
            id: 3,
            name: 'Lê Văn C',
            avatar: '🧑‍🔧',
            lastMessage: 'Máy giặt đã hoạt động tốt rồi',
            time: '20/10',
            unread: 0,
            online: false,
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tin Nhắn</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="create-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm tin nhắn..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {messages.length > 0 ? (
                    <View style={styles.messagesList}>
                        {messages.map((message) => (
                            <TouchableOpacity key={message.id} style={styles.messageCard}>
                                <View style={styles.avatarContainer}>
                                    <Text style={styles.avatar}>{message.avatar}</Text>
                                    {message.online && <View style={styles.onlineDot} />}
                                </View>

                                <View style={styles.messageContent}>
                                    <View style={styles.messageHeader}>
                                        <Text style={styles.name}>{message.name}</Text>
                                        <Text style={styles.time}>{message.time}</Text>
                                    </View>
                                    <View style={styles.messageBody}>
                                        <Text
                                            style={[
                                                styles.lastMessage,
                                                message.unread > 0 && styles.unreadMessage,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {message.lastMessage}
                                        </Text>
                                        {message.unread > 0 && (
                                            <View style={styles.unreadBadge}>
                                                <Text style={styles.unreadText}>{message.unread}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
                        <Text style={styles.emptyText}>
                            Tin nhắn với thợ sửa chữa sẽ hiển thị ở đây
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* AI Chatbot Button */}
            <TouchableOpacity style={styles.chatbotButton}>
                <View style={styles.chatbotIcon}>
                    <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
                </View>
                <View style={styles.chatbotText}>
                    <Text style={styles.chatbotTitle}>AI Hỗ Trợ</Text>
                    <Text style={styles.chatbotSubtitle}>Luôn sẵn sàng trợ giúp 24/7</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#2196F3" />
            </TouchableOpacity>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingLeft: 10,
        fontSize: 15,
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 20,
    },
    messageCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        fontSize: 48,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#fff',
    },
    messageContent: {
        flex: 1,
        justifyContent: 'center',
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    messageBody: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        flex: 1,
        fontSize: 14,
        color: '#666',
    },
    unreadMessage: {
        fontWeight: '600',
        color: '#333',
    },
    unreadBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    unreadText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#fff',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
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
    },
    chatbotButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    chatbotIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    chatbotText: {
        flex: 1,
    },
    chatbotTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    chatbotSubtitle: {
        fontSize: 12,
        color: '#666',
    },
});

export default MessagesScreen;
