import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { Search } from "lucide-react";

const tabs = [
  { label: "TẤT CẢ", value: "ALL" },
  { label: "CHỜ XÁC NHẬN", value: "PENDING" },
  { label: "ĐÃ THANH TOÁN", value: "PAID" },
  { label: "ĐANG GIAO", value: "SHIPPED" },
  { label: "ĐÃ GIAO", value: "DELIVERED" },
  { label: "ĐÃ HỦY", value: "CANCELLED" },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "PENDING": return "bg-amber-50 text-amber-600";
    case "PAID": return "bg-blue-50 text-blue-500";
    case "SHIPPED": return "bg-orange-50 text-orange-500";
    case "DELIVERED": return "bg-green-50 text-green-600";
    case "CANCELLED": return "bg-red-50 text-red-500";
    default: return "bg-[#F8FAFC] text-gray-600";
  }
};

const getStatusLabel = (status: string) => {
  const tab = tabs.find(t => t.value === status);
  return tab ? tab.label : status;
};

const UserOrders: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Không thể lấy lịch sử đơn hàng", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === "ALL"
    ? orders
    : orders.filter((o: any) => o.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0F172A]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8">
        {/* Breadcrumb */}
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6">
          <span className="cursor-pointer hover:text-[#0F172A] transition-colors" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="mx-2">›</span>
          <span className="text-[#0F172A]">Đơn hàng của tôi</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black uppercase text-[#0F172A] mb-8 tracking-tighter">ĐƠN HÀNG CỦA TÔI</h1>

        {/* Tabs */}
        <div className="flex border-b border-[#E2E8F0] overflow-x-auto scrollbar-hide mb-8 gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-4 text-[13px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors relative ${
                activeTab === tab.value ? "text-[#2563EB]" : "text-gray-500 hover:text-[#0F172A]"
              }`}
            >
              {tab.label}
              {activeTab === tab.value && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#2563EB]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order: any) => (
              <div key={order.id} className="bg-white border border-[#E2E8F0] transition-shadow hover:shadow-sm">
                {/* Header */}
                <div className="bg-[#F8FAFC] px-6 py-4 flex justify-between items-center border-b border-[#E2E8F0]">
                  <div className="text-[13px] font-bold">
                    <span className="text-[#0F172A] uppercase">#{order.orderNumber}</span>
                    <span className="text-gray-300 mx-3">|</span>
                    <span className="text-gray-500 font-medium">{order.orderDate}</span>
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm ${getStatusStyles(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 divide-y divide-gray-100">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-6 py-6 group items-center">
                      <div className="w-24 h-24 bg-[#F8FAFC] shrink-0">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-[15px] text-[#0F172A] uppercase tracking-tight mb-2 line-clamp-2">
                          {item.productName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-500 font-medium mb-3">
                          <span>Màu sắc: {item.color}</span>
                          <span>Kích cỡ: {item.size}</span>
                          <span>Số lượng: x{item.quantity}</span>
                        </div>
                        <div className="font-bold text-[15px] text-[#0F172A]">
                          {item.priceAtPurchase.toLocaleString()}đ
                        </div>
                      </div>

                      {/* Nút đánh giá cho từng sản phẩm */}
                      <div className="shrink-0 flex sm:flex-col justify-end gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        {item.canReview ? (
                          <button 
                            onClick={() => navigate(`/reviews/create/${item.productId}/${item.id}`)}
                            className="bg-[#2563EB] text-white px-6 py-2.5 text-[12px] font-bold tracking-widest uppercase hover:bg-[#1D4ED8] transition-colors whitespace-nowrap w-full sm:w-auto text-center"
                          >
                            ĐÁNH GIÁ
                          </button>
                        ) : item.isReviewed ? (
                          <span className="text-gray-400 italic text-[13px] font-medium px-4 py-2 text-center w-full sm:w-auto border border-[#E2E8F0] bg-[#F8FAFC]">
                            Đã đánh giá
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-[13px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    TỔNG CỘNG: <span className="text-[#2563EB] text-lg font-black">{order.totalPrice.toLocaleString()}đ</span>
                  </div>
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="border border-[#0F172A] text-[#0F172A] px-8 py-2.5 text-[12px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors w-full sm:w-auto text-center"
                  >
                    CHI TIẾT
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white py-24 text-center border border-[#E2E8F0] flex flex-col items-center">
              <div className="bg-[#F8FAFC] p-6 rounded-full mb-4">
                <Search className="text-gray-200" size={48} />
              </div>
              <p className="text-gray-400 font-bold text-lg uppercase tracking-wider">KHÔNG CÓ ĐƠN HÀNG NÀO</p>
              <button
                onClick={() => navigate('/shop')}
                className="mt-6 border border-[#0F172A] text-[#0F172A] px-8 py-3 text-[12px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                MUA SẮM NGAY
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrders;