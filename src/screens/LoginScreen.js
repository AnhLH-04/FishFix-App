import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export default function LoginScreen({ route, navigation }) {
    const { role } = route.params || { role: 'customer' };
    const { login } = useAuth();

    // Tab selection: 'password' or 'phone'
    const [loginMethod, setLoginMethod] = useState('password');
    
    // For password login
    const [identifier, setIdentifier] = useState(''); // Số điện thoại hoặc email
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // For phone login
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    
    const [loading, setLoading] = useState(false);

    const handlePhoneChange = (text) => {
        // Chỉ cho phép nhập số và bắt đầu bằng 0
        const numericText = text.replace(/[^0-9]/g, '');
        if (numericText === '' || numericText.startsWith('0')) {
            setPhone(numericText);
        }
    };

    // Chuyển số điện thoại từ 0xxx sang +84xxx
    const convertToInternationalFormat = (phoneNumber) => {
        if (phoneNumber.startsWith('0')) {
            return '+84' + phoneNumber.substring(1);
        }
        return phoneNumber;
    };

    const roleConfig = {
        customer: {
            title: 'Đăng nhập Khách hàng',
            icon: 'person',
            color: Colors.primary,
            description: 'Đăng nhập để đặt lịch sửa chữa',
        },
        technician: {
            title: 'Đăng nhập Thợ sửa chữa',
            icon: 'construct',
            color: '#FF6B35',
            description: 'Đăng nhập để nhận công việc',
        },
    };

    const config = roleConfig[role];

    const handleLogin = async () => {
        if (!identifier || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);

        try {
            // Bước 1: Gọi API đăng nhập để lấy token
            const loginResponse = await authService.login(identifier, password);
            
            if (loginResponse && loginResponse.accessToken) {
                // Bước 2: Lấy thông tin user bằng token
                const userInfo = await authService.getCurrentUser();
                
                if (userInfo) {
                    // Map roleId sang role string
                    // roleId: 1 = customer, 2 = worker
                    const userRole = userInfo.roleId === 2 ? 'technician' : 'customer';
                    
                    // Lưu thông tin user và role vào context
                    const userData = {
                        id: userInfo.userId,
                        email: userInfo.email,
                        fullName: userInfo.fullName,
                        phone: userInfo.phone,
                        roleId: userInfo.roleId,
                    };
                    
                    login(userData, userRole);
                    // Không cần Alert ở đây, navigation sẽ tự động chuyển
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOTP = async () => {
        if (!phone || phone.length < 10) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại hợp lệ (VD: 0901234567)');
            return;
        }

        setLoading(true);

        try {
            // Chuyển đổi số điện thoại sang định dạng quốc tế +84
            const internationalPhone = convertToInternationalFormat(phone);
            const response = await authService.requestPhoneLogin(internationalPhone);
            Alert.alert('Thành công', response.message || 'Mã OTP đã được gửi đến số điện thoại của bạn');
            setOtpSent(true);
            
            // Start countdown
            const expiresIn = response.expiresInSeconds || 60;
            setCountdown(expiresIn);
            
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            console.error('Request OTP error:', error);
            const errorMessage = error.message || 'Gửi OTP thất bại. Vui lòng thử lại.';
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã OTP hợp lệ');
            return;
        }

        setLoading(true);

        try {
            // Bước 1: Xác thực OTP và lấy token
            // Chuyển đổi số điện thoại sang định dạng quốc tế +84
            const internationalPhone = convertToInternationalFormat(phone);
            const verifyResponse = await authService.verifyPhoneLogin(internationalPhone, otp);
            
            if (verifyResponse && verifyResponse.accessToken) {
                // Bước 2: Lấy thông tin user bằng token
                const userInfo = await authService.getCurrentUser();
                
                if (userInfo) {
                    // Map roleId sang role string
                    const userRole = userInfo.roleId === 2 ? 'technician' : 'customer';
                    
                    // Lưu thông tin user và role vào context
                    const userData = {
                        id: userInfo.userId,
                        email: userInfo.email,
                        fullName: userInfo.fullName,
                        phone: userInfo.phone,
                        roleId: userInfo.roleId,
                    };
                    
                    login(userData, userRole);
                }
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            const errorMessage = error.message || 'Mã OTP không đúng. Vui lòng thử lại.';
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: config.color + '20' }]}>
                        <Ionicons name={config.icon} size={50} color={config.color} />
                    </View>
                    <Text style={styles.title}>{config.title}</Text>
                    <Text style={styles.description}>{config.description}</Text>
                </View>

                {/* Login Method Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, loginMethod === 'password' && styles.activeTab]}
                        onPress={() => setLoginMethod('password')}
                    >
                        <Ionicons 
                            name="lock-closed-outline" 
                            size={20} 
                            color={loginMethod === 'password' ? config.color : '#999'} 
                        />
                        <Text style={[styles.tabText, loginMethod === 'password' && { color: config.color }]}>
                            Mật khẩu
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.tab, loginMethod === 'phone' && styles.activeTab]}
                        onPress={() => setLoginMethod('phone')}
                    >
                        <Ionicons 
                            name="phone-portrait-outline" 
                            size={20} 
                            color={loginMethod === 'phone' ? config.color : '#999'} 
                        />
                        <Text style={[styles.tabText, loginMethod === 'phone' && { color: config.color }]}>
                            Số điện thoại
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    {loginMethod === 'password' ? (
                        // Password Login Form
                        <>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email hoặc Số điện thoại"
                                    value={identifier}
                                    onChangeText={setIdentifier}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="#999"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity 
                                style={styles.forgotPassword}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, { backgroundColor: config.color }]}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                <Text style={styles.loginButtonText}>
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        // Phone OTP Login Form
                        <>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="0901234567"
                                    value={phone}
                                    onChangeText={handlePhoneChange}
                                    keyboardType="phone-pad"
                                    editable={!otpSent}
                                    maxLength={10}
                                />
                            </View>

                            {!otpSent && (
                                <Text style={styles.phoneHintText}>
                                    Nhập số điện thoại Việt Nam (bắt đầu bằng 0)
                                </Text>
                            )}

                            {!otpSent ? (
                                <TouchableOpacity
                                    style={[styles.loginButton, { backgroundColor: config.color }]}
                                    onPress={handleRequestOTP}
                                    disabled={loading}
                                >
                                    <Text style={styles.loginButtonText}>
                                        {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <>
                                    <View style={styles.otpInfoContainer}>
                                        <Ionicons name="information-circle-outline" size={18} color={config.color} />
                                        <Text style={styles.otpInfoText}>
                                            Mã OTP đã được gửi đến số {phone}
                                        </Text>
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Ionicons name="keypad-outline" size={20} color="#999" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Nhập mã OTP (6 số)"
                                            value={otp}
                                            onChangeText={setOtp}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>

                                    {countdown > 0 && (
                                        <Text style={styles.countdownText}>
                                            Mã OTP hết hạn sau: {countdown}s
                                        </Text>
                                    )}

                                    <TouchableOpacity
                                        style={[styles.loginButton, { backgroundColor: config.color }]}
                                        onPress={handleVerifyOTP}
                                        disabled={loading}
                                    >
                                        <Text style={styles.loginButtonText}>
                                            {loading ? 'Đang xác thực...' : 'Xác nhận'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.resendButton}
                                        onPress={() => {
                                            setOtpSent(false);
                                            setOtp('');
                                            setCountdown(0);
                                            setPhone('');
                                        }}
                                        disabled={countdown > 0}
                                    >
                                        <Text style={[styles.resendButtonText, countdown > 0 && { color: '#ccc' }]}>
                                            Gửi lại mã OTP
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </>
                    )}

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>HOẶC</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity style={styles.socialButton}>
                        <Ionicons name="logo-google" size={20} color="#DB4437" />
                        <Text style={styles.socialButtonText}>Đăng nhập với Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton}>
                        <Ionicons name="logo-facebook" size={20} color="#4267B2" />
                        <Text style={styles.socialButtonText}>Đăng nhập với Facebook</Text>
                    </TouchableOpacity>

                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register', { role })}>
                            <Text style={[styles.signupLink, { color: config.color }]}>
                                Đăng ký ngay
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#999',
    },
    form: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#F0F8FF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#999',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 5,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#666',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#DDD',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#999',
        fontSize: 12,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    socialButtonText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    signupText: {
        color: '#666',
        fontSize: 14,
    },
    signupLink: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    otpInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        gap: 8,
    },
    otpInfoText: {
        flex: 1,
        fontSize: 13,
        color: '#2E7D32',
    },
    countdownText: {
        textAlign: 'center',
        color: '#FF6B35',
        fontSize: 13,
        marginTop: -10,
        marginBottom: 15,
        fontWeight: '500',
    },
    resendButton: {
        alignSelf: 'center',
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    resendButtonText: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: '500',
    },
    phoneHintText: {
        fontSize: 12,
        color: '#666',
        marginTop: -10,
        marginBottom: 15,
        marginLeft: 5,
    },
});
