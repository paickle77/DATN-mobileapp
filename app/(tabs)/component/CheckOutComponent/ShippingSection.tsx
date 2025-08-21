import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShippingMethod {
  id: string;
  name: string;
  time: string;
  price: number;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface ShippingSectionProps {
  shippingMethods: ShippingMethod[];
  selectedShippingMethod: string | null;
  onSelectShipping: (methodId: string) => void;
  formatPrice: (price: number) => string;
  districtType?: 'inner' | 'outer' | 'unknown';
  districtName?: string;
}

const ShippingSection: React.FC<ShippingSectionProps> = ({ 
  shippingMethods, 
  selectedShippingMethod, 
  onSelectShipping, 
  formatPrice,
  districtType = 'unknown',
  districtName
}) => {
  const getDistrictTypeText = () => {
    if (districtType === 'inner') return 'Nội thành';
    if (districtType === 'outer') return 'Ngoại thành';
    return 'Chưa xác định';
  };

  const getDistrictTypeColor = () => {
    if (districtType === 'inner') return '#34C759';
    if (districtType === 'outer') return '#FF9500';
    return '#999';
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="car-outline" size={20} color="#e74c3c" />
        <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
      </View>

      {/* Hiển thị thông tin khu vực */}
      {districtName && (
        <View style={styles.districtInfo}>
          <Text style={styles.districtText}>
            Khu vực: <Text style={styles.districtName}>{districtName}</Text>
          </Text>
          <View style={[styles.districtBadge, { backgroundColor: getDistrictTypeColor() }]}>
            <Text style={styles.districtBadgeText}>
              {getDistrictTypeText()}
            </Text>
          </View>
        </View>
      )}

      {/* Danh sách phương thức giao hàng */}
      <View style={styles.methodsContainer}>
        {shippingMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedShippingMethod === method.id && styles.selectedMethod
            ]}
            onPress={() => onSelectShipping(method.id)}
          >
            <View style={styles.methodContent}>
              <View style={styles.methodLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={method.icon} 
                    size={24} 
                    color={selectedShippingMethod === method.id ? '#007AFF' : '#666'} 
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[
                    styles.methodName,
                    selectedShippingMethod === method.id && styles.selectedMethodText
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={styles.methodTime}>{method.time}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
              </View>
              
              <View style={styles.methodRight}>
                <Text style={[
                  styles.methodPrice,
                  selectedShippingMethod === method.id && styles.selectedMethodText
                ]}>
                  {method.price === 0 ? 'Miễn phí' : formatPrice(method.price)}
                </Text>
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radio,
                    selectedShippingMethod === method.id && styles.radioSelected
                  ]}>
                    {selectedShippingMethod === method.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Thông báo khi chưa chọn địa chỉ */}
      {districtType === 'unknown' && (
        <View style={styles.warningContainer}>
          <Ionicons name="information-circle-outline" size={16} color="#FF9500" />
          <Text style={styles.warningText}>
            Vui lòng chọn địa chỉ giao hàng để xem phương thức phù hợp
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  districtInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  districtText: {
    fontSize: 14,
    color: '#666',
  },
  districtName: {
    fontWeight: '600',
    color: '#333',
  },
  districtBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  districtBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  methodsContainer: {
    gap: 8,
  },
  methodCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectedMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  methodLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  methodTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  methodRight: {
    alignItems: 'flex-end',
  },
  methodPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedMethodText: {
    color: '#007AFF',
  },
  radioContainer: {
    padding: 4,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#007AFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    marginLeft: 6,
    flex: 1,
  },
});

export default ShippingSection;