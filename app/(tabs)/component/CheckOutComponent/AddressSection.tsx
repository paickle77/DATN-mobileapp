import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckoutAddress } from '../../screens/order/Checkout';

interface AddressSectionProps {
  addresses: CheckoutAddress[];
  onPress: () => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({ addresses, onPress }) => {
  // ✅ DEBUG: Log để kiểm tra địa chỉ hiển thị
  console.log('🏠 AddressSection render:', {
    addressCount: addresses.length,
    firstAddress: addresses.length > 0 ? {
      id: addresses[0]._id,
      name: addresses[0].name,
      isDefault: addresses[0].isDefault
    } : null
  });

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="location-outline" size={20} color="#e74c3c" />
        <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
      </View>
      <TouchableOpacity style={styles.addressCard} onPress={onPress}>
        <View style={styles.addressInfo}>
          {addresses.length > 0 ? (
            addresses.map((addr) => (
              <View key={addr._id || `address-${addr.name}-${addr.phone}`} style={{ marginBottom: 12 }}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressName}>{addr.name}</Text>
                  <Text style={styles.addressPhone}>{addr.phone}</Text>
                </View>
                <Text style={styles.addressText}>
                  {`${addr.detail_address}, ${addr.ward}, ${addr.district}, ${addr.city}`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.addressPlaceholder}>Chọn địa chỉ giao hàng</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
      </TouchableOpacity>
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
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    
    marginBottom: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  addressPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
});

export default AddressSection;