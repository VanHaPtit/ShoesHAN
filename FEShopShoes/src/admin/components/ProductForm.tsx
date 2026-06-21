

import React, { useState, useEffect, useRef } from 'react';
import {
    X, Plus, Trash2, Wand2, Loader2, Save,
    Image as ImageIcon, Upload, AlertCircle,
    Package, Layers, Tag, RefreshCw
} from 'lucide-react';
import { Product, ProductVariant, Category, Brand } from '../../types/admin';
// import { productApi, variantApi } from '../services/adminApi';
import { productApi, variantApi } from '../api/adminApi';
interface ProductFormProps {
    product?: Product;       // undefined = create mode
    categories: Category[];
    brands: Brand[];
    onSave: (product: Product) => void;
    onClose: () => void;
}

const blankProduct = (): Product => ({
    name: '', description: '', basePrice: '' as unknown as number, salePrice: null,
    totalSold: 0, category: null, brand: null,
    images: [], slug: '', active: true,
    gender: 'UNISEX', material: '', soleType: '', origin: '',
});

// Tạo slug từ tên sản phẩm
const toSlug = (name: string) =>
    name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

// ─── ProductForm ─────────────────────────────────────────────────────────────
const ProductForm: React.FC<ProductFormProps> = ({ product, categories, brands, onSave, onClose }) => {
    const isEdit = !!product?.id;

    const [form, setForm] = useState<Product>(() => product ? { ...product } : blankProduct());
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [loadingVars, setLoadingVars] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Load variants khi edit
    useEffect(() => {
        if (isEdit && product!.id) {
            setLoadingVars(true);
            variantApi.getByProduct(product!.id)
                .then(setVariants)
                .catch(() => setError('Không tải được variants'))
                .finally(() => setLoadingVars(false));
        }
    }, [isEdit, product?.id]);

    // Cleanup blob URLs khi unmount
    useEffect(() => {
        return () => previews.forEach(url => URL.revokeObjectURL(url));
    }, []);

    const update = (patch: Partial<Product>) => setForm(prev => ({ ...prev, ...patch }));

    const isSalePriceInvalid = form.salePrice != null && form.salePrice >= form.basePrice;

    // ── File handling ─────────────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setNewFiles(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        // Reset input để có thể chọn lại cùng file
        e.target.value = '';
    };

    const removeNewFile = (idx: number) => {
        URL.revokeObjectURL(previews[idx]);
        setNewFiles(prev => prev.filter((_, i) => i !== idx));
        setPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const removeExistingImage = (idx: number) =>
        update({ images: form.images.filter((_, i) => i !== idx) });

    // ── AI Generate (removed) ────────────────────────────────────────────────
    const addVariant = () =>
        setVariants(prev => [...prev, { size: 40, color: 'Black', stock: 10, price: form.basePrice }]);

    const updateVariant = (idx: number, patch: Partial<ProductVariant>) =>
        setVariants(prev => prev.map((v, i) => i === idx ? { ...v, ...patch } : v));

    const removeVariant = async (idx: number) => {
        const v = variants[idx];
        if (v.id) {
            try {
                await variantApi.delete(v.id);
            } catch (e: any) {
                setError(e?.response?.data?.message ?? 'Không xóa được variant');
                return;
            }
        }
        setVariants(prev => prev.filter((_, i) => i !== idx));
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.name.trim()) return;

        // Validate variants
        for (const v of variants) {
            if (!v.color || !v.color.trim() || !isNaN(Number(v.color))) {
                setError(`Màu sắc "${v.color}" không hợp lệ. Vui lòng nhập chuỗi ký tự (vd: Đen, Trắng).`);
                return;
            }
        }

        setSaving(true);
        setError(null);

        try {
            // Bước 1: Lưu product (multipart/form-data) qua axiosClient
            const productPayload: Product = {
                ...form,
                salePrice: form.salePrice == null ? form.basePrice : form.salePrice,
                // Không gửi variants vào Product entity - BE không dùng field này
                variants: undefined,
            };

            let saved: Product;
            if (isEdit) {
                saved = await productApi.update(product!.id!, productPayload, newFiles);
            } else {
                saved = await productApi.create(productPayload, newFiles);
            }

            // Bước 2: Lưu từng variant qua /api/v1/variant
            if (saved.id) {
                for (const v of variants) {
                    if (v.id) {
                        // Variant đã tồn tại → PUT
                        await variantApi.update(v.id, saved.id, v);
                    } else {
                        // Variant mới → POST
                        await variantApi.create(saved.id, {
                            size: v.size,
                            color: v.color,
                            stock: v.stock,
                            price: v.price,
                        });
                    }
                }
            }

            // Bước 3: Thông báo cho parent component
            onSave({ ...saved, variants });

        } catch (e: any) {
            let errorMsg = 'Lưu thất bại. Vui lòng thử lại.';
            if (e?.response?.data) {
                const data = e.response.data;
                if (data.fieldErrors) {
                    errorMsg = Object.values(data.fieldErrors).join(' - ');
                } else if (data.message) {
                    errorMsg = data.message;
                } else if (typeof data === 'string') {
                    errorMsg = data;
                }
            } else if (e?.message) {
                errorMsg = e.message;
            }
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-end">
            <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col">

                {/* Header */}
                <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isEdit ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                        </h2>
                        <p className="text-slate-500 text-sm">Điền thông tin chi tiết cho sản phẩm của bạn</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </header>

                {/* Error Banner */}
                {error && (
                    <div className="mx-8 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-2">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* ── Section 1: Basic Info ─────────────────────────── */}
                    <FormSection icon={<Package className="w-5 h-5 text-blue-600" />} title="Thông Tin Cơ Bản">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <Label>Tên sản phẩm <Required /></Label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => update({ name: e.target.value, slug: toSlug(e.target.value) })}
                                    className={input}
                                    placeholder="Vd. Nike Air Max 2024"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <Label>Đường dẫn (Slug)</Label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={e => update({ slug: e.target.value })}
                                    className={input + ' font-mono text-sm'}
                                    placeholder="nike-air-max-2024"
                                />
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center justify-between mb-1">
                                    <Label>Mô tả chi tiết</Label>
                                </div>
                                <textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={e => update({ description: e.target.value })}
                                    className={input}
                                    placeholder="Mô tả các tính năng và ưu điểm của sản phẩm..."
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* ── Section 2: Category & Specs ───────────────────── */}
                    <FormSection icon={<Layers className="w-5 h-5 text-indigo-600" />} title="Danh Mục & Thuộc Tính">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <Label>Danh mục</Label>
                                <select
                                    value={form.category?.id ?? ''}
                                    onChange={e => update({ category: categories.find(c => c.id === Number(e.target.value)) ?? null })}
                                    className={input}
                                >
                                    <option value="">Chọn Danh Mục</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Thương hiệu</Label>
                                <select
                                    value={form.brand?.id ?? ''}
                                    onChange={e => update({ brand: brands.find(b => b.id === Number(e.target.value)) ?? null })}
                                    className={input}
                                >
                                    <option value="">Chọn Thương Hiệu</option>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Giới tính</Label>
                                <select value={form.gender} onChange={e => update({ gender: e.target.value })} className={input}>
                                    <option value="UNISEX">Unisex</option>
                                    <option value="MEN">Nam</option>
                                    <option value="WOMEN">Nữ</option>
                                </select>
                            </div>
                            <div>
                                <Label>Chất liệu</Label>
                                <input type="text" value={form.material} onChange={e => update({ material: e.target.value })} className={input} placeholder="Da, Vải lưới..." />
                            </div>
                            <div>
                                <Label>Loại đế</Label>
                                <input type="text" value={form.soleType} onChange={e => update({ soleType: e.target.value })} className={input} placeholder="Cao su, Boost..." />
                            </div>
                            <div>
                                <Label>Xuất xứ</Label>
                                <input type="text" value={form.origin} onChange={e => update({ origin: e.target.value })} className={input} placeholder="Việt Nam, Trung Quốc..." />
                            </div>
                        </div>
                    </FormSection>

                    {/* ── Section 3: Pricing ────────────────────────────── */}
                    <FormSection icon={<Tag className="w-5 h-5 text-emerald-600" />} title="Giá Cả">
                        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <div>
                                <Label>Giá gốc (VND) <Required /></Label>
                                <input
                                    type="number"
                                    value={form.basePrice || ''}
                                    onChange={e => update({ basePrice: e.target.value === '' ? '' as any : Number(e.target.value) })}
                                    className={input}
                                />
                            </div>
                            <div>
                                <Label>Giá khuyến mãi (VND) <span className="text-slate-400 font-normal text-xs ml-1">(không bắt buộc)</span></Label>
                                <input
                                    type="number"
                                    value={form.salePrice ?? ''}
                                    onChange={e => update({ salePrice: e.target.value === '' ? null : Number(e.target.value) })}
                                    className={input}
                                    placeholder="Bỏ trống nếu không giảm giá"
                                />
                            </div>
                            {form.salePrice != null && form.salePrice >= form.basePrice && (
                                <p className="col-span-2 text-xs text-amber-600 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> Giá khuyến mãi phải nhỏ hơn giá gốc.
                                </p>
                            )}
                        </div>
                    </FormSection>

                    {/* ── Section 4: Variants ───────────────────────────── */}
                    <FormSection
                        icon={<RefreshCw className="w-5 h-5 text-orange-500" />}
                        title="Kho Hàng & Phân Loại"
                        action={
                            <button
                                onClick={addVariant}
                                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Thêm Phân Loại
                            </button>
                        }
                    >
                        {loadingVars ? (
                            <div className="flex items-center gap-2 text-slate-400 py-4 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải phân loại…
                            </div>
                        ) : (
                            <div className="overflow-hidden border border-slate-200 rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            {['Size', 'Màu sắc', 'Tồn kho', 'Giá riêng', ''].map((h, i) => (
                                                <th key={i} className="px-4 py-3 font-semibold text-slate-600">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {variants.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                                                    Chưa có variants. Nhấn "Add Variant" để thêm.
                                                </td>
                                            </tr>
                                        ) : variants.map((v, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-2">
                                                    <input type="number" value={v.size}
                                                        onChange={e => updateVariant(idx, { size: Number(e.target.value) })}
                                                        className={varInput + ' w-20'} />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input type="text" value={v.color}
                                                        onChange={e => updateVariant(idx, { color: e.target.value })}
                                                        className={varInput + ' w-32'} />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input type="number" value={v.stock}
                                                        onChange={e => updateVariant(idx, { stock: Number(e.target.value) })}
                                                        className={varInput + ' w-24'} />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input type="number" value={v.price || ''}
                                                        onChange={e => updateVariant(idx, { price: Number(e.target.value) })}
                                                        className={varInput + ' w-32'} />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <button onClick={() => removeVariant(idx)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </FormSection>

                    {/* ── Section 5: Images ─────────────────────────────── */}
                    <FormSection icon={<ImageIcon className="w-5 h-5 text-purple-600" />} title="Thư Viện Ảnh">
                        {/* Hidden file input */}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {/* Upload button */}
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all text-sm font-medium mb-4"
                        >
                            <Upload className="w-4 h-4" /> Tải Ảnh Lên
                        </button>

                        {/* Existing images (đã lưu trên server) */}
                        {form.images.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Ảnh hiện tại</p>
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                                    {form.images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                            <img src={img} alt="Product" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeExistingImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New file previews */}
                        {previews.length > 0 && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">
                                    Ảnh mới ({previews.length} file)
                                </p>
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                                    {previews.map((url, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-blue-300 bg-slate-50">
                                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeNewFile(idx)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <span className="absolute bottom-1 left-1 text-[9px] bg-blue-600 text-white px-1 py-0.5 rounded font-bold">NEW</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {form.images.length === 0 && previews.length === 0 && (
                            <p className="text-sm text-slate-400 italic">Chưa có ảnh nào.</p>
                        )}
                    </FormSection>

                </main>

                {/* Footer */}
                <footer className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-white sticky bottom-0">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={e => update({ active: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Hiển thị sản phẩm</span>
                        </label>
                        {!form.name.trim() && (
                            <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium">
                                <AlertCircle className="w-3.5 h-3.5" /> Cần nhập tên sản phẩm
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Hủy Bỏ
                        </button>
                        <button
                            disabled={!form.name.trim() || saving || isSalePriceInvalid}
                            onClick={handleSave}
                            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {saving
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Save className="w-4 h-4" />
                            }
                            {isEdit ? 'Cập Nhật' : 'Tạo Mới'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

// ─── Shared style strings ────────────────────────────────────────────────────
const input = 'w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm bg-white';
const varInput = 'px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm';

// ─── Tiny shared components ──────────────────────────────────────────────────
const Label: React.FC<React.PropsWithChildren> = ({ children }) => (
    <label className="block text-sm font-medium text-slate-700 mb-1">{children}</label>
);
const Required = () => <span className="text-red-500 ml-0.5">*</span>;

const FormSection: React.FC<{
    icon: React.ReactNode;
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}> = ({ icon, title, action, children }) => (
    <section className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                {icon} {title}
            </h3>
            {action}
        </div>
        {children}
    </section>
);

export default ProductForm;