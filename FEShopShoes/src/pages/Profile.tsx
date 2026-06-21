import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
    User, MapPin, Bell, LogOut, Camera, Loader2, Lock
} from 'lucide-react';

const Profile: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'account' | 'address' | 'password'>('account');
    const [vnUnits, setVnUnits] = useState<any[]>([]);

    // Form state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Address state
    const [province, setProvince] = useState('');
    const [ward, setWard] = useState('');
    const [specificAddress, setSpecificAddress] = useState('');

    // Password state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { logout, updateUser } = useAuth();

    useEffect(() => {
        fetchUserProfile();
        fetchVnUnits();
    }, [navigate]);

    const fetchVnUnits = async () => {
        try {
            const res = await axiosClient.get('/locations');
            setVnUnits(res.data);
        } catch (error) {
            console.error('Failed to fetch VN Units', error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const savedUser = localStorage.getItem('user');
            if (!savedUser) { navigate('/signin'); return; }
            const { id } = JSON.parse(savedUser);
            const response = await axiosClient.get(`/users/${id}`);

            setUser(response.data);
            setFullName(response.data.fullName || '');
            setPhone(response.data.phone || '');
            
            if (response.data.address) {
                setProvince(response.data.address.province || '');
                setWard(response.data.address.ward || '');
                setSpecificAddress(response.data.address.specificAddress || '');
            }
        } catch (err) {
            console.error("Lỗi tải thông tin");
        } finally { setIsLoading(false); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async () => {
        if (!user) return;
        
        if (!fullName.trim()) {
            alert("Vui lòng nhập họ và tên!");
            return;
        }

        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('phone', phone);
            
            if (province) formData.append('province', province);
            if (ward) formData.append('ward', ward);
            if (specificAddress) formData.append('specificAddress', specificAddress);

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await axiosClient.put(`/users/${user.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedUser = response.data;
            setUser(updatedUser);
            setSelectedFile(null);
            setPreviewUrl(null);

            updateUser({
                fullName: updatedUser.fullName,
                imageAvt: updatedUser.imageAvt
            });

            alert("Cập nhật thông tin thành công!");
            setIsEditing(false);
        } catch (err: any) {
            let errorMsg = "Lỗi khi cập nhật thông tin";
            if (err.response?.data?.fieldErrors) {
                errorMsg = Object.values(err.response.data.fieldErrors).join('\n');
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMsg = err.response.data;
            }
            alert("Lỗi:\n" + errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;
        if (!oldPassword || !newPassword || !confirmPassword) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Mật khẩu mới không khớp");
            return;
        }

        setIsSaving(true);
        try {
            await axiosClient.put(`/users/${user.id}/change-password`, {
                oldPassword,
                newPassword
            });
            alert("Đổi mật khẩu thành công!");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setActiveTab('account');
        } catch (err: any) {
            let errorMsg = "Lỗi khi đổi mật khẩu";
            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMsg = err.response.data;
            }
            alert("Lỗi:\n" + errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setFullName(user.fullName || '');
            setPhone(user.phone || '');
            if (user.address) {
                setProvince(user.address.province || '');
                setWard(user.address.ward || '');
                setSpecificAddress(user.address.specificAddress || '');
            } else {
                setProvince('');
                setWard('');
                setSpecificAddress('');
            }
        }
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            logout();
            navigate('/');
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:px-8">
            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8">
                
                {/* SIDEBAR */}
                <div className="w-full lg:w-72 shrink-0 space-y-6">
                    {/* User Info Box */}
                    <div className="bg-white p-6 shadow-sm border border-[#E2E8F0] flex items-center gap-4">
                        <div className="relative group w-16 h-16 shrink-0 rounded-full">
                            <div className="w-full h-full bg-[#2563EB] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm rounded-full">
                                <img
                                    src={previewUrl || user?.imageAvt || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            {isEditing && (
                                <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 cursor-pointer bg-black/50 text-white flex flex-col items-center justify-center transition-all z-10 rounded-full border-2 border-dashed border-white/80">
                                    <Camera size={18} />
                                    <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">Đổi ảnh</span>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-[17px] text-[#0F172A] truncate">{user?.fullName}</h3>
                            <p className="text-gray-500 text-sm truncate">{user?.email}</p>
                        </div>
                    </div>

                    {/* Menu Box */}
                    <div className="bg-white shadow-sm border border-[#E2E8F0] flex flex-col">
                        <button 
                            onClick={() => { setActiveTab('account'); setIsEditing(false); }}
                            className={`flex items-center gap-4 px-6 py-4 font-bold text-[15px] transition-colors ${activeTab === 'account' ? 'bg-[#2563EB] text-white' : 'text-gray-700 hover:bg-[#F8FAFC] border-t border-[#E2E8F0]'}`}>
                            <User size={20} strokeWidth={2.5} /> Tài khoản của tôi
                        </button>
                        <button 
                            onClick={() => { setActiveTab('address'); setIsEditing(false); }}
                            className={`flex items-center gap-4 px-6 py-4 font-bold text-[15px] transition-colors ${activeTab === 'address' ? 'bg-[#2563EB] text-white' : 'text-gray-700 hover:bg-[#F8FAFC] border-t border-[#E2E8F0]'}`}>
                            <MapPin size={20} strokeWidth={2.5} /> Địa chỉ nhận hàng
                        </button>
                        <button 
                            onClick={() => { setActiveTab('password'); setIsEditing(false); }}
                            className={`flex items-center gap-4 px-6 py-4 font-bold text-[15px] transition-colors ${activeTab === 'password' ? 'bg-[#2563EB] text-white' : 'text-gray-700 hover:bg-[#F8FAFC] border-t border-[#E2E8F0]'}`}>
                            <Lock size={20} strokeWidth={2.5} /> Đổi mật khẩu
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 text-[#2563EB] hover:bg-red-50 font-bold text-[15px] border-t border-[#E2E8F0] transition-colors">
                            <LogOut size={20} strokeWidth={2.5} /> Đăng xuất
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 bg-white p-8 md:p-10 shadow-sm border border-[#E2E8F0]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                        <div>
                            <h1 className="text-2xl font-black uppercase text-[#0F172A] tracking-tight">
                                {activeTab === 'account' ? 'HỒ SƠ CÁ NHÂN' : activeTab === 'address' ? 'ĐỊA CHỈ NHẬN HÀNG' : 'ĐỔI MẬT KHẨU'}
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                {activeTab === 'account' ? 'Quản lý thông tin hồ sơ để bảo mật tài khoản' : activeTab === 'address' ? 'Cập nhật địa chỉ để nhận hàng' : 'Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác'}
                            </p>
                        </div>
                        <div className="flex gap-4 shrink-0">
                            <button onClick={() => navigate('/profile/orders')} className="bg-[#2563EB] text-white px-6 py-2.5 font-bold text-[13px] tracking-wider uppercase hover:bg-[#1D4ED8] transition-colors">
                                ĐƠN HÀNG
                            </button>
                            <button onClick={() => navigate('/shop')} className="border-2 border-[#0F172A] text-[#0F172A] px-6 py-2.5 font-bold text-[13px] tracking-wider uppercase hover:bg-black hover:text-white transition-colors">
                                MUA SẮM
                            </button>
                        </div>
                    </div>

                    {activeTab === 'account' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
                            <div className="border-b border-[#E2E8F0] pb-2 relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Họ và tên</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full text-[#0F172A] text-[17px] font-medium focus:outline-none bg-transparent"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                    />
                                ) : (
                                    <div className="text-[#0F172A] text-[17px] font-medium">{fullName || 'Chưa cập nhật'}</div>
                                )}
                            </div>

                            <div className="border-b border-[#E2E8F0] pb-2 relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Số điện thoại</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full text-[#0F172A] text-[17px] font-medium focus:outline-none bg-transparent"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                    />
                                ) : (
                                    <div className="text-[#0F172A] text-[17px] font-medium">{phone || 'Chưa cập nhật'}</div>
                                )}
                            </div>

                            <div className="border-b border-[#E2E8F0] pb-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Email</label>
                                <div className="text-[#0F172A] text-[17px] font-medium">{user?.email}</div>
                            </div>

                            <div className="border-b border-[#E2E8F0] pb-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Ngày tham gia</label>
                                <div className="text-[#0F172A] text-[17px] font-medium">
                                    {/* Fallback or mock if backend doesn't provide createdAt */}
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '12 Tháng 10, 2023'}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'address' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
                            <div className="border-b border-[#E2E8F0] pb-2 relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Tỉnh/Thành phố</label>
                                {isEditing ? (
                                    <select
                                        className="w-full text-[#0F172A] text-[17px] font-medium focus:outline-none bg-transparent"
                                        value={province}
                                        onChange={e => { setProvince(e.target.value); setWard(''); }}
                                    >
                                        <option value="">Chọn Tỉnh/Thành phố</option>
                                        {vnUnits.map((p: any) => (
                                            <option key={p.Code} value={p.Name}>{p.Name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="text-[#0F172A] text-[17px] font-medium">{province || 'Chưa cập nhật'}</div>
                                )}
                            </div>

                            <div className="border-b border-[#E2E8F0] pb-2 relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Phường/Xã</label>
                                {isEditing ? (
                                    <select
                                        className="w-full text-[#0F172A] text-[17px] font-medium focus:outline-none bg-transparent"
                                        value={ward}
                                        onChange={e => setWard(e.target.value)}
                                        disabled={!province}
                                    >
                                        <option value="">Chọn Phường/Xã</option>
                                        {province && vnUnits.find((p: any) => p.Name === province)?.Wards.map((w: any) => (
                                            <option key={w.Code} value={w.Name}>{w.Name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="text-[#0F172A] text-[17px] font-medium">{ward || 'Chưa cập nhật'}</div>
                                )}
                            </div>

                            <div className="border-b border-[#E2E8F0] pb-2 relative md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Địa chỉ cụ thể</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full text-[#0F172A] text-[17px] font-medium focus:outline-none bg-transparent"
                                        value={specificAddress}
                                        onChange={e => setSpecificAddress(e.target.value)}
                                        placeholder="Số nhà, tên đường..."
                                    />
                                ) : (
                                    <div className="text-[#0F172A] text-[17px] font-medium">{specificAddress || 'Chưa cập nhật'}</div>
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'password' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-16">
                            <div className="border-b border-[#E2E8F0] pb-2 relative md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Mật khẩu cũ</label>
                                <input
                                    type="password"
                                    className="w-full text-[#0F172A] text-[17px] font-medium focus:outline-none bg-transparent"
                                    value={oldPassword}
                                    onChange={e => setOldPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu hiện tại"
                                />
                            </div>
                            <div className="border-b border-[#E2E8F0] pb-2 relative md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    className="w-full text-[#0F172A] text-[17px] font-medium focus:outline-none bg-transparent"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>
                            <div className="border-b border-[#E2E8F0] pb-2 relative md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    className="w-full text-[#0F172A] text-[17px] font-medium focus:outline-none bg-transparent"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Xác nhận mật khẩu mới"
                                />
                            </div>
                        </div>
                    ) : null}

                    <div className="mt-14 flex gap-4">
                        {activeTab === 'password' ? (
                            <button
                                onClick={handleChangePassword}
                                disabled={isSaving}
                                className="bg-[#2563EB] text-white px-8 py-3.5 font-bold text-[13px] tracking-widest uppercase hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                                ĐỔI MẬT KHẨU
                            </button>
                        ) : !isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-black text-white px-8 py-3.5 font-bold text-[13px] tracking-widest uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                CẬP NHẬT THÔNG TIN
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleUpdate}
                                    disabled={isSaving}
                                    className="bg-[#2563EB] text-white px-8 py-3.5 font-bold text-[13px] tracking-widest uppercase hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                                    LƯU THAY ĐỔI
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="bg-gray-200 text-[#0F172A] px-8 py-3.5 font-bold text-[13px] tracking-widest uppercase hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    HỦY
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;