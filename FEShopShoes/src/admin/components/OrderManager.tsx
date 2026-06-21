import React, { useState } from 'react';
import { Eye, Search, XCircle, Check, Pencil, X, Plus, Trash2, PackageX, ShoppingBag } from 'lucide-react';
import { Order, OrderStatus, OrderItem } from '../../types/admin';
import axios from 'axios';
import axiosClient from '../../api/axiosClient';

interface OrderManagerProps {
    orders: Order[];
    onRefresh: () => void;
}


// Danh sách trạng thái KHÔNG cho phép sửa items
const LOCKED_STATUSES: OrderStatus[] = [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];


const isItemsLocked = (status: OrderStatus) => LOCKED_STATUSES.includes(status);


const OrderManager: React.FC<OrderManagerProps> = ({ orders, onRefresh }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 16;

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Order>>({});


    // --- FILTER STATES ---
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');


    // --- STATE CHO MODAL SỬA ITEM ---
    const [editItemsOrder, setEditItemsOrder] = useState<Order | null>(null);
    const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
    const [savingItems, setSavingItems] = useState(false);


    // Tính tổng tiền từ danh sách items tạm
    const calcTotal = (items: OrderItem[]) =>
        items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);


    // Mở modal sửa items
    const openEditItems = (order: Order) => {
        setEditItemsOrder(order);
        setDraftItems(order.items.map(i => ({ ...i })));
    };


    // Cập nhật số lượng
    const updateQty = (idx: number, qty: number) => {
        if (qty < 1) return;
        setDraftItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: qty } : item));
    };


    // Xoá sản phẩm
    const removeItem = (idx: number) => {
        setDraftItems(prev => prev.filter((_, i) => i !== idx));
    };


    // Thêm dòng sản phẩm trống (admin tự điền)
    const addBlankItem = () => {
        setDraftItems(prev => [...prev, {
            productName: '',
            size: '',
            color: '',
            quantity: 1,
            priceAtPurchase: 0,
            image: 'https://placehold.co/48x48?text=?'
        }]);
    };


    // Cập nhật field của item
    const updateItemField = (idx: number, field: keyof OrderItem, value: string | number) => {
        setDraftItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };


    // Lưu items
    const handleSaveItems = async () => {
        if (!editItemsOrder?.id) return;
        setSavingItems(true);
        try {
            const newTotal = calcTotal(draftItems);
            const response = await axiosClient.put(
                `/orders/${editItemsOrder.id}/items`,
                { items: draftItems, totalPrice: newTotal }
            );
            if (response.status === 200) {
                setEditItemsOrder(null);
                onRefresh();
                alert('Đã cập nhật danh sách sản phẩm!');
            }
        } catch {
            alert('Lỗi khi cập nhật sản phẩm!');
        } finally {
            setSavingItems(false);
        }
    };


    // --- INLINE EDIT (tên, phone, address, status) ---
    const startEdit = (order: Order) => {
        setEditingId(order.id || null);
        setEditForm({ ...order });
    };


    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };


    const handleSave = async (id: number) => {
        try {
            const response = await axiosClient.put(
                `/orders/${id}`,
                {
                    receiverName: editForm.receiverName,
                    receiverPhone: editForm.receiverPhone,
                    shippingAddress: editForm.shippingAddress,
                    status: editForm.status
                }
            );
            if (response.status === 200) {
                setEditingId(null);
                onRefresh();
                alert('Đã lưu thay đổi!');
            }
        } catch {
            alert('Lỗi khi cập nhật dữ liệu!');
        }
    };


    const filteredOrders = orders.filter((order) => {
        // Search Match
        const matchSearch =
            (order.orderNumber && order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.receiverName && order.receiverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.receiverPhone && order.receiverPhone.includes(searchQuery)) ||
            (order.id && order.id.toString().includes(searchQuery));


        // Status Match
        const matchStatus = statusFilter === '' || order.status === statusFilter;


        // Date Match
        let orderDateStr = '';
        if ((order as any).orderDate) {
            const parts = (order as any).orderDate.split('/');
            if (parts.length === 3) {
                // dd/MM/yyyy to yyyy-MM-dd
                orderDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        const matchDate = dateFilter === '' || orderDateStr === dateFilter;


        // Payment Match
        const paymentMethod = (order as any).paymentMethod || 'COD';
        const matchPayment = paymentFilter === '' || paymentMethod === paymentFilter;


        return matchSearch && matchStatus && matchDate && matchPayment;
    });


    const getStatusStyle = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
            case OrderStatus.PAID: return 'bg-blue-100 text-blue-700 border-blue-200';
            case OrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case OrderStatus.CANCELLED: return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };


    return (
        <div className="bg-slate-50 min-h-[85vh] p-4 text-[13px] font-sans text-slate-700 rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">ORDER MANAGEMENT</h2>
            </div>


            {/* Filters (Dựa trên backend Entity Order) */}
            <div className="bg-slate-100/80 p-5 rounded-lg mb-6 border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input type="text" placeholder="Tìm theo tên khách, mobile, hoặc mã đơn..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-2.5 outline-none focus:border-blue-400 placeholder:text-slate-400" />
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-2.5 outline-none focus:border-blue-400 bg-white text-slate-600 font-medium">
                        <option value="">- Tất cả trạng thái đơn hàng -</option>
                        <option value={OrderStatus.PENDING}>Chưa xử lý</option>
                        <option value={OrderStatus.PAID}>Đã thanh toán</option>
                        <option value={OrderStatus.SHIPPED}>Đang giao</option>
                        <option value={OrderStatus.DELIVERED}>Thành công</option>
                        <option value={OrderStatus.CANCELLED}>Đã hủy</option>
                    </select>
                    <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }} title="Ngày tạo đơn" className="border border-slate-300 rounded-md px-3 py-2.5 outline-none focus:border-blue-400 bg-white text-slate-600 font-medium" />
                    <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-md px-3 py-2.5 outline-none focus:border-blue-400 bg-white text-slate-600 font-medium">
                        <option value="">- Phương thức thanh toán -</option>
                        <option value="COD">COD</option>
                        <option value="PAYPAL">PayPal</option>
                        <option value="VNPAY">VNPay</option>
                    </select>
                </div>
            </div>


            {/* Summary & Actions */}
            <div className="flex justify-between items-end mb-4 px-1">
                <div className="text-lg text-slate-600">
                    Tổng số đơn: <span className="text-2xl font-bold text-slate-800">{filteredOrders.length.toLocaleString('en-US')}</span>
                </div>
            </div>


            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-slate-200">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-[#f9fafb] text-slate-700 border-b border-slate-200 text-[12px] font-bold">
                        <tr>
                            <th className="p-3 text-center">Mã đơn</th>
                            <th className="p-3">Khách hàng</th>
                            <th className="p-3 text-center">Mobile</th>
                            <th className="p-3">Địa chỉ nhận</th>
                            <th className="p-3 text-center">Tổng tiền</th>
                            <th className="p-3 text-center">Trạng thái</th>
                            <th className="p-3 text-center">Thanh toán</th>
                            <th className="p-3 text-center">Ngày tạo</th>
                            <th className="p-3 text-center w-16">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((order) => {
                            const isEditing = editingId === order.id;
                            const locked = isItemsLocked(order.status);


                            return (
                                <tr key={order.id} className={`${isEditing ? 'bg-blue-50/40' : 'hover:bg-slate-50'} transition-colors group`}>
                                    <td className="p-3 font-bold text-slate-800 text-center text-sm">#{order.orderNumber || order.id}</td>
                                    <td className="p-3">
                                        {isEditing ? (
                                            <input className="w-full px-2 py-1.5 text-[13px] border rounded bg-white shadow-inner" placeholder="Tên khách hàng" value={editForm.receiverName || ''} onChange={e => setEditForm({ ...editForm, receiverName: e.target.value })} />
                                        ) : (
                                            <div className="font-semibold text-slate-800 text-[13.5px]">{order.receiverName}</div>
                                        )}
                                    </td>
                                    <td className="p-3 text-center text-slate-600 font-medium">
                                        {isEditing ? (
                                            <input className="w-28 px-2 py-1.5 text-xs border rounded bg-white shadow-inner text-center" value={editForm.receiverPhone || ''} onChange={e => setEditForm({ ...editForm, receiverPhone: e.target.value })} />
                                        ) : order.receiverPhone}
                                    </td>
                                    <td className="p-3 text-[12.5px] text-slate-600 truncate max-w-[150px]" title={order.shippingAddress}>
                                        {isEditing ? (
                                            <textarea className="w-full px-2 py-1.5 text-xs border rounded bg-white shadow-inner" placeholder="Địa chỉ" rows={1} value={editForm.shippingAddress || ''} onChange={e => setEditForm({ ...editForm, shippingAddress: e.target.value })} />
                                        ) : order.shippingAddress}
                                    </td>
                                    <td className="p-3 text-center font-bold text-[#d9534f] text-[13.5px]">{order.totalPrice.toLocaleString('vi-VN')}đ</td>
                                    <td className="p-3 text-center">
                                        {isEditing ? (
                                            <select className="text-[12px] border rounded px-1 py-1.5 w-full bg-white shadow-sm font-medium text-slate-700" value={editForm.status || order.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as OrderStatus })}>
                                                <option value={OrderStatus.PENDING}>Chưa xử lý</option>
                                                <option value={OrderStatus.PAID}>Đã thanh toán</option>
                                                <option value={OrderStatus.SHIPPED}>Đang giao</option>
                                                <option value={OrderStatus.DELIVERED}>Thành công</option>
                                                <option value={OrderStatus.CANCELLED}>Đã hủy</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2.5 py-1.5 rounded text-white text-[10.5px] font-bold whitespace-nowrap inline-block min-w-[70px] text-center shadow-sm ${order.status === OrderStatus.DELIVERED ? 'bg-[#28a745]' :
                                                    order.status === OrderStatus.CANCELLED ? 'bg-slate-500' :
                                                        order.status === OrderStatus.PAID ? 'bg-blue-500' : 'bg-[#dc3545]'
                                                }`}>
                                                {order.status === OrderStatus.PENDING ? 'Chưa xử lý' :
                                                    order.status === OrderStatus.PAID ? 'Đã thanh toán' :
                                                        order.status === OrderStatus.SHIPPED ? 'Đang giao' :
                                                            order.status === OrderStatus.DELIVERED ? 'Thành công' : 'Đã hủy'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1.5 rounded text-white text-[10.5px] font-bold whitespace-nowrap inline-block shadow-sm ${(order as any).paymentMethod === 'PAYPAL' ? 'bg-[#003087]' : (order as any).paymentMethod === 'VNPAY' ? 'bg-[#005a9e]' : 'bg-[#1a5b82]'
                                            }`}>
                                            {(order as any).paymentMethod || 'COD'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center text-slate-500 text-[11px] font-medium tracking-tight">
                                        <div>{(order as any).orderDate ? (order as any).orderDate : 'N/A'}</div>
                                    </td>
                                    <td className="p-3 text-center align-middle">
                                        <div className="flex flex-col items-center gap-2 justify-center opacity-80 hover:opacity-100 transition-opacity">
                                            {isEditing ? (
                                                <>
                                                    <button onClick={() => order.id && handleSave(order.id)} className="p-1.5 bg-emerald-500 text-white rounded shadow-sm hover:bg-emerald-600 transition-colors" title="Lưu"><Check className="w-3.5 h-3.5" /></button>
                                                    <button onClick={cancelEdit} className="p-1.5 bg-slate-300 text-slate-700 rounded shadow-sm hover:bg-slate-400 transition-colors" title="Huỷ"><X className="w-3.5 h-3.5" /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => setSelectedOrder(order)} className="text-[#a46eb0] hover:text-[#8e5a99] transition-colors" title="Xem chi tiết">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
                                                    </button>
                                                    <button onClick={() => startEdit(order)} className="text-[#5cb85c] hover:text-[#4cae4c] transition-colors" title="Sửa thông tin">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                    </button>
                                                    {!locked && (
                                                        <button onClick={() => openEditItems(order)} className="text-[#5bc0de] hover:text-[#46b8da] transition-colors mt-1" title="Sửa sản phẩm">
                                                            <ShoppingBag className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-[#f9fafb]">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            SHOWING PAGE {currentPage} OF {Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-bold disabled:opacity-50 bg-white hover:bg-slate-50 text-slate-600"
                            >
                                PREV
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredOrders.length / ITEMS_PER_PAGE), p + 1))}
                                disabled={currentPage === Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)}
                                className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-bold disabled:opacity-50 bg-white hover:bg-slate-50 text-slate-600"
                            >
                                NEXT
                            </button>
                        </div>
                    </div>
                )}
            </div>


            {/* MODAL SỬA DANH SÁCH SẢN PHẨM */}
            {editItemsOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Sửa sản phẩm – Đơn #{editItemsOrder.id}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Chỉ áp dụng với đơn ở trạng thái <span className="font-semibold text-amber-600">PENDING</span>
                                </p>
                            </div>
                            <button onClick={() => setEditItemsOrder(null)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>Sản phẩm</span>
                                <span>Size / Màu</span>
                                <span className="text-center">Số lượng</span>
                                <span className="text-right">Đơn giá</span>
                                <span />
                            </div>
                            {draftItems.length === 0 && (
                                <div className="text-center py-12 text-slate-300 text-sm">
                                    Chưa có sản phẩm nào. Nhấn "+ Thêm" để bắt đầu.
                                </div>
                            )}
                            {draftItems.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center bg-white border border-slate-200 rounded-lg px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img src={item.image} alt="" className="w-10 h-10 rounded object-cover border border-slate-200 flex-shrink-0" />
                                        <input className="flex-1 px-2 py-1.5 text-xs font-semibold border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 outline-none bg-slate-50 min-w-0" value={item.productName} placeholder="Tên sản phẩm" onChange={e => updateItemField(idx, 'productName', e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <input className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 outline-none bg-slate-50" value={item.size} placeholder="Size" onChange={e => updateItemField(idx, 'size', e.target.value)} />
                                        <input className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 outline-none bg-slate-50" value={item.color} placeholder="Màu" onChange={e => updateItemField(idx, 'color', e.target.value)} />
                                    </div>
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => updateQty(idx, item.quantity - 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center transition-colors">−</button>
                                        <span className="w-8 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                                        <button onClick={() => updateQty(idx, item.quantity + 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center transition-colors">+</button>
                                    </div>
                                    <div className="text-right">
                                        <input type="number" className="w-full px-2 py-1 text-xs text-right border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 outline-none bg-slate-50 font-semibold" value={item.priceAtPurchase} onChange={e => updateItemField(idx, 'priceAtPurchase', Number(e.target.value))} />
                                        <p className="text-[10px] text-slate-400 mt-0.5 pr-1">= {(item.priceAtPurchase * item.quantity).toLocaleString('vi-VN')}đ</p>
                                    </div>
                                    <button onClick={() => removeItem(idx)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all" title="Xoá sản phẩm">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={addBlankItem} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all">
                                <Plus className="w-4 h-4" /> Thêm sản phẩm
                            </button>
                        </div>
                        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng tiền (tự tính)</p>
                                <p className="text-xl font-black text-slate-900">
                                    {calcTotal(draftItems).toLocaleString('vi-VN')}
                                    <span className="text-sm font-normal text-slate-500 ml-1">đ</span>
                                </p>
                                {calcTotal(draftItems) !== editItemsOrder.totalPrice && (
                                    <p className="text-[10px] text-amber-500 font-semibold mt-0.5">↑ Thay đổi so với ban đầu: {editItemsOrder.totalPrice.toLocaleString('vi-VN')}đ</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditItemsOrder(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-all">Huỷ</button>
                                <button onClick={handleSaveItems} disabled={savingItems || draftItems.length === 0} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                                    {savingItems ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />} Lưu & Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Chi tiết đơn #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-rose-500">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Người nhận</p>
                                    <p className="font-bold text-slate-900">{selectedOrder.receiverName}</p>
                                    <p className="text-xs text-slate-500">{selectedOrder.receiverPhone}</p>
                                    <p className="text-xs text-slate-500 italic mt-1">{selectedOrder.shippingAddress}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thanh toán</p>
                                    <p className="text-xl font-black text-blue-600">{selectedOrder.totalPrice.toLocaleString('vi-VN')}đ</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Trạng thái: <span className="font-semibold text-slate-700">{selectedOrder.status}</span></p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sản phẩm đã mua</p>
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg">
                                        <img src={item.image || 'https://placehold.co/48x48?text=?'} className="w-12 h-12 object-cover rounded border border-slate-100 shadow-sm" alt="" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-800">{item.productName}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Size: {item.size} | Màu: {item.color} | SL: <span className="font-semibold">{item.quantity}</span></p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">{item.priceAtPurchase.toLocaleString('vi-VN')}đ</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t flex justify-end">
                            <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-sm font-medium">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default OrderManager;



