import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CategoryManager from './components/CategoryManager';
import BrandManager from './components/BrandManager';
import OrderManager from './components/OrderManager';
import UserManager from './components/UserManager';
import AdminChatPanel from './components/AdminChatPanel';
import DashboardPage from './DashboardPage';
import BannerManager from './components/BannerManager';

// Import các API và Type đã định nghĩa
import { productApi, categoryApi, brandApi, orderApi, variantApi } from './api/adminApi';
import axiosClient from '../api/axiosClient';
import { Product, Category, Brand, Order, User, OrderStatus } from '../types/admin';
import { useToast } from '../context/ToastContext';

const AdminDashboard: React.FC = () => {
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('statistics');
    const [isLoading, setIsLoading] = useState(false);

    // ==============================
    // STATE DATA
    // ==============================
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // ==============================
    // MODAL PRODUCT
    // ==============================
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>();

    // ==============================
    // LOAD CATEGORY + BRAND (Dữ liệu dùng chung)
    // ==============================
    const loadCommonData = useCallback(async () => {
        try {
            const [cData, bData] = await Promise.all([
                categoryApi.getAll(),
                brandApi.getAll()
            ]);
            setCategories(cData || []);
            setBrands(bData || []);
        } catch (error) {
            console.error(error);
            showToast("Lỗi tải danh mục / thương hiệu", "error");
        }
    }, [showToast]);

    // ==============================
    // LOAD DATA THEO TAB
    // ==============================
    const fetchDataByTab = useCallback(async () => {
        setIsLoading(true);
        try {
            switch (activeTab) {
                case 'products': {
                    const [data, allVariants] = await Promise.all([
                        productApi.getAll(),
                        variantApi.getAll()
                    ]);
                    const safeData: Product[] = (data || []).map((p: Product) => ({
                        ...p,
                        basePrice: p.basePrice ?? 0,
                        salePrice: p.salePrice ?? null,
                        totalSold: p.totalSold ?? 0,
                        images: p.images ?? [],
                        active: p.active ?? true,
                        // @ts-ignore
                        variants: (allVariants || []).filter(v => v.product?.id === p.id)
                    }));
                    setProducts(safeData);
                    break;
                }
                case 'orders': {
                    // Sử dụng orderApi thay vì gọi trực tiếp axiosClient
                    const data = await orderApi.getAll();
                    setOrders(data || []);
                    break;
                }
                case 'users': {
                    const data = await axiosClient.get('/users').then(r => r.data);
                    setUsers(data || []);
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            showToast("Lỗi tải dữ liệu", "error");
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, showToast]);

    // ==============================
    // EFFECTS
    // ==============================
    useEffect(() => {
        loadCommonData();
    }, [loadCommonData]);

    useEffect(() => {
        fetchDataByTab();
    }, [fetchDataByTab]);

    // ==============================
    // PRODUCT ACTIONS
    // ==============================
    const handleAddProduct = () => {
        setEditingProduct(undefined);
        setIsProductFormOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsProductFormOpen(true);
    };

    const handleDeleteProductSuccess = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast("Đã xóa sản phẩm", "info");
    };

    const handleSaveProductSuccess = () => {
        setIsProductFormOpen(false);
        fetchDataByTab();
        showToast("Lưu sản phẩm thành công", "success");
    };

    // ==============================
    // CATEGORY ACTIONS
    // ==============================
    const handleSaveCategory = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const categoryRaw = formData.get('category');
            const categoryData = categoryRaw instanceof Blob ? JSON.parse(await categoryRaw.text()) : {};
            const categoryId = categoryData.id;

            if (categoryId) {
                await axiosClient.put(`/category/${categoryId}`, formData);
                showToast("Cập nhật danh mục thành công", "success");
            } else {
                await axiosClient.post('/category', formData);
                showToast("Thêm danh mục thành công", "success");
            }
            loadCommonData();
        } catch (error: any) {
            let errorMsg = "Lỗi khi lưu danh mục";
            if (error.response?.data?.fieldErrors) {
                errorMsg = Object.values(error.response.data.fieldErrors).join(' - ');
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }
            showToast(errorMsg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
        setIsLoading(true);
        try {
            await categoryApi.delete(id);
            showToast("Xóa danh mục thành công", "info");
            loadCommonData();
        } catch (error) {
            showToast("Lỗi khi xóa danh mục", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // ==============================
    // BRAND ACTIONS
    // ==============================
    const handleSaveBrand = async (brand: Brand) => {
        setIsLoading(true);
        try {
            if (brand.id) {
                await brandApi.update(brand.id, brand);
                showToast("Cập nhật thương hiệu thành công", "success");
            } else {
                await brandApi.create(brand);
                showToast("Thêm thương hiệu thành công", "success");
            }
            loadCommonData();
        } catch (error: any) {
            let errorMsg = "Lỗi khi lưu thương hiệu";
            if (error.response?.data?.fieldErrors) {
                errorMsg = Object.values(error.response.data.fieldErrors).join(' - ');
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }
            showToast(errorMsg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBrand = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;
        setIsLoading(true);
        try {
            await brandApi.delete(id);
            showToast("Xóa thương hiệu thành công", "info");
            loadCommonData();
        } catch (error) {
            showToast("Lỗi khi xóa thương hiệu", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // ==============================
    // ORDER ACTIONS
    // ==============================
    const handleUpdateOrderStatus = async (id: number, status: OrderStatus) => {
        setIsLoading(true);
        try {
            // Sử dụng orderApi.update để đồng bộ logic
            await orderApi.update(id, { status });
            showToast(`Đã chuyển đơn hàng #${id} sang ${status}`, "success");

            // Cập nhật state cục bộ để UI thay đổi ngay lập tức
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        } catch (error) {
            showToast("Lỗi khi cập nhật trạng thái đơn hàng", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // ==============================
    // RENDER CONTENT
    // ==============================
    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return (
                    <ProductList
                        products={products}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProductSuccess}
                        onAdd={handleAddProduct}
                    />
                );

            case 'categories':
                return (
                    <CategoryManager
                        categories={categories}
                        onSave={handleSaveCategory}
                        onDelete={handleDeleteCategory}
                    />
                );

            case 'brands':
                return (
                    <BrandManager
                        brands={brands}
                        onSave={handleSaveBrand}
                        onDelete={handleDeleteBrand}
                    />
                );

            case 'orders':
                return (
                    <OrderManager
                        orders={orders}
                        onRefresh={fetchDataByTab}
                    />
                );

            case 'users':
                return (
                    <UserManager
                        users={users}
                        onToggleStatus={async (id) => {
                            try {
                                await axiosClient.put(`/users/${id}/toggle-status`);
                                fetchDataByTab();
                                showToast("Cập nhật trạng thái người dùng thành công", "success");
                            } catch {
                                showToast("Lỗi cập nhật người dùng", "error");
                            }
                        }}
                    />
                );

            case 'chat':
                return <AdminChatPanel />;

            case 'statistics':
                return <DashboardPage />;

            case 'banners':
                return <BannerManager />;

            default:
                return (
                    <div className="p-10 text-slate-400 italic font-bold">
                        CHÀO MỪNG ADMIN 👋
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
                {/* Top Navbar */}
                <header className="h-20 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 sticky top-0 z-40">
                    {/* Header is currently empty based on user request */}
                </header>

                <div className="flex-1 p-8 relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
                            <div className="animate-spin h-10 w-10 border-4 border-[#0F172A] border-t-transparent rounded-full"></div>
                        </div>
                    )}

                    <div className="max-w-[1400px] mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </main>

            {isProductFormOpen && (
                <ProductForm
                    product={editingProduct}
                    categories={categories}
                    brands={brands}
                    onSave={handleSaveProductSuccess}
                    onClose={() => setIsProductFormOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;