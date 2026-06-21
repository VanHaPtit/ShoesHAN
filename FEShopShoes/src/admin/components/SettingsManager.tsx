import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

const SettingsManager: React.FC = () => {
    const { showToast } = useToast();
    const [bannerUrl, setBannerUrl] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [tag, setTag] = useState('');
    const [title, setTitle] = useState('');
    const [highlight, setHighlight] = useState('');
    const [desc, setDesc] = useState('');
    const [bannerInterval, setBannerInterval] = useState<number | ''>(5); // Default 5 minutes

    useEffect(() => {
        loadBanner();
    }, []);

    const loadBanner = async () => {
        try {
            const res = await axiosClient.get('/config/banner');
            const data = res.data;
            if (data) {
                if (data.bannerUrl) {
                    setBannerUrl(data.bannerUrl);
                    setPreviewUrl(data.bannerUrl);
                }
                if (data.bannerTag !== undefined && data.bannerTag !== null) setTag(data.bannerTag);
                if (data.bannerTitle !== undefined && data.bannerTitle !== null) setTitle(data.bannerTitle);
                if (data.bannerHighlight !== undefined && data.bannerHighlight !== null) setHighlight(data.bannerHighlight);
                if (data.bannerDescription !== undefined && data.bannerDescription !== null) setDesc(data.bannerDescription);
                if (data.bannerInterval !== undefined && data.bannerInterval !== null) {
                    setBannerInterval(Math.max(1, Math.floor(data.bannerInterval / 60000))); // Chuyển từ ms sang phút
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveBanner = async () => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            if (selectedFile) formData.append('file', selectedFile);
            formData.append('tag', tag);
            formData.append('title', title);
            formData.append('highlight', highlight);
            formData.append('desc', desc);

            const res = await axiosClient.post('/config/banner', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data && res.data.bannerUrl) {
                setBannerUrl(res.data.bannerUrl);
            }
            
            // Lưu bannerInterval
            const intervalMs = (bannerInterval || 1) * 60000; // Phút sang ms
            await axiosClient.put('/config/banner-interval', { bannerInterval: intervalMs });
            
            setSelectedFile(null);
            showToast("Cập nhật Banner thành công", "success");
        } catch (error) {
            console.error(error);
            showToast("Lỗi khi tải ảnh lên", "error");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">WEBSITE SETTINGS</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Quản lý banner quảng cáo và các cài đặt chung</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]/50 flex items-center gap-3">
                    <ImageIcon size={20} className="text-gray-400" />
                    <h3 className="font-bold text-[#0F172A] text-sm">Quản lý Banner Quảng Cáo</h3>
                </div>
                
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-4">
                            Ảnh banner sẽ được hiển thị ở trang chủ để quảng bá chiến dịch mới nhất của bạn.
                        </p>
                        
                        {/* Preview */}
                        <div className="w-full h-[300px] bg-[#F8FAFC] rounded-xl border-2 border-dashed border-[#E2E8F0] overflow-hidden flex flex-col items-center justify-center relative group">
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer bg-white text-[#0F172A] px-4 py-2 rounded-lg font-bold text-sm shadow-xl hover:bg-gray-100 transition-colors">
                                            Thay đổi ảnh
                                            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-400">
                                        <Upload size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-600">Click để chọn ảnh banner</span>
                                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Text fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Thẻ (Tag)</label>
                            <input 
                                type="text" 
                                value={tag} 
                                onChange={e => setTag(e.target.value)} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                                placeholder="VD: SẢN PHẨM MỚI"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề (Title)</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                                placeholder="VD: CHINH PHỤC"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Đoạn nổi bật (Highlight)</label>
                            <input 
                                type="text" 
                                value={highlight} 
                                onChange={e => setHighlight(e.target.value)} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                                placeholder="VD: MỌI GIỚI HẠN"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian chuyển Slide (Phút)</label>
                            <input 
                                type="number" 
                                min="1"
                                value={bannerInterval} 
                                onChange={e => {
                                    const val = e.target.value;
                                    setBannerInterval(val === '' ? '' : Math.max(1, parseInt(val) || 1));
                                }} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                                placeholder="VD: 5"
                            />
                            <p className="text-xs text-gray-500 mt-1">Khoảng thời gian banner tự động chuyển tiếp (Tối thiểu 1 phút)</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả (Description)</label>
                            <textarea 
                                value={desc} 
                                onChange={e => setDesc(e.target.value)} 
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                                placeholder="VD: Trải nghiệm sự kết hợp hoàn hảo..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        {selectedFile && (
                            <button
                                onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(bannerUrl);
                                }}
                                className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                disabled={isUploading}
                            >
                                HỦY
                            </button>
                        )}
                        <button
                            onClick={handleSaveBanner}
                            disabled={isUploading}
                            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                                ${!isUploading 
                                    ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-lg shadow-red-200" 
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    ĐANG LƯU...
                                </>
                            ) : (
                                "LƯU BANNER"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsManager;
