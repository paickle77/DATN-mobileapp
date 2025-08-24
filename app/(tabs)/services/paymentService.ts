import axios from 'axios';
import { BASE_URL } from './api';

export interface BillData {
  Account_id: string;
  address_id: string;
  shipping_method: string;
  payment_method: string;
  original_total: number;
  total: number;
  discount_amount?: number;
  voucher_code?: string;
  voucher_user_id?: string; // ✅ Thêm voucher_user_id
  note?: string;
  shipping_fee?: number;
  address_snapshot?: any;
  items: Array<{
    product_id: string;
    size: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface PaymentService {
  createVNPayPayment: (billData: BillData) => Promise<{ paymentUrl: string }>;
  createBillAfterPayment: (billData: BillData, transactionData?: any) => Promise<{ billId: string }>;
  verifyVNPayPayment: (queryParams: any) => Promise<{ success: boolean; message: string }>;
}

class PaymentServiceImpl implements PaymentService {
  // Tạo link thanh toán VNPay (KHÔNG tạo đơn hàng)
  async createVNPayPayment(billData: BillData): Promise<{ paymentUrl: string }> {
    try {
      console.log('🔄 Creating VNPay payment URL only...', billData);
      
      const response = await axios.post(`${BASE_URL}/vnpay/create`, {
        amount: billData.total,
        bankCode: null, // Để null để người dùng chọn ngân hàng trên trang VNPay
      });

      console.log('✅ VNPay payment URL created:', response.data);
      return { paymentUrl: response.data.paymentUrl };
    } catch (error) {
      console.error('❌ Error creating VNPay payment:', error);
      throw error;
    }
  }

  // Tạo đơn hàng SAU KHI thanh toán thành công
  async createBillAfterPayment(billData: BillData, transactionData?: any): Promise<{ billId: string }> {
    try {
      console.log('🔄 Creating bill after successful payment...');
      console.log('📊 BillData received:', JSON.stringify(billData, null, 2));
      console.log('💳 TransactionData received:', JSON.stringify(transactionData, null, 2));
      
      const requestPayload = {
        ...billData,
        payment_transaction: transactionData
      };
      
      console.log('📤 Final request payload to API:', JSON.stringify(requestPayload, null, 2));
      
      const response = await axios.post(`${BASE_URL}/bills/CreateAfterPayment`, requestPayload);

      console.log('✅ Bill created after payment:', response.data);
      return { billId: response.data.billId };
    } catch (error: any) {
      console.error('❌ Error creating bill after payment:', error);
      if (error.response) {
        console.error('❌ Error response status:', error.response.status);
        console.error('❌ Error response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  // Xác thực kết quả thanh toán VNPay
  async verifyVNPayPayment(queryParams: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.get(`${BASE_URL}/vnpay/return`, {
        params: queryParams
      });
      
      return {
        success: response.data.success || false,
        message: response.data.message || 'Unknown error'
      };
    } catch (error) {
      console.error('❌ Error verifying VNPay payment:', error);
      return {
        success: false,
        message: 'Lỗi xác thực thanh toán'
      };
    }
  }
}

const paymentService = new PaymentServiceImpl();
export { paymentService };

