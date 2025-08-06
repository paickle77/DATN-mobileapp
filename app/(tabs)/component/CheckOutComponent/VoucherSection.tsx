import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VoucherSectionProps {
  nameCode: string;
  percent: number;
  onPress: () => void;
}

const VoucherSection: React.FC<VoucherSectionProps> = ({ 
  nameCode, 
  percent, 
  onPress 
}) => {
  return (
    <View style={styles.voucherContainer}>
      <Text style={styles.voucherLabel}>Mã giảm giá</Text>
      <TouchableOpacity style={styles.voucherBox} onPress={onPress}>
        <View style={styles.voucherContent}>
          {nameCode ? (
            <>
              <Ionicons 
                name="pricetag" 
                size={20} 
                color="#007AFF" 
                style={{ marginRight: 8 }} 
              />
              <Text style={styles.voucherText}>
                {nameCode} (-{percent}%)
              </Text>
            </>
          ) : (
            <Text style={styles.voucherPlaceholder}>
              Chọn mã giảm giá
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  voucherContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  voucherLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  voucherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  voucherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voucherText: {
    fontSize: 14,
    color: '#5C4033',
    fontWeight: '500',
  },
  voucherPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
});

export default VoucherSection;