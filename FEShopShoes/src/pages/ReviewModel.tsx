import React, { useState, useEffect } from 'react';
import { X, Star, Camera, Loader2, Trash2, ChevronLeft } from 'lucide-react';
import axiosClient from '../api/axiosClient';

interface Props {
    item: any;
    onClose: () => void;
    onSuccess: () => void;
}

const REVIEW_TAGS = ["Dung tích", "Chất liệu", "Độ bền", "Đặc điểm"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // Giới hạn 5MB mỗi ảnh ở client

const ReviewModel: React.FC<Props> = ({ item, onClose, onSuccess }) => {
    // 1. Đặt mặc định là 0 sao
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);

            // Kiểm tra dung lượng từng file trước khi thêm vào state
            const isTooLarge = filesArray.some(file => file.size > MAX_FILE_SIZE);
            if (isTooLarge) {
                alert("Một số file quá lớn (tối đa 5MB/ảnh). Vui lòng chọn ảnh khác!");
                return;
            }

            if (selectedFiles.length + filesArray.length > 5) {
                alert("Bạn chỉ được chọn tối đa 5 ảnh");
                return;
            }

            setSelectedFiles(prev => [...prev, ...filesArray]);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
        URL.revokeObjectURL(previews[index]);
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
    };

    const handleSubmit = async () => {
        // Validation: Bắt buộc chọn sao
        if (rating === 0) {
            alert("Vui lòng chọn số sao đánh giá!");
            return;
        }

        if (!comment.trim()) {
            alert("Vui lòng nhập nội dung đánh giá!");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const reviewData = {
                userId: user.id,
                productId: Number(item.productId),
                orderItemId: Number(item.id),
                rating: rating,
                comment: comment,
            };

            // Phải gửi đúng path /api/v1/reviews như trong Controller
            formData.append('review', JSON.stringify(reviewData));

            if (selectedFiles.length > 0) {
                selectedFiles.forEach(file => {
                    formData.append('files', file);
                });
            }

            await axiosClient.post('/reviews', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Cảm ơn bạn đã đánh giá!");
            onSuccess();
        } catch (err: any) {
            console.error("Lỗi gửi đánh giá:", err.response?.data);
            // Thông báo lỗi cụ thể nếu file vẫn quá lớn mặc dù đã check client
            const errorMsg = err.response?.status === 413
                ? "Dung lượng ảnh quá lớn, không thể gửi lên server!"
                : "Không thể gửi đánh giá. Vui lòng thử lại!";
            alert(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        return () => previews.forEach(url => URL.revokeObjectURL(url));
    }, []);

    return (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:h-[90vh] md:rounded-3xl md:shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="relative p-4 border-b flex items-center justify-center bg-white sticky top-0 z-10">
                <button onClick={onClose} className="absolute left-4 p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold">Viết đánh giá</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Product Info */}
                <div className="p-4 flex gap-3 border-b border-gray-50 bg-[#F8FAFC]/30">
                    <img
                        src={item?.image || "https://placehold.jp/100x100.png"}
                        className="w-16 h-16 object-cover rounded-lg border bg-white"
                        alt="product"
                    />
                    <div className="flex-1">
                        <h3 className="text-sm font-medium line-clamp-2 text-[#0F172A]">{item?.productName}</h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold">Phân loại: {item?.color}, {item?.size}</p>
                    </div>
                </div>

                {/* Rating Section */}
                <div className="p-8 text-center bg-white border-b border-gray-50">
                    <div className="flex justify-center gap-3 mb-4">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star
                                key={s}
                                size={40}
                                onClick={() => setRating(s)}
                                className={`cursor-pointer transition-all active:scale-125 hover:scale-110 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-base font-bold text-gray-700 h-6">
                        {rating === 5 ? "Tuyệt vời" : rating === 4 ? "Hài lòng" : rating === 3 ? "Bình thường" : rating === 2 ? "Không hài lòng" : rating === 1 ? "Tệ" : ""}
                    </p>
                    <p className="text-[13px] text-red-500 mt-2 font-medium">Chấm điểm đơn hàng của bạn*</p>
                </div>

                {/* Tags Section */}
                <div className="px-4 py-6">
                    <p className="text-sm font-semibold mb-4 text-gray-700">Chia sẻ suy nghĩ của bạn</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                        {REVIEW_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-4 py-1.5 rounded-lg border text-sm transition-all font-medium ${selectedTags.includes(tag)
                                    ? "border-red-500 text-red-500 bg-red-50"
                                    : "border-[#E2E8F0] text-gray-500 hover:border-gray-300"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Textarea */}
                    <div className="bg-[#F8FAFC] rounded-xl p-4 border border-transparent focus-within:border-red-200 transition-all">
                        <textarea
                            className="w-full bg-transparent outline-none text-sm min-h-[140px] resize-none text-gray-700"
                            placeholder="Bạn thích hoặc không thích điều gì về sản phẩm này? Hãy chia sẻ cho mọi người cùng biết nhé!"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="text-right text-xs text-gray-400 mt-2 font-medium">
                            {comment.length}/300
                        </div>
                    </div>
                </div>

                {/* Media Upload */}
                <div className="p-4 border-t border-gray-50">
                    <p className="text-sm font-semibold mb-4 text-gray-700">Thêm ảnh thực tế (Tối đa 5 ảnh)</p>
                    <div className="flex flex-wrap gap-3">
                        {previews.map((url, index) => (
                            <div key={index} className="relative w-24 h-24 group">
                                <img src={url} className="w-full h-full object-cover rounded-xl border shadow-sm" alt="preview" />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1.5 shadow-lg border-2 border-white hover:bg-red-500 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {previews.length < 5 && (
                            <label className="w-24 h-24 border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all text-gray-400">
                                <Camera size={32} strokeWidth={1.5} />
                                <span className="text-[10px] font-bold mt-2 uppercase tracking-tight">Thêm ảnh</span>
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Button */}
            <div className="p-4 bg-white border-t border-[#E2E8F0] shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#ee4d2d] text-white rounded-xl font-bold text-base hover:bg-[#d73211] transition-all disabled:bg-gray-300 flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            ĐANG GỬI...
                        </>
                    ) : (
                        "GỬI ĐÁNH GIÁ"
                    )}
                </button>
            </div>
        </div>
    );
};

export default ReviewModel;