import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';

// Customer Screens
import HomeScreen from '../screens/HomeScreen';
import AIDiagnosisScreen from '../screens/AIDiagnosisScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import TechnicianListScreen from '../screens/TechnicianListScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import BookingsScreen from '../screens/BookingsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookingTypeScreen from '../screens/BookingTypeScreen';
import NearbyTechniciansScreen from '../screens/NearbyTechniciansScreen';
import InstantBookingScreen from '../screens/InstantBookingScreen';
import InstantBookingConfirmationScreen from '../screens/InstantBookingConfirmationScreen';

// Technician Screens
import TechnicianHomeScreen from '../screens/TechnicianHomeScreen';
import TechnicianProfileScreen from '../screens/TechnicianProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

// Auth Navigator
function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
    );
}

// Home Stack Navigator (Customer)
function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
            <Stack.Screen name="AIDiagnosis" component={AIDiagnosisScreen} />
            <Stack.Screen name="BookingType" component={BookingTypeScreen} />
            <Stack.Screen name="NearbyTechnicians" component={NearbyTechniciansScreen} />
            <Stack.Screen name="InstantBooking" component={InstantBookingScreen} />
            <Stack.Screen name="InstantBookingConfirmation" component={InstantBookingConfirmationScreen} />
            <Stack.Screen name="TechnicianList" component={TechnicianListScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
            <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
        </Stack.Navigator>
    );
}

// Bookings Stack Navigator
function BookingsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Bookings" component={BookingsScreen} />
        </Stack.Navigator>
    );
}

// Messages Stack Navigator
function MessagesStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Messages" component={MessagesScreen} />
        </Stack.Navigator>
    );
}

// Profile Stack Navigator
function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
}

// AI Camera Screen - Direct to AI Diagnosis
function AICameraScreen() {
    return null; // This is just a placeholder, navigation happens in tabBarButton
}

// Bottom Tab Navigator for Customer
function CustomerTabs() {
    const { View, TouchableOpacity, StyleSheet } = require('react-native');

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'BookingsTab') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'AICameraTab') {
                        // Icon đặc biệt cho camera tab
                        return null; // Sẽ được custom trong tabBarButton
                    } else if (route.name === 'MessagesTab') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'ProfileTab') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#2196F3',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{ tabBarLabel: 'Trang Chủ' }}
            />
            <Tab.Screen
                name="BookingsTab"
                component={BookingsStack}
                options={{ tabBarLabel: 'Lịch Hẹn' }}
            />

            {/* Nút Camera AI nổi bật ở giữa */}
            <Tab.Screen
                name="AICameraTab"
                component={AICameraScreen}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('HomeTab', {
                            screen: 'AIDiagnosis'
                        });
                    },
                })}
                options={{
                    tabBarLabel: '',
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            {...props}
                            style={{
                                top: -20,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{
                                width: 70,
                                height: 70,
                                borderRadius: 35,
                                backgroundColor: '#2196F3',
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.3,
                                shadowRadius: 4.65,
                                elevation: 8,
                                borderWidth: 4,
                                borderColor: '#fff',
                            }}>
                                <Ionicons name="camera" size={32} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />

            <Tab.Screen
                name="MessagesTab"
                component={MessagesStack}
                options={{ tabBarLabel: 'Tin Nhắn' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStack}
                options={{ tabBarLabel: 'Tài Khoản' }}
            />
        </Tab.Navigator>
    );
}

// Technician Stack Navigator
function TechnicianStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TechnicianHome" component={TechnicianHomeScreen} />
            <Stack.Screen name="TechnicianProfile" component={TechnicianProfileScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
        </Stack.Navigator>
    );
}

// Bottom Tab Navigator for Technician
function TechnicianTabs() {
    const { View, TouchableOpacity, StyleSheet } = require('react-native');

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'TechnicianHomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'TechnicianJobsTab') {
                        iconName = focused ? 'hammer' : 'hammer-outline';
                    } else if (route.name === 'TechnicianMessagesTab') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'TechnicianProfileTab') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#FF6B35',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen
                name="TechnicianHomeTab"
                component={TechnicianStack}
                options={{ tabBarLabel: 'Trang Chủ' }}
            />
            <Tab.Screen
                name="TechnicianJobsTab"
                component={TechnicianStack}
                options={{ tabBarLabel: 'Công Việc' }}
            />
            <Tab.Screen
                name="TechnicianMessagesTab"
                component={TechnicianStack}
                options={{ tabBarLabel: 'Tin Nhắn' }}
            />
            <Tab.Screen
                name="TechnicianProfileTab"
                component={TechnicianStack}
                options={{ tabBarLabel: 'Tài Khoản' }}
            />
        </Tab.Navigator>
    );
}

// Main App Navigator
export default function AppNavigator() {
    const auth = useAuth();

    return (
        <NavigationContainer>
            {!auth.isAuthenticated ? (
                <AuthNavigator />
            ) : auth.isCustomer ? (
                <CustomerTabs />
            ) : (
                <TechnicianTabs />
            )}
        </NavigationContainer>
    );
}
