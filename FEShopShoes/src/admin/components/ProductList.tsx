

import React, { useState, useRef, useEffect } from 'react';
import {
    Search, Filter, Plus, ExternalLink, Edit3, Trash2,
    ChevronLeft, ChevronRight, TrendingUp, PackageCheck,
    Download, Upload, AlertCircle, CheckCircle2, X,
    Gift, Calendar, DollarSign, Package, Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import axiosClient from '../../api/axiosClient';
import { Product, Category } from '../../types/admin';
import { productApi, categoryApi } from '../api/adminApi';


// ─── Types ────────────────────────────────────────────────────────────────────

interface ComboProduct { id: number; name: string; images?: string[]; }


interface Combo {
    id: number;
    name: string;
    comboPrice: number;
    startDate: string;
    endDate: string;
    products: ComboProduct[];
}


interface ProductListProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
    onAdd: () => void;
}


// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 16;


const EXPORT_COLUMNS = [
    { header: 'ID', key: 'id' },
    { header: 'Tên sản phẩm', key: 'name' },
    { header: 'Slug', key: 'slug' },
    { header: 'Danh mục', key: 'category.name' },
    { header: 'Thương hiệu', key: 'brand.name' },
    { header: 'Giá gốc', key: 'basePrice' },
    { header: 'Giá sale', key: 'salePrice' },
    { header: 'Tổng đã bán', key: 'totalSold' },
    { header: 'Tồn kho', key: '_stock' },
    { header: 'Kích hoạt', key: 'active' },
];


const getNestedValue = (obj: any, path: string): any => {
    if (path === '_stock')
        return (obj.variants ?? []).reduce((s: number, v: any) => s + v.stock, 0);
    return path.split('.').reduce((acc, k) => acc?.[k], obj);
};


type ToastType = 'success' | 'error';
interface Toast { id: number; type: ToastType; msg: string; }


const BLANK_COMBO: Omit<Combo, 'id'> = { name: '', comboPrice: 0, startDate: '', endDate: '', products: [] };


