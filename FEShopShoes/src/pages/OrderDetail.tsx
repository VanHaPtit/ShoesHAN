import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { CheckCircle, Truck, Package, CreditCard, Banknote } from 'lucide-react';
import ReviewModel from './ReviewModel';

const OrderDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            const res = await orderApi.getOrderDetail(id!);
            setOrder(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0F172A]"></div>
        </div>
    );

    if (!order) return <div className="p-20 text-center">Không tìm thấy đơn hàng</div>;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING": return { text: "CHỜ XÁC NHẬN - PENDING", bg: "bg-amber-50", color: "text-amber-600" };
            case "PAID": return { text: "ĐÃ THANH TOÁN - PAID", bg: "bg-[#e8f5e9]", color: "text-[#2e7d32]" };
            case "SHIPPED": return { text: "ĐANG VẬN CHUYỂN - SHIPPED", bg: "bg-[#fff3cd]", color: "text-[#856404]" };
            case "DELIVERED": return { text: "ĐÃ GIAO HÀNG - DELIVERED", bg: "bg-gray-200", color: "text-gray-700" };
            case "CANCELLED": return { text: "ĐÃ HỦY - CANCELLED", bg: "bg-[#f8d7da]", color: "text-[#721c24]" };
            default: return { text: status, bg: "bg-gray-100", color: "text-gray-600" };
        }
    };

    const badge = getStatusBadge(order.status);
    const orderItemsCount = order.items?.length || 0;

    // Timeline progress logic
    const statusMap: Record<string, number> = {
        "PENDING": 1,
        "PAID": 2,
        "SHIPPED": 3,
        "DELIVERED": 4,
        "CANCELLED": -1
    };
    const currentStep = statusMap[order.status] || 1;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8">
                {/* Breadcrumb */}
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6">
                    <Link to="/" className="hover:text-[#0F172A] transition-colors">Trang chủ</Link>
                    <span className="mx-2">›</span>
                    <Link to="/profile/orders" className="hover:text-[#0F172A] transition-colors border-b border-[#2563EB] text-[#0F172A] pb-0.5">Đơn hàng của tôi</Link>
                    <span className="mx-2">›</span>
                    <span className="text-gray-400">Chi tiết đơn hàng</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase text-[#0F172A] tracking-tighter">
                            CHI TIẾT ĐƠN HÀNG <span className="text-[#2563EB]">#{order.orderNumber}</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Ngày đặt: {order.orderDate}</p>
                    </div>
                    <div className={`${badge.bg} ${badge.color} px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-widest flex items-center gap-2`}>
                        <CheckCircle size={14} /> {badge.text}
                    </div>
                </div>

                {/* Timeline */}
                {order.status !== 'CANCELLED' && (
                    <div className="bg-white border border-[#E2E8F0] p-8 mb-8 relative">
                        <div className="absolute top-1/2 left-16 right-16 h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block"></div>
                        <div className="absolute top-1/2 left-16 h-0.5 bg-[#2563EB] -translate-y-1/2 hidden md:block transition-all duration-500" 
                             style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%' }}></div>
                        
                        <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center bg-white px-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${currentStep >= 1 ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Package size={24} />
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-bold ${currentStep >= 1 ? 'text-[#2563EB]' : 'text-gray-400'}`}>{order.orderDate}</p>
                                    <p className="text-sm font-bold text-[#0F172A] mt-1">Đã đặt hàng</p>
                                </div>
                            </div>
                            {/* Step 2 */}
                            <div className="flex flex-col items-center bg-white px-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${currentStep >= 2 ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Banknote size={24} />
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-bold ${currentStep >= 2 ? 'text-[#2563EB]' : 'text-gray-400'}`}>{currentStep >= 2 ? 'Hoàn tất' : 'Đang chờ'}</p>
                                    <p className="text-sm font-bold text-[#0F172A] mt-1">Đã thanh toán</p>
                                </div>
                            </div>
                            {/* Step 3 */}
                            <div className="flex flex-col items-center bg-white px-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${currentStep >= 3 ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Truck size={24} />
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-bold ${currentStep >= 3 ? 'text-[#2563EB]' : 'text-gray-400'}`}>{currentStep >= 3 ? 'Đang giao' : 'Đang chờ'}</p>
                                    <p className="text-sm font-bold text-[#0F172A] mt-1">Đang vận chuyển</p>
                                </div>
                            </div>
                            {/* Step 4 */}
                            <div className="flex flex-col items-center bg-white px-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${currentStep >= 4 ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <CheckCircle size={24} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-gray-400">Dự kiến</p>
                                    <p className="text-sm font-bold text-gray-400 mt-1">Đã giao hàng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column */}
                    <div className="flex-1 space-y-6">
                        {/* Products */}
                        <div className="bg-white border border-[#E2E8F0] p-8">
                            <h2 className="text-[15px] font-bold uppercase tracking-widest text-[#0F172A] mb-6">
                                SẢN PHẨM ({orderItemsCount.toString().padStart(2, '0')})
                            </h2>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item: any) => {
                                    const productImage = item.image || "https://placehold.jp/150x150.png";
                                    const productName = item.productName || "Sản phẩm không tên";
                                    const productId = item.productId;
                                    const colorValue = item.color || "N/A";
                                    const sizeValue = item.size || "N/A";

                                    return (
                                        <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex gap-6">
                                            <div className="w-24 h-24 bg-[#F8FAFC] shrink-0">
                                                <img
                                                    src={productImage}
                                                    alt={productName}
                                                    className="w-full h-full object-cover mix-blend-multiply"
                                                    onError={(e) => (e.currentTarget.src = "https://placehold.jp/150x150.png")}
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h3 className="text-[15px] font-bold text-[#0F172A] mb-1 leading-snug">{productName}</h3>
                                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                                                            PHÂN LOẠI: {colorValue} / SIZE {sizeValue}
                                                        </p>
                                                        <p className="text-sm font-medium text-[#0F172A]">Số lượng: {item.quantity.toString().padStart(2, '0')}</p>
                                                    </div>
                                                    <div className="text-[15px] font-bold text-[#2563EB] whitespace-nowrap">
                                                        {item.priceAtPurchase.toLocaleString()}đ
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 mt-4">
                                                    {item.canReview ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedItem({
                                                                    ...item,
                                                                    productId: productId,
                                                                    productName: productName,
                                                                    image: productImage,
                                                                    color: colorValue,
                                                                    size: sizeValue
                                                                });
                                                                setShowModal(true);
                                                            }}
                                                            className={`px-6 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors bg-[#2563EB] text-white hover:bg-[#1D4ED8]`}
                                                        >
                                                            ĐÁNH GIÁ
                                                        </button>
                                                    ) : item.isReviewed ? (
                                                        <span className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest bg-gray-100 text-gray-400 flex items-center justify-center">
                                                            ĐÃ ĐÁNH GIÁ
                                                        </span>
                                                    ) : null}
                                                    <button onClick={() => navigate(`/product/${productId}`)} className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest border border-[#0F172A] text-[#0F172A] bg-white hover:bg-black hover:text-white transition-colors">
                                                        MUA LẠI
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Delivery Status Update Box */}
                        {order.status === 'SHIPPED' && (
                            <div className="bg-white border border-[#E2E8F0] p-6 flex items-start gap-4">
                                <div className="text-[#2563EB] mt-1"><Truck size={24} /></div>
                                <div>
                                    <p className="font-bold text-[#0F172A] text-[15px]">Đơn hàng đang được vận chuyển.</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Cập nhật: Gần đây</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="w-full lg:w-80 shrink-0 space-y-6">
                        {/* Address */}
                        <div className="bg-white border border-[#E2E8F0] p-6">
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">ĐỊA CHỈ NHẬN HÀNG</h2>
                            <p className="font-bold text-[15px] text-[#0F172A] mb-1">{order.receiverName || 'Khách hàng'}</p>
                            <p className="text-gray-600 text-sm mb-3">{order.receiverPhone || 'Chưa cập nhật SĐT'}</p>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {order.shippingAddress || 'Địa chỉ chưa được cập nhật'}
                            </p>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white border border-[#E2E8F0] p-6">
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">PHƯƠNG THỨC THANH TOÁN</h2>
                            <div className="flex items-center gap-3">
                                <CreditCard className="text-[#2563EB]" size={20} />
                                <span className="font-medium text-[#0F172A] text-[15px]">
                                    {order.paymentMethod === 'PAYPAL' ? 'Thanh toán PayPal' : 
                                     order.paymentMethod === 'VNPAY' ? 'Thanh toán VNPay' : 
                                     order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 
                                     order.paymentMethod || 'Thanh toán khi nhận hàng (COD)'}
                                </span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white border border-[#E2E8F0] border-t-4 border-t-[#2563EB] p-6">
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-6">TỔNG KẾT ĐƠN HÀNG</h2>
                            
                            <div className="space-y-4 text-sm font-medium mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span className="text-[#0F172A]">{order.totalPrice.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span className="text-[#0F172A]">0đ</span>
                                </div>
                                {/* <div className="flex justify-between text-[#2e7d32]">
                                    <span>Giảm giá (PROMO2024)</span>
                                    <span>-35.000đ</span>
                                </div> */}
                            </div>

                            <div className="border-t border-[#E2E8F0] pt-6 flex justify-between items-end">
                                <span className="text-[#0F172A] font-bold">Tổng cộng</span>
                                <span className="text-2xl font-black text-[#2563EB]">{order.totalPrice.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Đánh giá */}
            {showModal && (
                <ReviewModel
                    item={selectedItem}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchOrderDetail(); 
                    }}
                />
            )}
        </div>
    );
};

export default OrderDetail;