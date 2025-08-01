import axios from 'axios';
import { Address } from '../screens/order/Checkout';
import { getUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

export interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  discount_price?: number;
  quantity: number;
  Size: string;
  product_id: any;
  user_id: string;
}

export interface BillPayload {
  user_id: string;
  address_id: string | null;
  note: string;
  shipping_method: string;
  payment_method: string;
  total: number;
  original_total: number; // Tổng tiền trước giảm giá
  discount_amount: number; // Số tiền giảm giá
  voucher_code?: string; // Mã voucher đã sử dụng
  items: BillDetailItem[];
  status: string;
}

export interface BillDetailItem {
  product_id: string;
  size: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PendingOrder {
  billId: string;
  orderData: {
    items: CartItem[];
    address: Address;
    note: string;
    shippingMethod: string;
    paymentMethod: string;
    total: number;
    originalTotal: number;
    discountAmount: number;
    voucherCode?: string;
  };
}

export interface VoucherData {
  [key: string]: any;
}

class CheckoutService {
  /**
   * Lấy danh sách voucher của user
   */
  async fetchVouchers(): Promise<{ vouchers: VoucherData; nameCode: string }> {
    try {
      const userData = await getUserData('userData');
      const nameVoucher = await getUserData('code');

      console.log("nameVoucher", nameVoucher);

      const response = await axios.get(`${BASE_URL}/voucher_users/user/${userData}`);

      return {
        vouchers: response.data.data,
        nameCode: nameVoucher ?? ''
      };
    } catch (error) {
      console.error('❌ Lỗi khi lấy voucher:', error);
      throw new Error('Không thể tải voucher');
    }
  }

  /**
   * Lấy danh sách giỏ hàng của user với giá chính xác theo size
   */
  async fetchCartData(): Promise<CartItem[]> {
    try {
      const user = await getUserData('userData');
      const userId = user;
      console.log("userID:", userId);

      const [cartRes, sizeRes] = await Promise.all([
        axios.get(`${BASE_URL}/GetAllCarts`),
        axios.get(`${BASE_URL}/Sizes`)
      ]);

      const APIlistCart = cartRes.data.data;
      const sizeList = sizeRes.data.data;

      console.log("listCart from API: ⭐️⭐️⭐️", APIlistCart);
      console.log("sizeList from API: 📏📏📏", sizeList);

      const formattedData = APIlistCart.map((item: any) => {
        if (!item.product_id || !item.size_id) {
          console.warn("⚠️ Bỏ qua sản phẩm bị thiếu dữ liệu:", item);
          return null;
        }

        const sizeInfo = sizeList.find((s: any) =>
          s._id === item.size_id._id ||
          (s.size === item.size_id.size && s.Product_id === item.product_id._id)
        );

        const priceIncrease = sizeInfo?.price_increase || 0;
        const basePrice = item.product_id.discount_price || item.product_id.price;
        const finalPrice = basePrice + priceIncrease;

        return {
          id: item._id,
          title: item.product_id.name,
          product_id: item.product_id,
          user_id: item.user_id,
          Size: item.size_id.size,
          price: finalPrice,
          image: item.product_id.image_url,
          quantity: item.quantity,
        };
      }).filter(Boolean);

      const userCartItems = formattedData.filter((item: any) => item.user_id === userId);

      console.log("👉 Dữ liệu giỏ hàng theo user (với giá theo size):", userCartItems);
      return userCartItems;
    } catch (error) {
      console.error("❌ Lỗi API giỏ hàng:", error);
      throw new Error('Không thể tải giỏ hàng');
    }
  }

  /**
   * Lấy danh sách địa chỉ mặc định của user
   */
  async fetchAddresses(): Promise<Address[]> {
    try {
      const userData = await getUserData('userData');
      const userID = typeof userData === 'string' ? userData : userData._id;

      const response = await axios.get(`${BASE_URL}/GetAllAddress`);
      const allData = response.data?.data ?? [];

      const filtered = allData.filter((item: Address) =>
        item.user_id?._id === userID && (item.isDefault === true || item.isDefault === 'true')
      );

      console.log('⭐️ Địa chỉ mặc định của user:', filtered);
      return filtered;
    } catch (error) {
      console.error('❌ Lỗi lấy địa chỉ:', error);
      throw new Error('Không thể tải địa chỉ');
    }
  }

