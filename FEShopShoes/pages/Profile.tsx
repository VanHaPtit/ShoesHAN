import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
    User, Heart, MapPin, Bell, LogOut, Camera, Loader2
} from 'lucide-react';
import vnUnitsData from '../../full_json_generated_data_vn_units.json';

const Profile: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'wishlist'>('profile');

    // Form state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [province, setProvince] = useState('');
    const [ward, setWard] = useState('');
    const [specificAddress, setSpecificAddress] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        fetchUserProfile();
    }, [navigate]);

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
        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('phone', phone);
            formData.append('province', province);
            formData.append('ward', ward);
            formData.append('specificAddress', specificAddress);

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await axiosClient.put(`/users/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const updatedUser = response.data;
            setUser(updatedUser);
            setSelectedFile(null);
            setPreviewUrl(null);

            const local = JSON.parse(localStorage.getItem('user') || '{}');
            const newLocalUser = {
                ...local,
                fullName: updatedUser.fullName,
                imageAvt: updatedUser.imageAvt,
                phone: updatedUser.phone,
                address: updatedUser.address
            };
            localStorage.setItem('user', JSON.stringify(newLocalUser));

            alert("Cập nhật thông tin thành công!");
        } catch (err: any) {
            alert("Lỗi: " + (err.response?.data || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            logout();
            navigate('/');
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-12 px-4 md:px-8">
            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8">

                {/* SIDEBAR */}
                <div className="w-full lg:w-72 shrink-0 space-y-6">
                    <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="relative group w-16 h-16 shrink-0">
                            <div className="w-full h-full bg-[#c8102e] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                <img
                                    src={previewUrl || user?.imageAvt || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 cursor-pointer bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={16} />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-[17px] text-gray-900 truncate">{user?.fullName}</h3>
                            <p className="text-gray-500 text-sm truncate">{user?.email}</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm border border-gray-100 flex flex-col">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-4 px-6 py-4 font-bold text-[15px] transition-colors ${activeTab === 'profile' ? 'bg-[#c8102e] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <User size={20} strokeWidth={2.5} /> Tài khoản của tôi
                        </button>
                        <button
                            onClick={() => navigate('/wishlist')}
                            className="flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gray-50 font-bold text-[15px] border-t border-gray-100 transition-colors"
                        >
                            <Heart size={20} strokeWidth={2.5} /> Sản phẩm yêu thích
                        </button>
                        <button
                            onClick={() => setActiveTab('address')}
                            className={`flex items-center gap-4 px-6 py-4 font-bold text-[15px] border-t border-gray-100 transition-colors ${activeTab === 'address' ? 'bg-[#c8102e] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <MapPin size={20} strokeWidth={2.5} /> Địa chỉ nhận hàng
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 text-[#c8102e] hover:bg-red-50 font-bold text-[15px] border-t border-gray-100 transition-colors">
                            <LogOut size={20} strokeWidth={2.5} /> Đăng xuất
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 bg-white p-8 md:p-10 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                        <div>
                            <h1 className="text-2xl font-black uppercase text-gray-900 tracking-tight">
                                {activeTab === 'profile' ? 'HỒ SƠ CÁ NHÂN' : 'ĐỊA CHỈ NHẬN HÀNG'}
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                {activeTab === 'profile' ? 'Quản lý thông tin hồ sơ để bảo mật tài khoản' : 'Quản lý địa chỉ giao hàng của bạn'}
                            </p>
                        </div>
                        <div className="flex gap-4 shrink-0">
                            <button onClick={() => navigate('/profile/orders')} className="bg-[#c8102e] text-white px-6 py-2.5 font-bold text-[13px] tracking-wider uppercase hover:bg-red-800 transition-colors">
                                ĐƠN HÀNG
                            </button>
                            <button onClick={() => navigate('/shop')} className="border-2 border-black text-black px-6 py-2.5 font-bold text-[13px] tracking-wider uppercase hover:bg-black hover:text-white transition-colors">
                                MUA SẮM
                            </button>
                        </div>
                    </div>

                    {activeTab === 'profile' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
                            <div className="border-b border-gray-100 pb-2 relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Họ và tên</label>
                                <input
                                    type="text"
                                    className="w-full text-gray-900 text-[17px] font-medium focus:outline-none bg-transparent"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                />
                            </div>

                            <div className="border-b border-gray-100 pb-2 relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Số điện thoại</label>
                                <input
                                    type="text"
                                    className="w-full text-gray-900 text-[17px] font-medium focus:outline-none bg-transparent"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="border-b border-gray-100 pb-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Email</label>
                                <div className="text-gray-900 text-[17px] font-medium">{user?.email}</div>
                            </div>

                            <div className="border-b border-gray-100 pb-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Ngày tham gia</label>
                                <div className="text-gray-900 text-[17px] font-medium">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '12 Tháng 10, 2023'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
                            <div className="border-b border-gray-100 pb-2 relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Tỉnh / Thành phố</label>
                                <select
                                    className="w-full text-gray-900 text-[17px] font-medium focus:outline-none bg-transparent appearance-none"
                                    value={province}
                                    onChange={e => {
                                        setProvince(e.target.value);
                                        setWard('');
                                    }}
                                >
                                    <option value="">Chọn tỉnh / thành phố</option>
                                    {vnUnitsData.map((p: any) => (
                                        <option key={p.Code} value={p.FullName}>
                                            {p.FullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="border-b border-gray-100 pb-2 relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Phường / Xã</label>
                                <select
                                    className="w-full text-gray-900 text-[17px] font-medium focus:outline-none bg-transparent appearance-none"
                                    value={ward}
                                    onChange={e => setWard(e.target.value)}
                                    disabled={!province}
                                >
                                    <option value="">Chọn phường / xã</option>
                                    {province && vnUnitsData.find((p: any) => p.FullName === province)?.Wards?.map((w: any) => (
                                        <option key={w.Code} value={w.FullName}>
                                            {w.FullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="border-b border-gray-100 pb-2 relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Địa chỉ cụ thể</label>
                                <input
                                    type="text"
                                    className="w-full text-gray-900 text-[17px] font-medium focus:outline-none bg-transparent"
                                    value={specificAddress}
                                    onChange={e => setSpecificAddress(e.target.value)}
                                    placeholder="Số nhà, tên đường..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-14">
                        <button
                            onClick={handleUpdate}
                            disabled={isSaving}
                            className="bg-black text-white px-8 py-3.5 font-bold text-[13px] tracking-widest uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                            CẬP NHẬT THÔNG TIN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;