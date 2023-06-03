import React, { useState, useEffect } from 'react';
import { Text, Alert, Image, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import log from '../Log';

const SignInScreen = () => {
    const navigation = useNavigation();
    // Khai báo các thông tin input
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Hàm điều hướng màn hình
    const navigateToHome = () => {
        navigation.navigate('Home');
    };

    // Function lấy dữ liệu từ API sử dụng fetch
    const fetchData = async () => {
        try {
            // Khai báo đường dẫn API
            const API_URL = 'http://192.168.30.117:3000/users';
            const response = await fetch(API_URL);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            log.error('Fetch data failed ' + error);
            return null;
        }
    };

    // Funtion validate dữ liệu
    const validateAuthInfo = (authInfo) => {
        // Kiểm tra dữ liệu trên form gồm username và password
        if (authInfo.userName === '') {
            setUsernameError('Username field cannot be empty');
            return false;
        } else if (authInfo.password === '') {
            setUsernameError('');
            setPasswordError('Password field cannot be empty');
            return false;
        }
        return true;
    };

    // Funtion clear message lỗi
    const clearError = (usernameError, passwordError) => {
        if (usernameError) setUsernameError('');
        if (passwordError) setPasswordError('');
    };

    // Funtion lưu thông tin authentication vào AsyncStorage
    // AsyncStorage chỉ đơn giản là lưu dữ liệu vào tài liệu trên ổ cứng của điện thoại
    // do đó bất kỳ ai có quyền truy cập vào hệ thống tệp của điện thoại đều có thể đọc dữ liệu đó.
    const storeAuthInfo = async (value) => {
        try {
            const authInfo = JSON.stringify(value);
            await AsyncStorage.setItem('authInfo', authInfo);
        } catch (error) {
            log.info(error);
        }
    };

    // Funtion thực hiện đăng nhập
    const doLogin = () => {
        // Tạo đối tượng lưu giữ thông tin login
        let request = { userName: username, password: password };
        // In ra thông tin user phục vụ check lỗi
        log.info('authInfo: ' + JSON.stringify(request));
        // Kiêm tra danh sách users có null hoặc undefined không
        if (users) {
            // Validate dữ liệu nhập vào
            const validateResult = validateAuthInfo(request);
            if (validateResult === true) {
                // Tìm user trong danh sách user từ API trả về
                const authInfo = users.find((user) => request.userName === user.userName);
                // Thực hiện validate thông tin đăng nhâp
                if (!authInfo) {
                    clearError(usernameError, passwordError);
                    Alert.alert('Notification', 'Cant find user infomation', [{ text: 'Cancel', onPress: () => log.error('Cant find user ' + request.userName) }]);
                } else {
                    if (!(authInfo.password === request.password)) {
                        clearError(usernameError, passwordError);
                        setPasswordError('Password is not correct');
                        return;
                    } else {
                        clearError(usernameError, passwordError);
                        storeAuthInfo(authInfo);
                        Alert.alert('Notification', 'Login successfull ' + request.userName, [
                            { text: 'OK', onPress: () => navigateToHome() },
                            { text: 'Cancel', onPress: () => log.info('Press Cancel') }
                        ]);
                    }
                }
            }
        }
    };

    // Initialize
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <View style={styles.root}>
            <View style={styles.cotainer}>
                <Image source={require('../assets/logo.png')} style={styles.logo} />
            </View>
            <CustomInput placeholder='Username' value={username} setValue={setUsername} secureTextEntry={false} />
            <Text style={styles.errorTxt}>{usernameError}</Text>
            <CustomInput placeholder='Password' value={password} setValue={setPassword} secureTextEntry={true} />
            <Text style={styles.errorTxt}>{passwordError}</Text>
            <CustomButton btnLabel={'Sign In'} onPress={doLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        paddingHorizontal: 20
    },
    cotainer: {
        marginTop: 60,
        alignItems: 'center'
    },
    logo: {
        width: '50%',
        height: '50%',
        resizeMode: 'contain',
        alignItems: 'center'
    },
    errorTxt: {
        color: 'red',
        marginVertical: 5
    }
});

export default SignInScreen;
