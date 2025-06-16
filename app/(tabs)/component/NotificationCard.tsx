import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const NotificationCard = ({ title, status, orderCode, time }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.checkMark}>✓</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.orderCode}>Đơn hàng: {orderCode}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    margin: 8,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5F5E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkMark: {
    fontSize: 24,
    color: 'black',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    color: '#333',
  },
  orderCode: {
    fontSize: 13,
    color: '#555',
  },
  time: {
    fontSize: 13,
    color: '#777',
  },
});
