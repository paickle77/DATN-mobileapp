// services/shipService.ts
import axios from 'axios';
import { getUserData, saveUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

// ===== LẤY THÔNG TIN SHIPPER =====
export const fetchShipperInfo = async () => {
  const accountId = await getUserData('userData');
  const res = await axios.get(`${BASE_URL}/shippers`);
  const shippers = res.data?.data || [];
  const shipper = shippers.find((s: any) => s.account_id === accountId);
  if (shipper) {
    await saveUserData({ key: 'shipperID', value: shipper._id });
  }
  return shipper;
};

// ===== CẬP NHẬT THÔNG TIN SHIPPER =====
export const updateShipperInfo = async (shipperId: string, data: any) => {
  const res = await axios.put(`${BASE_URL}/shippers/${shipperId}`, data);
  return res.data;
};

// ===== CẬP NHẬT TRẠNG THÁI ONLINE =====
export const updateShipperStatus = async (
  shipperId: string,
  status: 'online' | 'offline' | 'busy'
) => {
  const res = await axios.post(`${BASE_URL}/shippers/updateStatus`, {
    _id: shipperId,
    is_online: status
  });
  return res.data;
};

// ===== LẤY TẤT CẢ HÓA ĐƠN =====
export const fetchAllBills = async () => {
  const res = await axios.get(`${BASE_URL}/GetAllBills`);
  return res.data?.data || [];
};

// ===== LẤY CHI TIẾT HÓA ĐƠN =====
export const fetchBillDetails = async () => {
  const res = await axios.get(`${BASE_URL}/GetAllBillDetails`);
  return res.data?.data || [];
};

// ===== LẤY DANH SÁCH NGƯỜI DÙNG =====
export const fetchAllUsers = async () => {
  const res = await axios.get(`${BASE_URL}/users`);
  return res.data?.data || [];
};

// ===== GÁN ĐƠN CHO SHIPPER =====
export const assignOrderToShipper = async (orderId: string, shipperId: string) => {
  const res = await axios.put(`${BASE_URL}/bills/${orderId}/assign-shipper`, {
    shipper_id: shipperId
  });
  return res.data;
};

// ===== HOÀN THÀNH ĐƠN =====
export const completeOrder = async (
  orderId: string,
  shipperId: string,
  proofImage?: string
) => {
  const res = await axios.post(`${BASE_URL}/bills/CompleteOrder`, {
    orderId,
    shipperId,
    proof_images: proofImage
  });
  return res.data;
};

// ===== HỦY ĐƠN =====
export const cancelOrder = async (
  orderId: string,
  shipperId: string,
  proofImage?: string
) => {
  const res = await axios.post(`${BASE_URL}/bills/CancelOrder`, {
    orderId,
    shipperId,
    proof_images: proofImage
  });
  return res.data;
};

// ===== LẤY ĐƠN ĐÃ GIAO (TÍNH HOA HỒNG) =====
export const fetchCommissionOrders = async (shipperId: string) => {
  const res = await axios.get(`${BASE_URL}/GetAllBills`);
  const data = res.data?.data || [];
  return data.filter(
    (order: any) => order.shipper_id === shipperId && order.status === 'done'
  );
};
