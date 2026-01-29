import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

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
import TechnicianHomeScreen from '../screens/technician/TechnicianHomeScreen';
import TechnicianProfileScreen from '../screens/technician/TechnicianProfileScreen';
import JobsScreen from '../screens/technician/JobsScreen';
import JobDetailScreen from '../screens/technician/JobDetailScreen';
import EarningsScreen from '../screens/technician/EarningsScreen';
import ScheduleScreen from '../screens/technician/ScheduleScreen';
import IncomingRequestScreen from '../screens/technician/IncomingRequestScreen';
import ActiveJobScreen from '../screens/technician/ActiveJobScreen';
import JobCompletionScreen from '../screens/technician/JobCompletionScreen';
import ReviewsScreen from '../screens/technician/ReviewsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

// Auth Navigator
function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
            <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
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
                                paddingLeft: 5,
                                paddingTop: 5,
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
                                <Ionicons name="sparkles" size={32} color="#fff" />
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
            <Stack.Screen name="Jobs" component={JobsScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="Earnings" component={EarningsScreen} />
            <Stack.Screen name="Schedule" component={ScheduleScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
            <Stack.Screen name="IncomingRequest" component={IncomingRequestScreen} />
            <Stack.Screen name="ActiveJob" component={ActiveJobScreen} />
            <Stack.Screen name="JobCompletion" component={JobCompletionScreen} />
            <Stack.Screen name="Reviews" component={ReviewsScreen} />
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
                component={JobsScreen}
                options={{ tabBarLabel: 'Công Việc' }}
            />
            <Tab.Screen
                name="TechnicianMessagesTab"
                component={TechnicianStack}
                options={{ tabBarLabel: 'Tin Nhắn' }}
            />
            <Tab.Screen
                name="TechnicianProfileTab"
                component={TechnicianProfileScreen}
                options={{ tabBarLabel: 'Tài Khoản' }}
            />
        </Tab.Navigator>
    );
}

// Main App Navigator
export default function AppNavigator() {
    const auth = useAuth();

    // Hiển thị loading screen khi đang check auth
    if (auth.loading) {
        return (
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Loading">
                        {() => (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
                                <Ionicons name="construct" size={60} color="#667eea" />
                                <Text style={{ marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#333' }}>Fish Fix Services</Text>
                                <Text style={{ marginTop: 10, fontSize: 14, color: '#666' }}>Đang tải...</Text>
                            </View>
                        )}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

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
