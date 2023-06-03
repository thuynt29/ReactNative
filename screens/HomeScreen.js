import React, { useEffect, useState } from 'react';
import { SafeAreaView, Button, View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import log from '../Log';
import Student from '../components/Student';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [students, setStudents] = useState([]);
    const [authInfo, setAuthInfo] = useState();

    // Hàm điều hướng
    const navigateToLogin = () => {
        navigation.navigate('Login');
    };

    // Funtion lấy data login từ AsyncStorage
    const retrieveData = async () => {
        try {
            const authInfo = await AsyncStorage.getItem('authInfo');
            if (authInfo !== null) {
                log.info('====> authInfo from AsyncStorage', authInfo);
                setAuthInfo(JSON.parse(authInfo));
            }
        } catch (error) {
            log.error(error);
        }
    };

    // Funtion logout
    const doLogout = () => {
        AsyncStorage.removeItem('authInfo');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }]
        });
    };

    // Funtion lấy danh sách sinh viên
    const getListStudent = async () => {
        try {
            const API_URL = 'http://192.168.30.117:3000/students';
            const response = await fetch(API_URL);
            const data = await response.json();
            log.info('====> students:', JSON.stringify(data));
            setStudents(data);
        } catch (error) {
            log.error('Fetch data failed ' + error);
        }
    };

    // React Hooks là những hàm cho phép bạn “kết nối” React state và lifecycle vào các components sử dụng hàm.
    // useState() là 1 react hook
    // 6 trường hợp sử dụng của useEffect() trong React
    // 1.Chạy một lần khi mount : tìm nạp data API.
    // 2.Chạy khi thay đổi state : thường thì khi validate input đầu vào.
    // 3.Chạy khi thay đổi state : filtering trực tiếp.
    // 4.Chạy khi thay đổi state : trigger animation trên giá trị của array mới.
    // 5.Chạy khi props thay đổi : update lại list đã fetched API khi data update.
    // 6.Chạy khi props thay đổi : updateing data API để cập nhật BTC
    useEffect(() => {
        retrieveData();
        getListStudent();
    }, []);

    // Funtion render danh sách sinh viên
    const renderStudents = () => {
        return (
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View>
                    <Text style={styles.txtHeader}>List Student</Text>
                </View>
                <View style={styles.studentContainer}>
                    {students.map((item, index) => {
                        return <Student student={item} key={index}></Student>;
                    })}
                </View>
            </ScrollView>
        );
    };

    // Gọi vào hàm return với dữ liệu ban đầu là là danh sách sinh viên rỗng
    return (
        <SafeAreaView style={styles.container}>
            {authInfo ? <Button title='Logout' onPress={doLogout} /> : <Button title='Go to Login Screen' onPress={navigateToLogin} />}
            {authInfo?.role === 'ADMIN' ? renderStudents() : null}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        flexGrow: 1,
        padding: 20
    },
    txtHeader: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    studentContainer: {
        flex: 1
    }
});

export default HomeScreen;
