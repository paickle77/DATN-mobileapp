import axios from 'axios';
import { Address, CheckoutAddress } from '../screens/order/Checkout';
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
  Account_id: string;
  selected?: boolean;
}

export interface BillPayload {
  Account_id: string;
  address_id: string | null;
  address_snapshot?: {
    name: string;
    phone: string;
    detail: string;
    ward: string;
    district: string;
    city: string;
  };
  note: string;
  shipping_method: string;
  payment_method: string;
  total: number;
  original_total: number;
  discount_amount: number;
  shipping_fee: number;
  voucher_code?: string;
  voucher_user_id?: string; // ✅ Thêm voucher_user_id
  items: BillDetailItem[];
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
    shippingFee: number;
    voucherCode?: string;
  };
}

export interface VoucherData {
  [key: string]: any;
}

class CheckoutService {
  async fetchVouchers(): Promise<{ vouchers: VoucherData; nameCode: string }> {
    try {
      const accountId = await getUserData('accountId');
      const nameVoucher = await getUserData('code');
      const response = await axios.get(`${BASE_URL}/voucher_users/account/${accountId}`);

      return {
        vouchers: response.data.data,
        nameCode: nameVoucher ?? ''
      };
    } catch (error) {
      console.error('❌ Lỗi khi lấy voucher:', error);
      throw new Error('Không thể tải voucher');
    }
  }

