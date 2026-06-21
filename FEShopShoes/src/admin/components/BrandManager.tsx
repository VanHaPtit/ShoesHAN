
import React, { useState } from 'react';
import { Tag, Plus, Edit3, Trash2, X, Save } from 'lucide-react';
import { Brand } from '../../types/admin';

interface BrandManagerProps {
    brands: Brand[];
    onSave: (brand: Brand) => void;
    onDelete: (id: number) => void;
}

const BrandManager: React.FC<BrandManagerProps> = ({ brands, onSave, onDelete }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState<Brand>({ name: '' });

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData(brand);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingBrand(null);
        setFormData({ name: '' });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editingBrand ? { ...formData, id: editingBrand.id } : formData);
        setIsFormOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">BRAND MANAGEMENT</h2>
                    {/* <p className="text-slate-500">Manage your collection of shoe brands</p> */}
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Brand
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Brand Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {brands.map((brand) => (
                            <tr key={brand.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 font-semibold text-slate-900 flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <Tag className="w-4 h-4" />
                                    </div>
                                    {brand.name}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(brand)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => brand.id && onDelete(brand.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">{editingBrand ? 'Edit Brand' : 'New Brand'}</h3>
                            <button type="button" onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Adidas"
                            />
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl font-semibold">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BrandManager;
