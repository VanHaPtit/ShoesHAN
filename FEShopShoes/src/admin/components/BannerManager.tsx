import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, Save, X, Eye, EyeOff } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';


interface Banner {
    id?: number;
    bannerUrl: string;
    bannerTag: string;
    bannerTitle: string;
    bannerHighlight: string;
    bannerDescription: string;
    active: boolean;
    displayOrder: number | string;
}


const BannerManager: React.FC = () => {
    const { showToast } = useToast();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileRef = useRef<HTMLInputElement>(null);

    const [bannerInterval, setBannerInterval] = useState<number | ''>(5);
    const [isSavingInterval, setIsSavingInterval] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);


    const fetchBanners = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get('/banners');
            setBanners(res.data);
            const configRes = await axiosClient.get('/config/banner');
            if (configRes.data && configRes.data.bannerInterval !== undefined) {
                setBannerInterval(Math.max(1, Math.floor(configRes.data.bannerInterval / 1000)));
            }
        } catch (error) {
            showToast('Lỗi tải dữ liệu', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    const handleOpenModal = (banner?: Banner) => {
        if (banner) {
            setEditingBanner({ ...banner });
            setPreviewUrl(banner.bannerUrl);
        } else {
            setEditingBanner({
                bannerUrl: '',
                bannerTag: '',
                bannerTitle: '',
                bannerHighlight: '',
                bannerDescription: '',
                active: true,
                displayOrder: 0
            });
            setPreviewUrl('');
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBanner(null);
        setSelectedFile(null);
        setPreviewUrl('');
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };


    const handleSave = async () => {
        if (!editingBanner) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            // Default empty order to 0
            const orderToSave = editingBanner.displayOrder === '' ? 0 : Number(editingBanner.displayOrder);

            formData.append('banner', new Blob([JSON.stringify({
                ...editingBanner,
                displayOrder: orderToSave
            })], { type: 'application/json' }));


            if (editingBanner.id) {
                await axiosClient.put(`/banners/${editingBanner.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast('Cập nhật banner thành công', 'success');
            } else {
                await axiosClient.post('/banners', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast('Thêm banner thành công', 'success');
            }

            fetchBanners();
            handleCloseModal();
        } catch (error) {
            console.error(error);
            showToast('Lỗi khi lưu banner', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleToggleActive = async (banner: Banner) => {
        try {
            await axiosClient.put(`/banners/${banner.id}/toggle`);
            fetchBanners();
            showToast(`Đã ${banner.active ? 'ẩn' : 'hiện'} banner`, 'success');
        } catch (error) {
            showToast('Lỗi cập nhật trạng thái', 'error');
        }
    };


    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
        try {
            await axiosClient.delete(`/banners/${id}`);
            fetchBanners();
            showToast('Đã xóa banner', 'success');
        } catch (error) {
            showToast('Lỗi xóa banner', 'error');
        }
    };

    const handleSaveInterval = async () => {
        setIsSavingInterval(true);
        try {
            const intervalMs = (bannerInterval || 1) * 1000;
            await axiosClient.put(`/config/banner-interval?interval=${intervalMs}`);
            showToast('Cập nhật thời gian chuyển slide thành công', 'success');
        } catch (error) {
            showToast('Lỗi cập nhật thời gian', 'error');
        } finally {
            setIsSavingInterval(false);
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">BANNER MANAGEMENT</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Danh sách banner và cấu hình hiển thị trang chủ</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">THỜI GIAN CHUYỂN (GIÂY):</label>
                        <input
                            type="number"
                            min="1"
                            value={bannerInterval}
                            onChange={e => {
                                const val = e.target.value;
                                setBannerInterval(val === '' ? '' : Math.max(1, parseInt(val) || 1));
                            }}
                            className="w-14 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 font-bold text-center"
                        />
                        <button
                            onClick={handleSaveInterval}
                            disabled={isSavingInterval}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                            {isSavingInterval ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            LƯU
                        </button>
                    </div >
    <button
        onClick={() => handleOpenModal()}
        className="flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-[#1D4ED8] transition-all whitespace-nowrap"
    >
        <Plus size={18} />
        THÊM BANNER
    </button>
                </div >
            </div >


    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Hình ảnh</th>
                    <th className="px-6 py-4 font-bold">Thông tin</th>
                    <th className="px-6 py-4 font-bold">Thứ tự</th>
                    <th className="px-6 py-4 font-bold text-center">Trạng thái</th>
                    <th className="px-6 py-4 font-bold text-right">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {banners.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                            Chưa có banner nào.
                        </td>
                    </tr>
                ) : banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <img src={banner.bannerUrl} alt="Banner" className="w-32 h-16 object-cover rounded-lg border border-gray-200" />
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{banner.bannerTitle || '(Trống)'}</div>
                            <div className="text-xs text-blue-600 font-medium">{banner.bannerTag}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{banner.bannerDescription}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                            {banner.displayOrder}
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button
                                onClick={() => handleToggleActive(banner)}
                                className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                            >
                                {banner.active ? <Eye size={14} /> : <EyeOff size={14} />}
                                {banner.active ? 'HIỂN THỊ' : 'ĐANG ẨN'}
                            </button>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => handleOpenModal(banner)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(banner.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>


{/* Modal */ }
{
    isModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-lg">{editingBanner.id ? 'Sửa Banner' : 'Thêm Banner Mới'}</h3>
                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Image Preview */}
                    <div className="w-full h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden flex flex-col items-center justify-center relative group">
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <button onClick={() => fileRef.current?.click()} className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm">
                                        Thay ảnh
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center text-gray-500">
                                <ImageIcon size={32} className="mb-2 text-gray-400" />
                                <span className="text-sm font-bold">Chọn ảnh banner</span>
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Thẻ (Tag)</label>
                            <input
                                type="text"
                                value={editingBanner.bannerTag}
                                onChange={e => setEditingBanner({ ...editingBanner, bannerTag: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="VD: SẢN PHẨM MỚI"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Tiêu đề (Title)</label>
                            <input
                                type="text"
                                value={editingBanner.bannerTitle}
                                onChange={e => setEditingBanner({ ...editingBanner, bannerTitle: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Đoạn nổi bật</label>
                            <input
                                type="text"
                                value={editingBanner.bannerHighlight}
                                onChange={e => setEditingBanner({ ...editingBanner, bannerHighlight: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Thứ tự ưu tiên (Nhỏ xếp trước)</label>
                            <input
                                type="number"
                                min="0"
                                value={editingBanner.displayOrder}
                                onChange={e => setEditingBanner({ ...editingBanner, displayOrder: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Mô tả</label>
                            <textarea
                                value={editingBanner.bannerDescription}
                                onChange={e => setEditingBanner({ ...editingBanner, bannerDescription: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                            />
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="bannerActive"
                                checked={editingBanner.active}
                                onChange={e => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="bannerActive" className="text-sm font-medium text-gray-700">Kích hoạt hiển thị</label>
                        </div>
                    </div>
                </div>


                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <button onClick={handleCloseModal} className="px-5 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        HỦY
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting || (!selectedFile && !previewUrl)}
                        className="px-6 py-2 bg-[#2563EB] text-white font-bold rounded-lg hover:bg-[#1D4ED8] shadow-md disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        LƯU BANNER
                    </button>
                </div>
            </div>
        </div>
    )
}
        </div >
    );
};


export default BannerManager;