  async fetchCartData(selectedItemIds?: string[]): Promise<CartItem[]> {
    try {
      const accountId = await getUserData('accountId');
      const [cartRes, sizeRes] = await Promise.all([
        axios.get(`${BASE_URL}/GetAllCarts`),
        axios.get(`${BASE_URL}/Sizes`)
      ]);

      const APIlistCart = cartRes.data.data;
      const sizeList = sizeRes.data.data;

      const formattedData = APIlistCart.map((item: any) => {
        if (!item.product_id || !item.size_id) return null;

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
          Account_id: item.Account_id,
          Size_id: item.size_id,
          Size: item.size_id.size,
          price: finalPrice,
          image: item.product_id.image_url,
          quantity: item.quantity,
        };
      }).filter(Boolean);

      const userCartItems = formattedData.filter((item: any) => item.Account_id === accountId);

      if (selectedItemIds && selectedItemIds.length > 0) {
        return userCartItems.filter((item: any) => selectedItemIds.includes(item.id));
      }

      return userCartItems;
    } catch (error) {
      console.error("❌ Lỗi API giỏ hàng:", error);
      throw new Error('Không thể tải giỏ hàng');
    }
  }

  async fetchAllAddresses() {
    const response = await axios.get(`${BASE_URL}/GetAllAddress`);
    return response.data?.data ?? [];
  }

  async fetchDefaultAddress(): Promise<CheckoutAddress> {
    const userId = await getUserData('userId');
    
    // ✅ FIX: Sử dụng AddressService để có logic xử lý tốt hơn
    try {
      const response = await axios.get(`${BASE_URL}/addresses/default/${userId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Không lấy được địa chỉ mặc định');
      }

      const defaultAddress = response.data.data;
      console.log('📍 Lấy địa chỉ mặc định thành công:', {
        id: defaultAddress._id,
        name: defaultAddress.name,
        isDefault: defaultAddress.isDefault
      });

      return defaultAddress;
    } catch (error) {
      console.error('❌ Lỗi lấy địa chỉ mặc định:', error);
      throw new Error('Không thể lấy địa chỉ mặc định');
    }
  }

  async createPendingBill(
    addresses: Address[],
    listCart: CartItem[],
    note: string,
    selectedShippingMethod: string,
    selectedPaymentName: string,
    originalTotal: number,
    finalTotal: number,
    discountAmount: number,
    voucherCode?: string,
    shippingFee: number = 0,
    voucherUserId?: string // ✅ Thêm voucher_user_id parameter
  ): Promise<PendingOrder> {
    try {
      const accountId = await getUserData('accountId');
      const defaultAddress = addresses[0];

      // 🏷️ Lưu snapshot địa chỉ - QUAN TRỌNG cho việc hiển thị sau này
      const addressSnapshot = defaultAddress
        ? {
          name: defaultAddress.name,
          phone: defaultAddress.phone,
          detail: defaultAddress.detail_address,
          ward: defaultAddress.ward,
          district: defaultAddress.district,
          city: defaultAddress.city,
        }
        : null;

      // 📦 Lưu snapshot sản phẩm
      const items = listCart.map((item: CartItem) => ({
        product_id: item.product_id._id || item.product_id,
        size: item.Size || 'M',
        quantity: item.quantity,
        unit_price: item.price, // ✅ Giá đã tính chính xác từ FE
        total: item.price * item.quantity,
        product_snapshot: {
          name: item.title,
          image: item.image,
          price: item.price,
        },
      }));

      // ✅ FIX: Tính toán total chính xác - KHÔNG CỘI SHIP 2 LẦN
      const calculatedTotal = originalTotal + shippingFee - discountAmount;

      // ✅ PAYLOAD ĐÃ CẬP NHẬT với address_snapshot và shipping_fee
      const payload = {
        Account_id: accountId,
        address_id: defaultAddress?._id ?? null,
        address_snapshot: addressSnapshot, // ✅ Thêm snapshot địa chỉ
        shipping_method: selectedShippingMethod,
        payment_method: selectedPaymentName,
        original_total: originalTotal, // ✅ Tiền bánh gốc
        total: calculatedTotal, // ✅ Tổng cuối cùng (đã bao gồm ship và trừ giảm giá)
        discount_amount: discountAmount,
        voucher_code: voucherCode,
        voucher_user_id: voucherUserId, // ✅ Thêm voucher_user_id
        note: note || '',
        shipping_fee: shippingFee, // ✅ Phí ship riêng biệt
        items,
      };

      console.log('📤 Payload gửi đi (Updated):', JSON.stringify(payload, null, 2));
      console.log('💰 Chi tiết tính toán:');
      console.log('  - Tiền bánh gốc:', originalTotal.toLocaleString('vi-VN'), 'VND');
      console.log('  - Phí ship:', shippingFee.toLocaleString('vi-VN'), 'VND');
      console.log('  - Giảm giá:', discountAmount.toLocaleString('vi-VN'), 'VND');
      console.log('  - Tổng cuối cùng:', calculatedTotal.toLocaleString('vi-VN'), 'VND');

      const response = await axios.post(`${BASE_URL}/bills/CreatePending`, payload);

      if (response.status === 200 && response.data.billId) {
        return {
          billId: response.data.billId,
          orderData: {
            items: listCart,
            address: defaultAddress,
            note,
            shippingMethod: selectedShippingMethod,
            paymentMethod: selectedPaymentName,
            total: calculatedTotal, // ✅ Trả về tổng đã tính chính xác
            originalTotal,
            discountAmount,
            shippingFee, // ✅ Trả về phí ship riêng biệt
            voucherCode,
          },
        };
      } else {
        throw new Error(response.data.message || 'Không thể tạo đơn hàng');
      }
    } catch (error) {
      console.error('❌ Lỗi tạo pending bill:', error);
      throw new Error('Không thể tạo đơn hàng');
    }
  }

  async confirmPayment(billId: string, items: CartItem[]): Promise<void> {
    try {
      // Không đổi trạng thái tại đây, vì đơn hàng đã là "pending"
      await this.sendBillDetails(billId, items);
      await this.clearSelectedCartItems(items.map(item => item.id));
    } catch (error) {
      console.error('❌ Lỗi xác nhận thanh toán:', error);
      throw new Error('Không thể xác nhận thanh toán');
    }
  }

  async cancelPendingBill(billId: string): Promise<void> {
    try {
      await axios.put(`${BASE_URL}/bills/${billId}`, {
        status: "cancelled"
      });
    } catch (error) {
      console.error('❌ Lỗi hủy đơn hàng:', error);
      throw new Error('Không thể hủy đơn hàng');
    }
  }

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
        await axios.post(`${BASE_URL}/billdetails`, payload);
      }
    } catch (error) {
      console.error('❌ Lỗi khi gửi billDetails:', error);
      throw new Error('Không thể lưu chi tiết đơn hàng');
    }
  }

  async clearCart(): Promise<void> {
    try {
      const userData = await getUserData('accountId');
      const accountId = userData
      await axios.delete(`${BASE_URL}/carts/account/${accountId}`);
    } catch (error) {
      console.error('❌ Lỗi khi xóa giỏ hàng:', error);
    }
  }

  async clearSelectedCartItems(itemIds: string[]): Promise<void> {
    try {
      console.log('🔄 Đang xóa các sản phẩm đã mua:', itemIds);
      const deletePromises = itemIds.map(itemId =>
        axios.delete(`${BASE_URL}/carts/${itemId}`)
          .catch(error => {
            console.error(`❌ Lỗi khi xóa sản phẩm ${itemId}:`, error);
            return null;
          })
      );
      await Promise.all(deletePromises);
      console.log('✅ Đã xóa các sản phẩm đã mua khỏi giỏ hàng');
    } catch (error) {
      console.error('❌ Lỗi khi xóa các sản phẩm đã chọn:', error);
    }
  }

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

  async getBillById(billId: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/bills/${billId}`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Lỗi lấy thông tin bill:', error);
      throw new Error('Không thể lấy thông tin đơn hàng');
    }
  }

  async updateBillStatus(billId: string, status: string): Promise<void> {
    try {
      await axios.put(`${BASE_URL}/bills/${billId}`, { status });
    } catch (error) {
      console.error('❌ Lỗi cập nhật trạng thái:', error);
      throw new Error('Không thể cập nhật trạng thái đơn hàng');
    }
  }

  // ✅ THÊM METHOD MỚI để lấy bill với address_snapshot
  async getBillWithSnapshot(billId: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/bills/${billId}`);
      const bill = response.data.data;

      // Log để debug
      console.log('📋 Bill data with snapshot:', {
        id: bill._id,
        hasSnapshot: !!bill.address_snapshot,
        snapshot: bill.address_snapshot,
        shipping_fee: bill.shipping_fee,
        original_total: bill.original_total,
        total: bill.total
      });

      return bill;
    } catch (error) {
      console.error('❌ Lỗi lấy thông tin bill với snapshot:', error);
      throw new Error('Không thể lấy thông tin đơn hàng');
    }
  }

  // ✅ THÊM METHOD để giảm số lượng sản phẩm
  async decreaseProductQuantity(sizeId: string, quantity: number): Promise<void> {
    try {
      const payload = {
        sizeId: sizeId,
        quantityToDecrease: quantity,
      };

      const response = await axios.post(`${BASE_URL}/decrease-quantity`, payload);
      console.log("✔️ Giảm quantity thành công:", response.data);
    } catch (error: any) {
      console.error("❌ Giảm quantity thất bại:", error.response?.data || error.message);
      throw new Error('Không thể cập nhật số lượng sản phẩm');
    }
  }
}

export const checkoutService = new CheckoutService();
export default checkoutService;