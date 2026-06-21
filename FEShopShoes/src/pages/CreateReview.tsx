import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Star, Camera, Loader2, X } from "lucide-react";
// SỬA: Import axiosClient thay vì axios thuần
import axiosClient from "../api/axiosClient";

const CreateReview: React.FC = () => {
    const { productId, orderItemId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State quản lý dữ liệu
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State quản lý ảnh
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    const shoeTags = ["Đúng size", "Độ êm", "Chất liệu tốt", "Đẹp như ảnh", "Đế chắc chắn"];

    // 1. Lấy thông tin người dùng từ localStorage (được lưu khi login)
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        // Kiểm tra đăng nhập trước khi cho phép review
        if (!user.id) {
            alert("Vui lòng đăng nhập để thực hiện đánh giá!");
            navigate('/login');
            return;
        }

        const fetchProductInfo = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get(`/product/${productId}`);
                setProduct(res.data);
            } catch (err: any) {
                console.error("Lỗi khi lấy thông tin giày:", err);
            } finally {
                setLoading(false);
            }
        };
        if (productId) fetchProductInfo();
    }, [productId, navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...filesArray]);
            const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
            setPreviewImages((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Vui lòng chọn số sao đánh giá!");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();

        // 2. Phần JSON (Khớp với @RequestPart("review"))
        const reviewPayload = {
            userId: user.id, // Lấy userId động từ user đã đăng nhập
            productId: productId,
            orderItemId: orderItemId,
            rating: rating,
            comment: comment + (selectedTags.length > 0 ? ` (${selectedTags.join(", ")})` : ""),
            isAnonymous: isAnonymous,
        };

        formData.append("review", JSON.stringify(reviewPayload));

        // 3. Phần Files
        selectedFiles.forEach((file) => {
            formData.append("files", file);
        });

        try {
            // SỬA: Sử dụng axiosClient để tự động đính kèm JWT Token
            await axiosClient.post('/reviews', formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });
            alert("Cảm ơn bạn đã đánh giá sản phẩm!");
            navigate(-1);
        } catch (err: any) {
            console.error("Lỗi khi gửi đánh giá:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Không thể gửi đánh giá";
            alert(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto shadow-xl">
            {/* UI giữ nguyên như bản cũ của bạn... */}
            <div className="flex items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
                <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="flex-1 text-center text-[17px] font-bold mr-8 text-[#0F172A]">Viết đánh giá</h1>
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
                {/* Thông tin sản phẩm */}
                <div className="flex items-center gap-4 p-4 bg-[#F8FAFC]/50">
                    <img
                        src={product?.images?.[0] || "https://via.placeholder.com/80"}
                        alt={product?.name}
                        className="w-16 h-16 object-cover rounded-lg border border-[#E2E8F0]"
                    />
                    <div className="flex-1">
                        <h3 className="text-[14px] font-bold text-[#0F172A] line-clamp-2 leading-snug">
                            {product?.name || "Thông tin giày"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Phân loại: {product?.variant || "Chính hãng"}</p>
                    </div>
                </div>

                {/* Phần Đánh giá sao */}
                <div className="flex flex-col items-center py-10 border-b border-gray-50">
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className="transition-transform active:scale-125"
                            >
                                <Star
                                    size={44}
                                    strokeWidth={1.2}
                                    className={`${star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="mt-4 text-[15px] font-medium text-gray-700">
                        {rating > 0 ? `Bạn đã đánh giá ${rating} sao` : "Chấm điểm đôi giày của bạn"}
                        <span className="text-red-500 ml-1">*</span>
                    </p>
                </div>

                {/* Đặc điểm & Textarea */}
                <div className="p-4">
                    <p className="font-bold text-[14px] text-[#0F172A] mb-4">Chia sẻ cảm nhận về đôi giày</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                        {shoeTags.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={`px-4 py-2 rounded-full border text-[13px] font-medium transition-all ${selectedTags.includes(tag) ? "border-orange-500 text-orange-600 bg-orange-50" : "border-[#E2E8F0] text-gray-600"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <div className="relative border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] p-4">
                        <textarea
                            className="w-full bg-transparent outline-none text-[14px] min-h-[140px] resize-none text-gray-700"
                            placeholder="Bạn cảm thấy thế nào về kích cỡ, chất liệu và kiểu dáng?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <span className="absolute bottom-3 right-4 text-[11px] text-gray-400">{comment.length}/300</span>
                    </div>
                </div>

                {/* Phần Chọn Ảnh */}
                <div className="px-4 mt-2">
                    <p className="font-bold text-[14px] text-[#0F172A] mb-3">Hình ảnh thực tế</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {previewImages.map((src, index) => (
                            <div key={index} className="relative aspect-square">
                                <img src={src} className="w-full h-full object-cover rounded-lg border" alt="preview" />
                                <button onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={14} /></button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center bg-[#F8FAFC] text-gray-400"
                        >
                            <Camera size={24} />
                            <span className="text-[10px] mt-1">Thêm ảnh</span>
                        </button>
                    </div>
                    <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
            </div>

            <div className="p-4 border-t bg-white sticky bottom-0">
                <button
                    className={`w-full py-4 text-white font-bold rounded-xl transition-all ${rating > 0 ? "bg-[#ee4d2d] active:scale-[0.98]" : "bg-gray-300 cursor-not-allowed"} flex items-center justify-center gap-2 uppercase text-sm`}
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Gửi đánh giá"}
                </button>
            </div>
        </div>
    );
};

export default CreateReview;