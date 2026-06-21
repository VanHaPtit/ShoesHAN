import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute: React.FC = () => {
    const { user, isLoading } = useAuth();

    // Đợi cho đến khi Context load xong dữ liệu từ localStorage
    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    // Nếu chưa đăng nhập, đá về trang signin
    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    // Kiểm tra quyền Admin
    const isAdmin = user.roles?.includes('ROLE_ADMIN');

    if (!isAdmin) {
        alert("Bạn không có quyền truy cập khu vực này!");
        return <Navigate to="/" replace />;
    }

    // Nếu là Admin, cho phép vào trang AdminDashboard (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;
