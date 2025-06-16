import { useNavigation } from 'expo-router';
import * as React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const onboardingData = [
    {
        id: 1,
        title: "Cùng thưởng thức",
        subtitle: "cách làm bánh ngọt mới trên thế giới chi có tại",
        highlight: "CakeShop",
        image: require('../../../../assets/images/onboarding3.png'), // Thay đổi đường dẫn cho phù hợp
    },
    {
        id: 2,
        title: "Đây do thể loại",
        subtitle: "hương vị màu sắc",
        image: require('../../../../assets/images/onboarding3.png'), // Thay đổi đường dẫn cho phù hợp
    },
    {
        id: 3,
        title: "Cùng đặt hàng ngay thôi",
        subtitle: "",
        image: require('../../../../assets/images/onboarding3.png'), // Thay đổi đường dẫn cho phù hợp
    }
];

export default function Onboarding() {
    const navigation = useNavigation();
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const scrollViewRef = React.useRef<ScrollView>(null);

    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset;
        const viewSize = event.nativeEvent.layoutMeasurement;
        const pageNum = Math.floor(contentOffset.x / viewSize.width);
        setCurrentIndex(pageNum);
    };

    const goToNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            const nextIndex = currentIndex + 1;
            scrollViewRef.current?.scrollTo({
                x: nextIndex * width,
                animated: true
            });
            setCurrentIndex(nextIndex);
        } else {
            // Chuyển đến màn Register khi hoàn thành onboarding
            navigation.navigate('Register' as never);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            scrollViewRef.current?.scrollTo({
                x: prevIndex * width,
                animated: true
            });
            setCurrentIndex(prevIndex);
        }
    };

    const renderOnboardingItem = (item: typeof onboardingData[0]) => (
        <View key={item.id} style={[styles.slide, { width }]}>
            <View style={styles.phoneContainer}>
                <View style={styles.phoneFrame}>
                    <View style={styles.phoneNotch} />
                    <Image
                        source={item.image}
                        style={styles.phoneImage}
                        resizeMode="cover"
                    />
                </View>
            </View>
            
            <View style={styles.textContainer}>
                <Text style={styles.title}>
                    {item.title}
                </Text>
                <Text style={styles.subtitle}>
                    {item.subtitle}
                    {item.highlight && (
                        <Text style={styles.highlight}> {item.highlight}</Text>
                    )}
                </Text>
            </View>
        </View>
    );

    const renderPaginationDots = () => (
        <View style={styles.paginationContainer}>
            {onboardingData.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        index === currentIndex ? styles.activeDot : styles.inactiveDot
                    ]}
                />
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
           
            
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                style={styles.scrollView}
            >
                {onboardingData.map(renderOnboardingItem)}
            </ScrollView>

            {renderPaginationDots()}

            <View style={styles.navigationContainer}>
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={goToPrevious}
                    disabled={currentIndex === 0}
                >
                    <Text style={[
                        styles.navButtonText,
                        currentIndex === 0 && styles.disabledText
                    ]}>
                        ←
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.nextButton}
                    onPress={goToNext}
                >
                    <Text style={styles.nextButtonText}>
                        {currentIndex === onboardingData.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}
                    </Text>
                </TouchableOpacity>

                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 60,
        marginBottom: 20,
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    phoneContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    phoneFrame: {
        width: 250,
        height: 530,
        backgroundColor: '#000',
        borderRadius: 35,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    phoneNotch: {
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: -50,
        width: 100,
        height: 25,
        backgroundColor: '#000',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        zIndex: 2,
    },
    phoneImage: {
        width: '100%',
        height: '100%',
        borderRadius: 27,
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
    },
    highlight: {
        color: '#B4845C',
        fontWeight: '700',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#B4845C',
    },
    inactiveDot: {
        backgroundColor: '#D0D0D0',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    navButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    navButtonText: {
        fontSize: 20,
        color: '#B4845C',
        fontWeight: '600',
    },
    disabledText: {
        color: '#CCC',
    },
    nextButton: {
        backgroundColor: '#8B6F4E',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 30,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});