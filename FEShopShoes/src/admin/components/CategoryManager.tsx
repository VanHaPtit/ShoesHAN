import React, { useState, useRef } from 'react';
import { Layers, Plus, Edit3, Trash2, X, Image as ImageIcon, Save, Upload, CheckCircle2 } from 'lucide-react';
import { Category } from '../../types/admin';

interface CategoryManagerProps {
    categories: Category[];
    onSave: (data: FormData) => void;
    onDelete: (id: number) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onSave, onDelete }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleEdit = (cat: Category) => {
        setEditingCat(cat);
        setName(cat.name);
        setPreview(cat.image || null);
        setFile(null);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingCat(null);
        setName('');
        setFile(null);
        setPreview(null);
        setIsFormOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        const categoryData = {
            id: editingCat?.id || null,
            name: name,
        };

        formData.append(
            'category',
            new Blob([JSON.stringify(categoryData)], { type: 'application/json' })
        );

        if (file) {
            formData.append('file', file);
        }

        onSave(formData);
        setIsFormOpen(false);
        if (preview && file) URL.revokeObjectURL(preview);
    };

    return (
        <div className="space-y-8 bg-[#F8FAFC] p-6 md:p-8 min-h-screen font-sans">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">CATEGORY MANAGEMENT</h2>
                    <p className="text-[13px] text-gray-500 mt-1">Organize and manage your product store hierarchical structure.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-[#2563EB] text-white px-6 py-2.5 text-[12px] font-bold uppercase tracking-widest hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>NEW CATEGORY</span>
                </button>
            </div>

            {/* Grid hiển thị Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat, index) => {
                    const isSale = cat.name.toUpperCase() === 'SALE';
                    
                    if (isSale) {
                        return (
                            <div key={cat.id} className="bg-[#2563EB] text-white flex flex-col group shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                                {/* Image Area */}
                                <div className="h-56 bg-red-900/20 relative overflow-hidden flex items-center justify-center">
                                     {cat.image ? (
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover mix-blend-overlay" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-red-200">
                                            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex flex-col flex-grow justify-between gap-4 bg-[#2563EB]">
                                    <div>
                                        <h3 className="font-black text-white text-[18px] uppercase tracking-wide">
                                            {cat.name}
                                        </h3>
                                        <p className="text-red-200 text-[12px] mt-1">Active Deals</p>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="flex-1 flex items-center justify-center py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-white transition-colors"
                                        >
                                            MANAGE OFFERS
                                        </button>
                                        <button
                                            onClick={() => cat.id && onDelete(cat.id)}
                                            className="w-10 h-10 flex items-center justify-center border border-red-500 hover:bg-[#1D4ED8] transition-colors flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={cat.id} className="bg-white border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
                            {/* Image Area */}
                            <div className="h-56 bg-[#F8FAFC] relative overflow-hidden">
                                {index === 0 && !isSale && (
                                    <div className="absolute top-3 right-3 z-10 bg-[#2563EB] text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider">
                                        TRENDING
                                    </div>
                                )}
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-[#F8FAFC]">
                                        <ImageIcon className="w-10 h-10 mb-2" />
                                    </div>
                                )}
                            </div>

                            {/* Info & Actions Area */}
                            <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                                <div>
                                    <h3 className="font-black text-[#0F172A] text-[16px] uppercase tracking-wide line-clamp-1" title={cat.name}>
                                        {cat.name}
                                    </h3>
                                    <p className="text-gray-400 text-[12px] mt-1">Manage items</p>
                                </div>

                                <div className="flex items-center gap-2 pt-3">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="flex-1 flex items-center justify-center py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#0F172A] border border-[#0F172A] hover:bg-black hover:text-white transition-colors"
                                    >
                                        EDIT
                                    </button>
                                    <button
                                        onClick={() => cat.id && onDelete(cat.id)}
                                        className="w-10 h-10 flex items-center justify-center border border-[#E2E8F0] text-gray-400 hover:text-[#0F172A] hover:border-[#0F172A] transition-colors flex-shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Nút thêm nhanh dạng thẻ */}
                <button
                    onClick={handleAddNew}
                    className="min-h-[340px] border border-dashed border-gray-300 bg-transparent hover:bg-white transition-colors flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-gray-600"
                >
                    <div className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-[11px] uppercase tracking-widest">CREATE NEW</span>
                </button>
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
                            <h3 className="text-[16px] font-black uppercase tracking-wide text-[#0F172A]">
                                {editingCat ? 'UPDATE CATEGORY' : 'NEW CATEGORY'}
                            </h3>
                            <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-[#0F172A] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Input Tên Danh Mục */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    CATEGORY NAME <span className="text-[#2563EB]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-[#E2E8F0] text-[13px] text-[#0F172A] font-medium placeholder:text-gray-400 outline-none focus:border-[#0F172A] transition-all"
                                    placeholder="e.g. SNEAKERS, APPAREL..."
                                />
                            </div>

                            {/* Khu Vực Upload Ảnh */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">IMAGE</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative mt-1 flex flex-col items-center justify-center p-6 border border-dashed cursor-pointer transition-all duration-200 min-h-[160px]
                                        ${preview ? 'border-[#E2E8F0] bg-[#F8FAFC]' : 'border-gray-300 hover:border-[#0F172A] hover:bg-[#F8FAFC]'}`}
                                >
                                    {preview ? (
                                        <div className="relative w-full h-40 group flex justify-center">
                                            <img src={preview} alt="Preview" className="h-full object-contain mix-blend-multiply" />
                                            <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                                <div className="flex flex-col items-center text-[#0F172A]">
                                                    <Upload className="w-5 h-5 mb-1" />
                                                    <span className="text-[11px] font-bold uppercase tracking-widest">CHANGE IMAGE</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 text-center">
                                            <div className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center mx-auto text-gray-400">
                                                <Upload className="w-4 h-4" />
                                            </div>
                                            <div className="text-[12px] font-medium text-gray-500">
                                                Click to upload or drag & drop
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="w-full sm:w-auto px-6 py-2.5 bg-white border border-[#E2E8F0] text-[11px] font-bold uppercase tracking-widest text-[#0F172A] hover:bg-gray-100 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-6 py-2.5 bg-[#2563EB] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> SAVE
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;