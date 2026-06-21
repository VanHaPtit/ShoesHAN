import axiosClient from "../../api/axiosClient";
import React, { useState, useMemo } from 'react';
import {
    User as UserIcon, Mail, Phone,
    ToggleLeft, ToggleRight, Send, X, CheckSquare,
    Loader2, Filter, RefreshCcw, Gift, ShoppingCart, Check
} from 'lucide-react';
import { User } from '../../types/admin';
import axios from 'axios';


interface UserManagerProps {
    users: User[];
    onToggleStatus: (id: number) => void;
}

const ITEMS_PER_PAGE = 16;

const UserManager: React.FC<UserManagerProps> = ({ users, onToggleStatus }) => {
    const [currentPage, setCurrentPage] = useState(1);
    // ── State: Modal & Email Form ──────────────────────────────────────────────
    const [isMailModalOpen, setIsMailModalOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
    const [mailForm, setMailForm] = useState({ subject: '', content: '' });
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ success: number; failed: number } | null>(null);


    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const maskPhone = (phone: string) => {
        if (!phone || phone.length < 10) return phone;
        return phone.substring(0, 3) + '***' + phone.substring(phone.length - 4);
    };

    // ── State: Filter ──────────────────────────────────────────────────────────
    const [minPaidCount, setMinPaidCount] = useState<number>(1);
    const [isFiltering, setIsFiltering] = useState(false);
    const [qualifiedUserIds, setQualifiedUserIds] = useState<Set<number> | null>(null);


    // ── Derived data ───────────────────────────────────────────────────────────
    const customersOnly = useMemo(() =>
        users.filter(u => u.roles.some(r => r.name === 'USER' || r.name === 'ROLE_USER')),
        [users]
    );


    const displayedUsers = useMemo(() => {
        if (qualifiedUserIds === null) return customersOnly;
        return customersOnly.filter(u => u.id && qualifiedUserIds.has(u.id));
    }, [customersOnly, qualifiedUserIds]);


    // ── Helpers ────────────────────────────────────────────────────────────────
    const getToken = () => localStorage.getItem('token');


    const openModal = () => {
        setSendResult(null);
        setSelectedUserIds(new Set());
        setMailForm({ subject: '', content: '' });
        setQualifiedUserIds(null);
        setMinPaidCount(1);
        setIsMailModalOpen(true);
    };


    const closeModal = () => setIsMailModalOpen(false);


    // ── Filter handler ─────────────────────────────────────────────────────────
    const handleFilterUsers = async () => {
        setIsFiltering(true);


        try {
            const response = await axiosClient.post(
                "/orders/check-condition",
                { minPaidCount }
            );


            const ids = new Set<number>(
                response.data.map((item: any) => item.userId)
            );


            setQualifiedUserIds(ids);
            setSelectedUserIds(new Set());


        } catch (error) {
            console.error("Lỗi khi lọc user:", error);
            alert("Lọc dữ liệu thất bại!");
        } finally {
            setIsFiltering(false);
        }
    };


    const handleClearFilter = () => {
        setQualifiedUserIds(null);
        setSelectedUserIds(new Set());
        setMinPaidCount(1);
        setMailForm({ subject: '', content: '' });
    };


    const handleFilterBirthdays = () => {
        const currentMonth = new Date().getMonth() + 1;
        const ids = new Set<number>();
        customersOnly.forEach(u => {
            if ((u as any).dateOfBirth) {
                const birthMonth = parseInt((u as any).dateOfBirth.split('-')[1], 10);
                if (birthMonth === currentMonth && u.id) {
                    ids.add(u.id);
                }
            }
        });


        setQualifiedUserIds(ids);
        setSelectedUserIds(new Set());
        setMailForm({
            subject: "🎉 Chúc Mừng Sinh Nhật Từ ShopShoes! 🎂",
            content: "Chào bạn,\n\nTháng này là tháng sinh nhật của bạn! ShopShoes chúc bạn một tháng sinh nhật vui vẻ, hạnh phúc và tràn đầy ý nghĩa.\nCảm ơn bạn đã luôn đồng hành và ủng hộ chúng tôi.\n\nTrân trọng,\nĐội ngũ FEShopShoes."
        });
    };


    // ── Selection handlers ─────────────────────────────────────────────────────
    const toggleRecipient = (id: number) => {
        setSelectedUserIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };


    const handleSelectAll = () => {
        if (selectedUserIds.size === displayedUsers.length && displayedUsers.length > 0) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(new Set(displayedUsers
                .filter(u => u.id !== undefined)
                .map(u => u.id as number)
            )));
        }
    };


    const allSelected = displayedUsers.length > 0 && selectedUserIds.size === displayedUsers.length;


    // ── Send email handler ─────────────────────────────────────────────────────
    const handleSendEmails = async () => {
        if (
            selectedUserIds.size === 0 ||
            !mailForm.subject.trim() ||
            !mailForm.content.trim()
        ) return;


        setIsSending(true);
        setSendResult(null);


        try {
            const selectedEmails = customersOnly
                .filter(u => u.id && selectedUserIds.has(u.id))
                .map(u => u.email);


            const results = await Promise.allSettled(
                selectedEmails.map(email =>
                    axiosClient.post("/mail/send", {
                        toEmail: email,
                        subject: mailForm.subject,
                        content: mailForm.content
                    })
                )
            );


            const success = results.filter(r => r.status === "fulfilled").length;
            const failed = results.filter(r => r.status === "rejected").length;


            setSendResult({ success, failed });


            if (failed === 0) {
                setTimeout(() => {
                    setMailForm({ subject: "", content: "" });
                    setSelectedUserIds(new Set());
                    setSendResult(null);
                }, 1500);
            }


        } catch (error) {
            console.error("Send mail error:", error);
            alert("Gửi email thất bại!");
        } finally {
            setIsSending(false);
        }
    };


    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* TOP BAR */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">
                        USER MANAGEMENT
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Hệ thống đang có {users.length} thành viên
                    </p>
                </div>


                <button
                    onClick={openModal}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                    <Send className="w-4 h-4" /> Send Email
                </button>
            </div>


            {/* USER CARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                {users.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((user) => (
                    <div
                        key={user.id}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-5 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border flex items-center justify-center">
                                    {user.imageAvt
                                        ? <img src={user.imageAvt} className="w-full h-full object-cover" alt="avatar" />
                                        : <UserIcon className="text-slate-400" size={22} />
                                    }
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-none">{user.fullName}</h3>
                                    <p className="text-[10px] font-black uppercase text-blue-500 mt-2">
                                        {user.roles.map(r => r.name).join(', ')}
                                    </p>
                                </div>
                            </div>
                            {/* Nút bật/tắt trạng thái đã được gỡ bỏ theo yêu cầu */}
                        </div>


                        <div className="text-sm text-slate-500 space-y-1">
                            <div className="flex items-center gap-2">
                                <Mail size={14} />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} />
                                <span>{user.phone}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {Math.ceil(users.length / ITEMS_PER_PAGE) > 1 && (
                <div className="flex justify-center items-center mt-8 gap-4 pb-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-5 py-2 border-2 border-slate-200 rounded-xl disabled:opacity-50 font-black uppercase text-[10px] tracking-widest text-slate-500 hover:border-slate-300 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Page {currentPage} of {Math.ceil(users.length / ITEMS_PER_PAGE)}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(users.length / ITEMS_PER_PAGE), p + 1))}
                        disabled={currentPage === Math.ceil(users.length / ITEMS_PER_PAGE)}
                        className="px-5 py-2 border-2 border-slate-200 rounded-xl disabled:opacity-50 font-black uppercase text-[10px] tracking-widest text-slate-500 hover:border-slate-300 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* EMAIL MODAL */}
            {isMailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row relative">
                        
                        {/* ── NÚT ĐÓNG MODAL Ở GÓC TRÊN CÙNG BÊN PHẢI ── */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors z-10"
                            title="Đóng"
                        >
                            <X size={16} />
                        </button>

                        {/* ── CỘT TRÁI: Bộ lọc & Danh sách người nhận ── */}
                        <div className="w-full sm:w-[40%] border-r border-slate-100 flex flex-col bg-white">

                            {/* Header bộ lọc */}
                            <div className="p-6 space-y-6 flex-shrink-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold uppercase text-[15px] text-[#0f172a]">
                                        BỘ LỌC ĐỐI TƯỢNG
                                    </h4>
                                    <Filter size={18} className="text-blue-600" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[12px] font-medium text-slate-500">
                                        Lọc theo số đơn hàng tối thiểu
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400">
                                            <ShoppingCart size={16} />
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Nhập số đơn hàng"
                                            value={minPaidCount === 1 ? '' : minPaidCount}
                                            onChange={(e) => setMinPaidCount(e.target.value === '' ? 1 : Number(e.target.value))}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilterUsers()}
                                            className="w-full pl-10 pr-12 py-3 bg-white rounded-lg border border-slate-200 outline-none text-sm focus:border-blue-500 transition-colors"
                                        />
                                        <button 
                                            onClick={handleFilterUsers}
                                            className="absolute right-2 p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                                        >
                                            {isFiltering ? <Loader2 size={14} className="animate-spin" /> : <Filter size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        onClick={handleFilterBirthdays}
                                        className="w-full bg-[#f0f4ff] text-[#2563eb] border border-transparent px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm hover:bg-[#e0eaff] transition-colors"
                                    >
                                        <Gift size={18} /> Lọc sinh nhật tháng này
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-3 border-y border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Danh sách khách hàng</span>
                                <span className="text-[11px] font-bold text-blue-600 tracking-wide">{displayedUsers.length} Đối tượng</span>
                            </div>

                            {/* Danh sách user */}
                            <div className="flex-grow overflow-y-auto p-4 space-y-1">
                                {displayedUsers.length === 0 ? (
                                    <div className="text-center text-sm text-slate-400 font-medium py-10">
                                        Không tìm thấy người dùng nào
                                    </div>
                                ) : (
                                    displayedUsers.map(u => {
                                        const isSelected = selectedUserIds.has(u.id as number);
                                        return (
                                            <div
                                                key={u.id}
                                                onClick={() => u.id && toggleRecipient(u.id)}
                                                className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-all hover:bg-slate-50`}
                                            >
                                                <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-all
                                                    ${isSelected
                                                        ? 'bg-blue-600 border-blue-600 text-white'
                                                        : 'border-slate-300 bg-white'
                                                    }`}
                                                >
                                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-[#e0eaff] flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 uppercase">
                                                    {getInitials(u.fullName)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{u.fullName}</p>
                                                    <p className="text-xs text-slate-500 truncate">{u.phone ? maskPhone(u.phone) : 'Chưa cập nhật'}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Chọn tất cả */}
                            <div className="p-4 bg-white border-t border-slate-100 text-center flex-shrink-0">
                                <button
                                    onClick={handleSelectAll}
                                    disabled={displayedUsers.length === 0}
                                    className="text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:underline disabled:opacity-40 transition-opacity"
                                >
                                    {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả danh sách trên'}
                                </button>
                            </div>
                        </div>

                        {/* ── CỘT PHẢI: Form soạn thư ── */}
                        <div className="flex-grow flex flex-col bg-[#f8fafc] min-w-0">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-[#f8fafc] flex-shrink-0">
                                <h4 className="font-bold uppercase text-[15px] text-[#0f172a]">
                                    NỘI DUNG THƯ MUỐN GỬI
                                </h4>
                                <Mail size={20} className="text-blue-600 mr-8" /> 
                            </div>

                            {/* Form body */}
                            <div className="p-6 flex flex-col flex-grow overflow-y-auto">
                                {/* Thông báo kết quả */}
                                {sendResult && (
                                    <div className={`p-4 mb-4 rounded-xl border font-bold text-sm ${sendResult.failed === 0
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-amber-50 border-amber-200 text-amber-700'
                                        }`}>
                                        {sendResult.failed === 0
                                            ? `✅ Đã gửi thành công ${sendResult.success} email!`
                                            : `⚠️ Thành công: ${sendResult.success} — Thất bại: ${sendResult.failed}`
                                        }
                                    </div>
                                )}

                                <div className="space-y-2 mb-6">
                                    <label className="text-[12px] font-medium text-slate-500">
                                        Tiêu đề thư (Subject)
                                    </label>
                                    <input
                                        type="text"
                                        value={mailForm.subject}
                                        onChange={e => setMailForm(f => ({ ...f, subject: e.target.value }))}
                                        placeholder="Nhập tiêu đề thư..."
                                        className="w-full px-4 py-3 bg-white rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm font-medium transition-all"
                                    />
                                </div>

                                <div className="space-y-2 flex-grow flex flex-col">
                                    <label className="text-[12px] font-medium text-slate-500">
                                        Lời nhắn gửi đến khách hàng
                                    </label>
                                    <textarea
                                        value={mailForm.content}
                                        onChange={e => setMailForm(f => ({ ...f, content: e.target.value }))}
                                        placeholder="Viết nội dung tin nhắn của bạn tại đây..."
                                        className="w-full flex-grow min-h-[250px] p-4 bg-white rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm text-slate-600 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="p-6 border-t border-slate-200 bg-[#f8fafc] flex justify-end gap-3 flex-shrink-0">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSendEmails}
                                    disabled={isSending || selectedUserIds.size === 0 || !mailForm.subject || !mailForm.content}
                                    className="bg-[#2563eb] text-white px-8 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-blue-500/20"
                                >
                                    {isSending
                                        ? <><Loader2 className="animate-spin" size={16} /> Đang gửi...</>
                                        : <><Send size={16} /> Gửi thư ({selectedUserIds.size})</>
                                    }
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};


export default UserManager;

