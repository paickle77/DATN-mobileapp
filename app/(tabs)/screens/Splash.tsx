import { useNavigation } from 'expo-router';
import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function Splash() {
   

    const navigation = useNavigation()

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={require('../../../assets/images/splash.png')}
                style={{ width: 400, height: 500, marginBottom: 32, borderRadius: 40 }}
                resizeMode="cover"
            />
            <Text style={styles.title}>
                <Text style={styles.cakeShop}>Cake Shop</Text>
                <Text> – nơi mỗi chiếc bánh làm rạng rỡ nụ cười của bạn</Text>
            </Text>
            <Text style={styles.subtitle}>
                Không cần chờ đến dịp đặc biệt – vì mỗi ngày đều xứng đáng có một chiếc bánh tuyệt vời
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => (navigation as any).navigate('Onboarding')}>
                <Text style={styles.buttonText}>Hãy bắt đầu nào</Text>
            </TouchableOpacity>
            <Text style={styles.loginText}>
                Bạn đã có tài khoản?{' '}
                <Text style={styles.loginLink} onPress={() => (navigation as any).navigate('Login')}>
                    Đăng nhập
                </Text>
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#fff',
        flexGrow: 1,
        justifyContent: 'center',
    },
    imagesRow: {
        flexDirection: 'row',
        marginBottom: 32,
        width: '100%',
        justifyContent: 'center',
    },
    leftImages: {
        flexDirection: 'column',
        marginRight: 8,
    },
    rightImages: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    image: {
        width: 140,
        height: 140,
        marginBottom: 8,
    },
    smallImage: {
        width: 100,
        height: 100,
        marginBottom: 8,
    },
    roundedTopLeft: {
        borderTopLeftRadius: 80,
        borderTopRightRadius: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 20,
    },
    roundedBottomLeft: {
        borderTopLeftRadius: 40,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 80,
        borderBottomRightRadius: 40,
    },
    roundedTopRight: {
        borderRadius: 50,
    },
    roundedBottomRight: {
        borderRadius: 50,
    },
    title: {
        fontSize: 20,
        fontWeight: '400',
        textAlign: 'center',
        marginBottom: 12,
        color: '#222',
    },
    cakeShop: {
        color: '#B4845C',
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 15,
        color: '#444',
        textAlign: 'center',
        marginBottom: 28,
    },
    button: {
        backgroundColor: '#8B6F4E',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 32,
        marginBottom: 18,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },
    loginText: {
        fontSize: 15,
        color: '#444',
        textAlign: 'center',
    },
    loginLink: {
        color: '#B4845C',
        textDecorationLine: 'underline',
    },
});