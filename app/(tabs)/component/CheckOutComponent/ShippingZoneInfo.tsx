import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShippingZoneInfoProps {
  districtType: 'inner' | 'outer' | 'unknown';
  districtName?: string;
  showDetails?: boolean;
}

const ShippingZoneInfo: React.FC<ShippingZoneInfoProps> = ({
  districtType,
  districtName,
  showDetails = false
}) => {
  const getZoneInfo = () => {
    switch (districtType) {
      case 'inner':
        return {
          label: 'Nội thành',
          color: '#34C759',
          icon: 'location' as const,
          description: 'Khu vực trung tâm Hà Nội - Giao hàng nhanh',
          benefits: [
            'Giao hàng trong 2-4 giờ',
            'Có dịch vụ giao hỏa tốc',
            'Phí giao hàng ưu đãi'
          ]
        };
      case 'outer':
        return {
          label: 'Ngoại thành', 
          color: '#FF9500',
          icon: 'car' as const,
          description: 'Khu vực ngoại thành Hà Nội - Giao hàng tiêu chuẩn',
          benefits: [
            'Giao hàng trong 4-6 giờ',
            'Đóng gói cẩn thận',
            'Phí giao hàng cố định'
          ]
        };
      default:
        return {
          label: 'Chưa xác định',
          color: '#999',
          icon: 'help-circle' as const,
          description: 'Vui lòng chọn địa chỉ để xem thông tin giao hàng',
          benefits: []
        };
    }
  };

  const zoneInfo = getZoneInfo();

  if (districtType === 'unknown' && !showDetails) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${zoneInfo.color}15` }]}>
          <Ionicons name={zoneInfo.icon} size={16} color={zoneInfo.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Khu vực: <Text style={[styles.zoneName, { color: zoneInfo.color }]}>{zoneInfo.label}</Text>
          </Text>
          {districtName && (
            <Text style={styles.districtName}>{districtName}</Text>
          )}
        </View>
        <View style={[styles.badge, { backgroundColor: zoneInfo.color }]}>
          <Text style={styles.badgeText}>{zoneInfo.label}</Text>
        </View>
      </View>

      <Text style={styles.description}>{zoneInfo.description}</Text>

      {showDetails && zoneInfo.benefits.length > 0 && (
        <View style={styles.benefitsContainer}>
          {zoneInfo.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={14} color={zoneInfo.color} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  zoneName: {
    fontWeight: '600',
  },
  districtName: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  benefitsContainer: {
    marginTop: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 6,
    flex: 1,
  },
});

export default ShippingZoneInfo;