  /**
   * Tạo bill đầu tiên với trạng thái pending
   */
  async createPendingBill(
    addresses: Address[],
    listCart: CartItem[],
    note: string,
    selectedShippingMethod: string,
    selectedPaymentName: string,
    originalTotal: number,
    finalTotal: number,
    discountAmount: number,
    voucherCode?: string
  ): Promise<PendingOrder> {
    try {
      const userData = await getUserData('userData');
      const userID = typeof userData === 'string' ? userData : userData._id;
      const defaultAddress = addresses[0];

      const billDetailsData = listCart.map((item: CartItem) => ({
        product_id: item.product_id._id,
        size: item.Size || '-',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }));

      const payload: BillPayload = {
        user_id: userID,
        address_id: defaultAddress?._id ?? null,
        note: note || '',
        shipping_method: selectedShippingMethod,
        payment_method: selectedPaymentName,
        total: finalTotal,
        original_total: originalTotal,
        discount_amount: discountAmount,
        voucher_code: voucherCode,
        items: billDetailsData,
        status: "doing", // Trạng thái chờ thanh toán
      };

      console.log("🚀 Payload tạo bill pending:", payload);
      
      const response = await axios.post(`${BASE_URL}/bills`, payload);
      
      if (response.status === 200 && response.data.data._id) {
        const billId = response.data.data._id;
        
        // Trả về thông tin đơn hàng pending
        return {
          billId,
          orderData: {
            items: listCart,
            address: defaultAddress,
            note,
            shippingMethod: selectedShippingMethod,
            paymentMethod: selectedPaymentName,
            total: finalTotal,
            originalTotal,
            discountAmount,
            voucherCode
          }
        };
      } else {
        throw new Error(response.data.message || 'Không thể tạo đơn hàng');
      }
    } catch (error) {
      console.error('❌ Lỗi tạo bill pending:', error);
      throw new Error('Không thể tạo đơn hàng');
    }
  }

  /**
   * Xác nhận thanh toán và tạo bill details
   */
  async confirmPayment(billId: string, items: CartItem[]): Promise<void> {
    try {
      // 1. Cập nhật trạng thái bill thành "confirmed"
      await axios.put(`${BASE_URL}/bills/${billId}`, {
        status: "doing"
      });

      // 2. Tạo bill details
      await this.sendBillDetails(billId, items);

      // 3. Xóa giỏ hàng
      await this.clearCart();

      console.log('✅ Xác nhận thanh toán thành công');
    } catch (error) {
      console.error('❌ Lỗi xác nhận thanh toán:', error);
      throw new Error('Không thể xác nhận thanh toán');
    }
  }

  /**
   * Hủy đơn hàng pending
   */
  async cancelPendingBill(billId: string): Promise<void> {
    try {
      await axios.put(`${BASE_URL}/bills/${billId}`, {
        status: "cancelled"
      });
      console.log('✅ Đã hủy đơn hàng pending');
    } catch (error) {
      console.error('❌ Lỗi hủy đơn hàng:', error);
      throw new Error('Không thể hủy đơn hàng');
    }
  }

  /**
   * Gửi chi tiết bill (bill details)
   */
  async sendBillDetails(billId: string, items: CartItem[]): Promise<void> {
    try {
      for (const item of items) {
        const payload = {
          bill_id: billId,
          product_id: item.product_id._id || item.product_id,
          size: item.Size || '-',
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        };

        console.log('📤 Gửi 1 billDetail:', payload);
        const response = await axios.post(`${BASE_URL}/billdetails`, payload);
        console.log('✅ Gửi billDetail thành công:', response.data);
      }
    } catch (error) {
      console.error('❌ Lỗi khi gửi billDetails:', error.response?.data || error.message);
      throw new Error('Không thể lưu chi tiết đơn hàng');
    }
  }

  /**
   * Xóa giỏ hàng sau khi đặt hàng thành công
   */
  async clearCart(): Promise<void> {
    try {
      const userData = await getUserData('userData');
      await axios.delete(`${BASE_URL}/carts/user/${userData}`);
      console.log('✅ Đã xóa giỏ hàng');
    } catch (error) {
      console.error('❌ Lỗi khi xóa giỏ hàng:', error);
    }
  }

  /**
   * Lấy discount percent từ storage
   */
  async getDiscountPercent(): Promise<number> {
    try {
      const discount_percent = await getUserData('discount_percent');
      const percentValue = discount_percent !== null ? Number(discount_percent) : 1;
      return isNaN(percentValue) ? 1 : percentValue;
    } catch (error) {
      console.error('❌ Lỗi khi lấy discount percent:', error);
      return 1;
    }
  }

  /**
   * Lấy thông tin bill theo ID
   */
  async getBillById(billId: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/bills/${billId}`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Lỗi lấy thông tin bill:', error);
      throw new Error('Không thể lấy thông tin đơn hàng');
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateBillStatus(billId: string, status: string): Promise<void> {
    try {
      await axios.put(`${BASE_URL}/bills/${billId}`, { status });
      console.log(`✅ Cập nhật trạng thái đơn hàng ${billId} thành ${status}`);
    } catch (error) {
      console.error('❌ Lỗi cập nhật trạng thái:', error);
      throw new Error('Không thể cập nhật trạng thái đơn hàng');
    }
  }
}

// Export singleton instance
export const checkoutService = new CheckoutService();
export default checkoutService;