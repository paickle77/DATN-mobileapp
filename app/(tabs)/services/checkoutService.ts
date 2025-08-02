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

  export interface VoucherData {
    // Định nghĩa type cho voucher data theo API của bạn
    [key: string]: any;
  }

  class CheckoutService {
    /**
     * Lấy danh sách voucher của user
     */
    async fetchVouchers(): Promise<{ vouchers: VoucherData; nameCode: string }> {
      try {
        const userData = await getUserData('userData');
        console.log('====================================');
        console.log('🟢 User ID:', userData);
        console.log('====================================');
        const nameVoucher = await getUserData('code');
        
        console.log("nameVoucher", nameVoucher);
        
        const response = await axios.get(`${BASE_URL}/voucher_users/accounts/${userData}`);
        console.log('✅ Dữ liệu Voucher:', response.data.data);
        
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

      // Gọi cả 2 API: giỏ hàng và sizes
      const [cartRes, sizeRes] = await Promise.all([
        axios.get(`${BASE_URL}/GetAllCarts`),
        axios.get(`${BASE_URL}/sizes`)
      ]);

      const APIlistCart = cartRes.data.data;
      const sizeList = sizeRes.data.data;
      
      console.log("listCart from API: ⭐️⭐️⭐️", APIlistCart);
      console.log("sizeList from API: 📏📏📏", sizeList);

      const formattedData = APIlistCart
        .filter((item: any) => item.product_id && item.size_id) // ✅ bỏ qua item lỗi
        .map((item: any) => {
          const sizeInfo = sizeList.find((s: any) =>
            s._id === item.size_id._id ||
            (s.size === item.size_id.size && s.product_id === item.product_id._id)
          );

          const priceIncrease = sizeInfo?.price_increase || 0;
          const basePrice = item.product_id.discount_price || item.product_id.price;
          const finalPrice = basePrice + priceIncrease * 1000;

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
        });


      // Lọc ra những item có user_id khớp với user hiện tại
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
     * Tạo payload cho bill với giá chính xác theo size
     */
    async buildBillPayload(
    addresses: Address[],
    listCart: CartItem[],
    note: string,
    selectedShippingMethod: string,
    selectedPaymentName: string,
    total: number,
    total2: number
  ): Promise<BillPayload> {
    try {
      const userData = await getUserData('userData');
      const userID = typeof userData === 'string' ? userData : userData._id;
      const defaultAddress = addresses[0];

      const billDetailsData = listCart.map((item: CartItem) => ({
        product_id: item.product_id._id,
        size: item.Size || '-',
        quantity: item.quantity,
        price: item.price, // Đã được tính với giá size trong fetchCartData
        total: item.price * item.quantity, // Tính total dựa trên giá đã có size
      }));

      const payload: BillPayload = {
        user_id: userID,
        address_id: defaultAddress?._id ?? null,
        note: note || '',
        shipping_method: selectedShippingMethod,
        payment_method: selectedPaymentName,
        total: total,
        items: billDetailsData,
        status: "doing",
      };

      console.log("🚀 Payload gửi lên server (với giá theo size):", payload);
      return payload;
    } catch (error) {
      console.error('❌ Lỗi tạo payload:', error);
      throw new Error('Không thể tạo dữ liệu đơn hàng');
    }
  }

    /**
     * Gửi chi tiết bill (bill details)với giá chính xác theo size
     */
    async sendBillDetails(billId: string, items: CartItem[]): Promise<void> {
    try {
      for (const item of items) {
        const payload = {
          bill_id: billId,
          product_id: item.product_id._id || item.product_id,
          size: item.Size || '-',
          quantity: item.quantity,
          price: item.price, // Sử dụng giá đã tính với size
          total: item.price * item.quantity, // Total dựa trên giá có size
        };

        console.log('📤 Gửi 1 billDetail (với giá theo size):', payload);
        const response = await axios.post(`${BASE_URL}/billdetails`, payload);
        console.log('✅ Gửi billDetail thành công:', response.data);
      }
    } catch (error) {
      console.error('❌ Lỗi khi gửi billDetails:', error.response?.data || error.message);
      throw new Error('Không thể lưu chi tiết đơn hàng');
    }
  }

    /**
     * Tạo đơn hàng
     */
    async createBill(payload: BillPayload): Promise<string> {
      try {
        const response = await axios.post(`${BASE_URL}/bills`, payload);
        console.log('✅ Đặt hàng thành công:', response);
        
        if (response.status === 200 && response.data.data._id) {
          return response.data.data._id;
        } else {
          throw new Error(response.data.message || 'Không thể tạo đơn hàng');
        }
      } catch (error) {
        console.error('❌ Lỗi khi tạo bill:', error);
        throw new Error('Không thể tạo đơn hàng');
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
        // Không throw error vì đây không phải lỗi critical
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
        return 1; // Giá trị mặc định
      }
    }

    /**
     * Xử lý toàn bộ flow checkout
     */
    async processCheckout(
      addresses: Address[],
      listCart: CartItem[],
      note: string,
      selectedShippingMethod: string,
      selectedPaymentName: string,
      total: number,
      total2: number
    ): Promise<{ billId: string; success: boolean }> {
      try {
        // 1. Tạo payload
        const payload = await this.buildBillPayload(
          addresses,
          listCart,
          note,
          selectedShippingMethod,
          selectedPaymentName,
          total,
          total2
        );

        // 2. Tạo bill
        const billId = await this.createBill(payload);

        // 3. Gửi bill details
        const billDetailsData = listCart.map((item: CartItem) => ({
          product_id: item.product_id._id,
          size: item.Size || '-',
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })) as any[];

        await this.sendBillDetails(billId, billDetailsData);

        // 4. Xóa giỏ hàng
        await this.clearCart();

        return { billId, success: true };
      } catch (error) {
        console.error('❌ Lỗi trong quá trình checkout:', error);
        throw error;
      }
    }
  }

  // Export singleton instance
  export const checkoutService = new CheckoutService();
  export default checkoutService;