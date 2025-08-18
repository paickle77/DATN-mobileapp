// services/shipService.ts
import axios from 'axios';
import moment from 'moment';
import { getUserData, saveUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

export type OnlineStatus = 'online' | 'offline' | 'busy';

export type OrderDetail = {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  shipping_fee: number;
  discount_amount: number;
  payment_method: string;
  note?: string;
  shipping_method? : string;
  Account_id?: string;
  address_id: string | null;
  address_snapshot?: {
    name: string;
    phone: string;
    detail: string;
    ward: string;
    district: string;
    city: string;
  };
  shipper_id?: string;
  tracking_info?: {
    accepted_at?: string;
    shipping_at?: string;
    completed_at?: string;
    cancelled_at?: string;
  };
  proof_images?: string | null;
};

export type Shipper = {
  _id: string;
  account_id: string;
  full_name: string;
  phone: string;
  image: string;
  license_number: string;
  vehicle_type: string;
  is_online: OnlineStatus;
  updatedAt: string;
};

export type User = {
  _id: string;
  account_id: string;
  name: string;
  email: string;
  phone: string;
};

export type OrderItem = {
  _id: string;
  bill_id: {_id: string };
  product_id: string;
  product_snapshot: {
    name: string;
    size_price_increase: number;
    final_unit_price: number;
    base_price: number;
    dicount_price: number;
    price: number;
    image_url: string;
  };
  size: string;
  quantity: number;
  unit_price: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

// ====== APIs ======

// Lấy thông tin shipper
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

// Cập nhật thông tin shipper
export const updateShipperInfo = async (shipperId: string, data: any) => {
  const res = await axios.put(`${BASE_URL}/shippers/${shipperId}`, data);
  return res.data;
};

// Cập nhật trạng thái online
export const updateShipperStatus = async (
  shipperId: string,
  status: OnlineStatus
) => {
  const res = await axios.post(`${BASE_URL}/shippers/updateStatus`, {
    _id: shipperId,
    is_online: status
  });
  return res.data;
};

// Lấy tất cả hóa đơn
export const fetchAllBills = async (): Promise<OrderDetail[]> => {
  const res = await axios.get(`${BASE_URL}/GetAllBills`);
  
  return res.data?.data || [];
};

// Lấy chi tiết hóa đơn
export const fetchBillDetails = async (): Promise<OrderItem[]> => {
  const res = await axios.get(`${BASE_URL}/GetAllBillDetails`);
  return res.data?.data || [];
};

// Lấy danh sách người dùng
export const fetchAllUsers = async (): Promise<User[]> => {
  const res = await axios.get(`${BASE_URL}/users`);
  return res.data?.data || [];
};

// Lấy danh sách shipper
export const fetchAllShippers = async (): Promise<Shipper[]> => {
  const res = await axios.get(`${BASE_URL}/shippers`);
  return res.data?.data || [];
};

// Gán đơn cho shipper
export const assignOrderToShipper = async (orderId: string, shipperId: string) => {
  const res = await axios.put(`${BASE_URL}/bills/${orderId}/assign-shipper`, {
    shipper_id: shipperId
  });
  return res.data;
};

// Hoàn thành đơn
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

// Hủy đơn
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

// Lấy đơn đã giao (hoa hồng)
export const fetchCommissionOrders = async (shipperId: string) => {
  const res = await axios.get(`${BASE_URL}/GetAllBills`);
  const data = res.data?.data || [];
  return data.filter(
    (order: any) => order.shipper_id === shipperId && order.status === 'done'
  );
};

// Lấy đơn + hoa hồng
export const getCommissionOrders = async (
  shipperId: string,
  filterType: 'day' | 'month',
  selectedDate: string
) => {
  const res = await axios.get(`${BASE_URL}/GetAllBills`);
  const data = res.data?.data || [];

  const ordersData = data.filter(
    (order: any) => order.shipper_id === shipperId && order.status === 'done'
  );

  const filtered = ordersData.filter((order: any) => {
    const date = moment(order.delivered_at);
    return filterType === 'month'
      ? date.format('YYYY-MM') === selectedDate
      : date.format('YYYY-MM-DD') === selectedDate;
  });

  const commission = filtered.reduce((sum: number, order: any) => {
    return sum + (order.shipping_fee || 0) * 0.5;
  }, 0);

  return { orders: filtered, commission };
};

export const fetchOrderDetailLikeScreen = async (orderId: string) => {
  const bills = await fetchAllBills();
  const order = bills.find((b) => b._id === orderId) ?? null;


  let shipper: Shipper | null = null;
  let is_online: OnlineStatus = 'offline';
  if (order?.shipper_id) {
    const shippers = await fetchAllShippers();
    shipper = shippers.find((s) => s._id === order.shipper_id) ?? null;
    if (shipper?.is_online) is_online = shipper.is_online;
  }

  let user: User | null = null;
  if ((order as any)?.user_id) {
    const users = await fetchAllUsers();
    user = users.find((u) => u.account_id === (order as any).user_id) ?? null;
  }

  const allItems = await fetchBillDetails();
  const items = allItems.filter((i) => i.bill_id?._id === orderId);


  const proofImage = order?.proof_images ?? null;

  return {
    order,
    shipper,
    user,
    items,
    is_online,
    proofImage,
  };
};

// Lấy sản phẩm trong đơn
export const fetchOrderItemsLikeScreen = async (
  orderId: string
): Promise<OrderItem[]> => {
  const allItems = await fetchBillDetails();
  const filtered = allItems.filter((i) => i.bill_id && i.bill_id._id === orderId);
  console.log('All Items:', filtered);
  return filtered;
};


// Cập nhật online status
export const updateShipperOnlineStatus = async (
  shipperId: string,
  status: OnlineStatus
) => {
  const res = await axios.post(`${BASE_URL}/shippers/updateStatus`, {
    _id: shipperId,
    is_online: status,
  });
  return res.data;
};

// Cập nhật profile
export const updateShipperProfile = async (
  shipperId: string,
  updated: Partial<Shipper>
): Promise<boolean> => {
  try {
    const res = await axios.put(`${BASE_URL}/shippers/${shipperId}`, updated, {
      headers: { "Content-Type": "application/json" },
    });
    return res.status === 200 || res.status === 201;
  } catch (err) {
    console.error("❌ updateShipperProfile error:", err);
    return false;
  }
};