import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';

// Define navigation types


// Define navigation types
type RootStackParamList = {
    Address: {
        latitude: string;
        longitude: string;
        address?: string;
    };
    SelectLocation: undefined;
};

const SelectLocationScreen = () => {
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [isGettingAddress, setIsGettingAddress] = useState(false);
    const [currentRegion, setCurrentRegion] = useState<Region>({
        latitude: 21.0285, // Vị trí mặc định (Hà Nội)
        longitude: 105.8542,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleConfirmLocation = () => {
        if (selectedLocation) {
            (navigation as any).navigate('Address', {
                latitude: selectedLocation.latitude.toString(),
                longitude: selectedLocation.longitude.toString(),
                address: selectedAddress || `${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)}`,
            });
        } else {
            Alert.alert('Vui lòng chọn vị trí trên bản đồ');
        }
    };

    const [isLoading, setIsLoading] = useState(true);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            // Yêu cầu quyền truy cập vị trí
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Quyền truy cập bị từ chối',
                    'Ứng dụng cần quyền truy cập vị trí để hiển thị bản đồ.',
                    [{ text: 'OK' }]
                );
                setIsLoading(false);
                return;
            }

            // Lấy vị trí hiện tại
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = location.coords;
            const newRegion = {
                latitude,
                longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            
            setCurrentRegion(newRegion);
            
            // Tự động chạy map đến vị trí hiện tại
            setTimeout(() => {
                mapRef.current?.animateToRegion(newRegion, 1000);
            }, 500);
            
            setIsLoading(false);
        } catch (error) {
            console.log('Lỗi khi lấy vị trí:', error);
            Alert.alert(
                'Lỗi',
                'Không thể lấy vị trí hiện tại. Sử dụng vị trí mặc định.',
                [{ text: 'OK' }]
            );
            setIsLoading(false);
        }
    };

    const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
        try {
            setIsGettingAddress(true);
            const result = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (result && result.length > 0) {
                const location = result[0];
                const address = [
                    location.streetNumber,
                    location.street,
                    location.district,
                    location.city,
                    location.region,
                    location.country
                ].filter(Boolean).join(', ');
                
                setSelectedAddress(address || 'Không thể xác định địa chỉ');
            } else {
                setSelectedAddress('Không thể xác định địa chỉ');
            }
        } catch (error) {
            console.log('Lỗi khi lấy địa chỉ:', error);
            setSelectedAddress('Lỗi khi lấy địa chỉ');
        } finally {
            setIsGettingAddress(false);
        }
    };

    const handleMapPress = (event: MapPressEvent) => {
        const coordinate = event.nativeEvent.coordinate;
        setSelectedLocation(coordinate);
        getAddressFromCoordinates(coordinate.latitude, coordinate.longitude);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chọn vị trí trên bản đồ</Text>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={currentRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                onPress={handleMapPress}
            >
                {selectedLocation && (
                    <Marker coordinate={selectedLocation} />
                )}
            </MapView>
            {selectedLocation && (
                <View style={styles.selectedContainer}>
                    <Text style={styles.selectedText}>
                        Địa chỉ: {isGettingAddress ? 'Đang tìm địa chỉ...' : selectedAddress}
                    </Text>
                    <Text style={styles.coordinateText}>
                        Tọa độ: {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
                    </Text>
                </View>
            )}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Đang lấy vị trí hiện tại...</Text>
                </View>
            )}
            <View style={{ padding: 16 }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#007aff',
                        paddingVertical: 14,
                        borderRadius: 8,
                        alignItems: 'center',
                        opacity: selectedLocation ? 1 : 0.5,
                    }}
                    onPress={handleConfirmLocation}
                    disabled={!selectedLocation}
                >
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                        Xác nhận vị trí
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SelectLocationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        margin: 16,
        color: '#222',
    },
    map: {
        flex: 1,
    },
    selectedContainer: {
        padding: 16,
        backgroundColor: '#e6f7ff',
        borderRadius: 8,
        margin: 16,
    },
    selectedText: {
        fontSize: 16,
        color: '#007aff',
        fontWeight: '600',
    },
    coordinateText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    loadingContainer: {
        position: 'absolute',
        top: 80,
        left: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
    },
    loadingText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
});