// ─────────────────────────────────────────────────────────────────────────────
const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, onAdd }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const importRef = useRef<HTMLInputElement>(null);


    // ── Categories từ API ────────────────────────────────────────────────
    const [categories, setCategories] = useState<Category[]>([]);
    const [catsLoaded, setCatsLoaded] = useState(false);


    useEffect(() => {
        if (catsLoaded) return;
        categoryApi.getAll()
            .then(data => {
                setCategories(data);
                setCatsLoaded(true);
            })
            .catch(() => {
                // Fallback: lấy từ danh sách products hiện có
                const uniqueCats = Array.from(
                    new Map(products.filter(p => p.category).map(p => [p.category!.id, p.category!])).values()
                ) as Category[];
                if (uniqueCats.length > 0) {
                    setCategories(uniqueCats);
                    setCatsLoaded(true);
                }
            });
    }, [products, catsLoaded]);


    // ── Combo state ──────────────────────────────────────────────────────
    const [showComboPanel, setShowComboPanel] = useState(false);
    const [combos, setCombos] = useState<Combo[]>([]);
    const [comboLoading, setComboLoading] = useState(false);
    const [comboForm, setComboForm] = useState<Omit<Combo, 'id'>>(BLANK_COMBO);
    const [editingComboId, setEditingComboId] = useState<number | null>(null);
    const [comboSearch, setComboSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [saving, setSaving] = useState(false);


    const loadCombos = async () => {
        setComboLoading(true);
        try {
            const r = await axiosClient.get<Combo[]>('/combos');
            setCombos(r.data);
        } catch { pushToast('error', 'Không thể tải danh sách combo.'); }
        finally { setComboLoading(false); }
    };


    const openComboPanel = () => { setShowComboPanel(true); loadCombos(); };


    const startEditCombo = (c: Combo) => {
        setEditingComboId(c.id ?? null);
        setComboForm({
            name: c.name,
            comboPrice: c.comboPrice,
            startDate: c.startDate?.slice(0, 16) ?? '',
            endDate: c.endDate?.slice(0, 16) ?? '',
            products: c.products ?? [],
        });
    };


    const resetComboForm = () => { setEditingComboId(null); setComboForm(BLANK_COMBO); setProductSearch(''); };


    const toggleProduct = (p: Product) => {
        setComboForm(prev => {
            const exists = prev.products.some(x => x.id === p.id);
            return {
                ...prev,
                products: exists
                    ? prev.products.filter(x => x.id !== p.id)
                    : [...prev.products, { id: p.id!, name: p.name, images: p.images }],
            };
        });
    };


    const handleSaveCombo = async () => {
        if (!comboForm.name.trim()) { pushToast('error', 'Tên combo không được để trống.'); return; }
        if (comboForm.comboPrice <= 0) { pushToast('error', 'Giá combo phải lớn hơn 0.'); return; }
        if (comboForm.products.length < 2) { pushToast('error', 'Combo cần ít nhất 2 sản phẩm.'); return; }
        setSaving(true);
        try {
            const payload = {
                ...comboForm,
                startDate: comboForm.startDate ? comboForm.startDate + ':00' : null,
                endDate: comboForm.endDate ? comboForm.endDate + ':00' : null,
                products: comboForm.products.map(p => ({ id: p.id })),
            };
            if (editingComboId) {
                await axiosClient.put(`/combos/${editingComboId}`, payload);
                pushToast('success', 'Đã cập nhật combo.');
            } else {
                await axiosClient.post(`/combos`, payload);
                pushToast('success', 'Đã tạo combo mới!');
            }
            resetComboForm();
            loadCombos();
        } catch { pushToast('error', 'Lỗi khi lưu combo.'); }
        finally { setSaving(false); }
    };


    const handleDeleteCombo = async (id: number) => {
        if (!window.confirm('Xoá combo này?')) return;
        try {
            await axiosClient.delete(`/combos/${id}`);
            pushToast('success', 'Đã xoá combo.');
            setCombos(prev => prev.filter(c => c.id !== id));
            if (editingComboId === id) resetComboForm();
        } catch { pushToast('error', 'Xoá combo thất bại.'); }
    };


    // ── Toast ─────────────────────────────────────────────────────────────
    const pushToast = (type: ToastType, msg: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, msg }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };


    // ── Filter / Pagination ───────────────────────────────────────────────
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterCategory === 'All' || p.category?.id?.toString() === filterCategory)
    );
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalStock = (p: Product) => (p.variants ?? []).reduce((a, v) => a + v.stock, 0);


    // ── Delete product ────────────────────────────────────────────────────
    const handleDelete = async (id: number) => {
        if (!window.confirm('Xóa sản phẩm này?')) return;
        setDeletingId(id);
        try { await productApi.delete(id); onDelete(id); }
        catch (err: any) { alert(typeof err?.response?.data === 'string' ? err.response.data : (err?.response?.data?.message ?? 'Xóa thất bại.')); }
        finally { setDeletingId(null); }
    };


    // ── Export Excel ──────────────────────────────────────────────────────
    const handleExport = () => {
        pushToast('success', 'Đang tạo file Excel từ server...');
        axiosClient.get('/Excel/export-all', { responseType: 'blob' }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Shop_System_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            pushToast('success', 'Tải file thành công!');
        }).catch(err => {
            pushToast('error', 'Lỗi tải file: ' + err.message);
        });
    };


    // ── Import Excel ──────────────────────────────────────────────────────
    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';


        // Hiển thị toast thông báo đang upload vì upload ảnh sẽ tốn thời gian
        pushToast('success', 'Đang xử lý import và upload hình ảnh. Vui lòng chờ...');


        productApi.importExcelZip(file).then((res) => {
            pushToast('success', res.message || 'Đã import thành công!');
            setTimeout(() => window.location.reload(), 1500);
        }).catch(err => {
            pushToast('error', 'Lỗi khi import: ' + (err.response?.data?.message || err.message));
        });
    };


    const filteredForCombo = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );


    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 relative font-sans">
            {/* ── Toast stack ─────────────────────────────────────────── */}
            <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium max-w-sm
                        ${t.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                        {t.type === 'success'
                            ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                            : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-500" />}
                        <span className="flex-1">{t.msg}</span>
                        <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>
                            <X className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                        </button>
                    </div>
                ))}
            </div>


            {/* ── Title ──────────────────────────────────── */}
            <div className="mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">PRODUCT MANAGEMENT</h2>
            </div>


            {/* ── Controls ────────────────────────────────────────────── */}
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 w-full">
                    <div className="bg-white flex items-center px-4 py-2.5 w-full sm:w-80 shadow-sm border border-[#E2E8F0]">
                        <input
                            type="text"
                            placeholder="Search products by name..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="bg-transparent w-full text-[13px] text-gray-700 outline-none font-medium"
                        />
                    </div>
                    <div className="bg-white px-4 py-2.5 w-full sm:w-48 border-r-8 border-transparent shadow-sm border border-[#E2E8F0]">
                        <select
                            value={filterCategory}
                            onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                            className="bg-transparent w-full text-[13px] font-medium text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="All">All Categories</option>
                            {categories.map((c, index) => (
                                <option key={c.id ?? index} value={c.id?.toString() ?? ''}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>


                <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                    <input ref={importRef} type="file" accept=".zip" className="hidden" onChange={handleImportFile} />
                    <button
                        onClick={() => importRef.current?.click()}
                        className="border border-[#0F172A] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#0F172A] bg-white hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                    >
                        IMPORT EXCEL
                    </button>
                    <button
                        onClick={handleExport}
                        className="border border-[#0F172A] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#0F172A] bg-white hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                    >
                        EXPORT EXCEL
                    </button>
                    <button
                        onClick={onAdd}
                        className="bg-[#2563EB] text-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-[#1D4ED8] transition-colors whitespace-nowrap"
                    >
                        + NEW PRODUCT
                    </button>
                </div>
            </div>


            {/* ── Table ───────────────────────────────────────────────── */}
            <div className="bg-white overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#F8FAFC]/50 border-b border-[#E2E8F0]">
                                {['PRODUCT', 'STATUS', 'INVENTORY', 'PRICE', 'ACTIONS'].map((h, i) => (
                                    <th key={i} className={`px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${h === 'ACTIONS' ? 'text-right' : ''}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginated.length === 0 ? (
                                <tr><td colSpan={5} className="py-16 text-center text-gray-400 text-sm">Không tìm thấy sản phẩm nào.</td></tr>
                            ) : paginated.map(product => {
                                const stock = totalStock(product);
                                return (
                                    <tr key={product.id} className="hover:bg-[#F8FAFC]/50 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-[60px] h-[60px] bg-gray-100 flex-shrink-0">
                                                    {product.images?.[0]
                                                        ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                                                        : <PackageCheck className="w-full h-full p-4 text-gray-300" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[14px] text-[#0F172A] leading-tight mb-1">{product.name}</p>
                                                    <p className="text-[11px] text-gray-400 font-bold tracking-widest">
                                                        SKU: {product.slug?.toUpperCase() || `BIT-PRD-${product.id}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            {product.active
                                                ? <span className="inline-block px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-[#e8f5e9] text-[#2e7d32]">
                                                    ACTIVE
                                                </span>
                                                : <span className="inline-block px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500">
                                                    HIDDEN
                                                </span>}
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-[13px] text-gray-500 font-medium">
                                                {(product.variants ?? []).length === 0 ? 'No variants' : `${stock} in stock`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                {product.salePrice != null && product.salePrice < product.basePrice && (
                                                    <span className="text-[11px] text-gray-400 line-through font-bold">
                                                        {product.basePrice.toLocaleString()}đ
                                                    </span>
                                                )}
                                                <span className="font-bold text-[14px] text-[#2563EB]">
                                                    {(product.salePrice ?? product.basePrice).toLocaleString()}đ
                                                </span>
                                            </div>
                                        </td>


                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onEdit(product)} className="text-gray-400 hover:text-[#0F172A] transition-colors"><Edit3 size={18} /></button>
                                                <button onClick={() => handleDelete(product.id!)} disabled={deletingId === product.id}
                                                    className="text-gray-400 hover:text-[#2563EB] transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ── Item Count & Pagination ──────────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        SHOWING {paginated.length} OF {filtered.length} ITEMS
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest px-2">
                                PAGE {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {/* ══════════════════════════════════════════════════════════ */}
            {/* COMBO PANEL                                               */}
            {/* ══════════════════════════════════════════════════════════ */}
            {showComboPanel && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">


                        {/* Panel header */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-xl"><Gift className="w-5 h-5 text-amber-600" /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Quản lý Combo</h3>
                                    <p className="text-xs text-slate-400">{combos.length} combo hiện có</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowComboPanel(false); resetComboForm(); }}
                                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>


                        <div className="flex flex-1 overflow-hidden">
                            {/* LEFT – Danh sách combo */}
                            <div className="w-[40%] border-r border-slate-100 flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-slate-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400/30 outline-none"
                                            placeholder="Tìm combo..." value={comboSearch}
                                            onChange={e => setComboSearch(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {comboLoading && (
                                        <div className="text-center py-10 text-slate-400 text-sm">
                                            <div className="w-6 h-6 border-2 border-slate-200 border-t-amber-400 rounded-full animate-spin mx-auto mb-2" />
                                            Đang tải...
                                        </div>
                                    )}
                                    {!comboLoading && combos.length === 0 && (
                                        <div className="text-center py-14 text-slate-300">
                                            <Gift className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">Chưa có combo nào</p>
                                        </div>
                                    )}
                                    {combos
                                        .filter(c => c.name.toLowerCase().includes(comboSearch.toLowerCase()))
                                        .map((c, index) => (
                                            <div key={c.id ?? `combo-${index}`}
                                                className={`p-4 rounded-2xl border cursor-pointer transition-all
                                                    ${editingComboId === c.id
                                                        ? 'border-amber-400 bg-amber-50 shadow-sm shadow-amber-100'
                                                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'}`}
                                                onClick={() => startEditCombo(c)}>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 text-sm truncate">{c.name}</p>
                                                        <p className="text-xs text-amber-600 font-bold mt-0.5">
                                                            {c.comboPrice.toLocaleString('vi-VN')}đ
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                            <Package className="w-3 h-3" /> {c.products?.length ?? 0} sp
                                                            {c.endDate && (
                                                                <><span className="mx-1">·</span>
                                                                    <Calendar className="w-3 h-3" /> HSD: {new Date(c.endDate).toLocaleDateString('vi-VN')}</>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <button onClick={e => { e.stopPropagation(); c.id && handleDeleteCombo(c.id); }}
                                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex-shrink-0">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {(c.products?.length ?? 0) > 0 && (
                                                    <div className="flex gap-1 mt-2.5 flex-wrap">
                                                        {c.products.slice(0, 5).map((p, i) => (
                                                            <img key={i} src={p.images?.[0] ?? 'https://placehold.co/28x28?text=?'}
                                                                className="w-7 h-7 rounded-lg object-cover border border-white shadow-sm" alt="" />
                                                        ))}
                                                        {c.products.length > 5 && (
                                                            <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-400">
                                                                +{c.products.length - 5}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                                <div className="p-4 border-t border-slate-100">
                                    <button onClick={resetComboForm}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-amber-200 rounded-xl text-sm text-amber-500 hover:border-amber-400 hover:bg-amber-50/50 transition-all font-semibold">
                                        <Plus className="w-4 h-4" /> Tạo combo mới
                                    </button>
                                </div>
                            </div>


                            {/* RIGHT – Form */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${editingComboId ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                        <h4 className="text-sm font-bold text-slate-700">
                                            {editingComboId ? `Sửa combo #${editingComboId}` : 'Tạo combo mới'}
                                        </h4>
                                    </div>


                                    {/* Tên */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                                            Tên combo <span className="text-rose-400">*</span>
                                        </label>
                                        <input className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400/30 outline-none"
                                            placeholder="VD: Giày chạy bộ" value={comboForm.name}
                                            onChange={e => setComboForm(p => ({ ...p, name: e.target.value }))} />
                                    </div>


                                    {/* Giá */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                                            Giá combo (đ) <span className="text-rose-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="number" className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400/30 outline-none"
                                                placeholder="0" value={comboForm.comboPrice || ''}
                                                onChange={e => setComboForm(p => ({ ...p, comboPrice: Number(e.target.value) }))} />
                                        </div>
                                    </div>


                                    {/* Ngày */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Bắt đầu</label>
                                            <input type="datetime-local" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400/30 outline-none"
                                                value={comboForm.startDate}
                                                onChange={e => setComboForm(p => ({ ...p, startDate: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Kết thúc</label>
                                            <input type="datetime-local" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400/30 outline-none"
                                                value={comboForm.endDate}
                                                onChange={e => setComboForm(p => ({ ...p, endDate: e.target.value }))} />
                                        </div>
                                    </div>


                                    {/* Chọn sản phẩm */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Sản phẩm trong combo
                                            </label>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                                                ${comboForm.products.length >= 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {comboForm.products.length} đã chọn {comboForm.products.length < 2 && '(tối thiểu 2)'}
                                            </span>
                                        </div>


                                        {/* Chips sản phẩm đã chọn */}
                                        {comboForm.products.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-3 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                                                {comboForm.products.map(p => (
                                                    <span key={p.id} className="flex items-center gap-1 pl-2 pr-1 py-1 bg-white border border-amber-200 text-amber-800 text-xs font-semibold rounded-full shadow-sm">
                                                        {p.name}
                                                        <button onClick={() => toggleProduct(p as any)}
                                                            className="w-4 h-4 bg-amber-100 hover:bg-amber-200 rounded-full flex items-center justify-center transition-colors">
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}


                                        {/* Search + checkbox list */}
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <input className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-400/40 outline-none"
                                                placeholder="Tìm sản phẩm để thêm..." value={productSearch}
                                                onChange={e => setProductSearch(e.target.value)} />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50">
                                            {filteredForCombo.slice(0, 40).map(p => {
                                                const selected = comboForm.products.some(x => x.id === p.id);
                                                return (
                                                    <button key={p.id} onClick={() => toggleProduct(p)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                                                            ${selected ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                                                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                                                            ${selected ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`}>
                                                            {selected && <Check className="w-2.5 h-2.5 text-white" />}
                                                        </div>
                                                        <img src={p.images?.[0] ?? 'https://placehold.co/28x28?text=?'}
                                                            className="w-7 h-7 rounded-lg object-cover border border-slate-200 flex-shrink-0" alt="" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                                                            <p className="text-[10px] text-slate-400">{p.category?.name} · {p.basePrice.toLocaleString('vi-VN')}đ</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            {filteredForCombo.length === 0 && (
                                                <p className="text-center text-xs text-slate-400 py-6">Không tìm thấy sản phẩm</p>
                                            )}
                                        </div>
                                    </div>
                                </div>


                                {/* Form footer */}
                                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 flex-shrink-0">
                                    <div>
                                        {comboForm.comboPrice > 0 && (
                                            <p className="text-base font-black text-amber-600">
                                                {comboForm.comboPrice.toLocaleString('vi-VN')}đ
                                            </p>
                                        )}
                                        <p className="text-[10px] text-slate-400">{comboForm.products.length} sản phẩm được chọn</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={resetComboForm}
                                            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
                                            Đặt lại
                                        </button>
                                        <button onClick={handleSaveCombo} disabled={saving}
                                            className="px-5 py-2 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-amber-200">
                                            {saving
                                                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                                                : <Check className="w-4 h-4" />}
                                            {editingComboId ? 'Cập nhật' : 'Tạo Combo'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// ─── StatCard ─────────────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
    red: 'bg-[#F8FAFC] text-[#2563EB]',
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-100 text-gray-500',
};
const StatCard: React.FC<{ icon: React.ReactNode; color: string; label: string; value: number }> = ({ icon, color, label, value }) => (
    <div className="bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-[#0F172A]">{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${colorMap[color] ?? ''}`}>{icon}</div>
    </div>
);


export default ProductList;





