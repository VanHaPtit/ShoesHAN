
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import CustomerChatBox from './components/chat/CustomerChatBox';
import ProtectedRoute from './components/common/ProtectedRoute';
import CreateReview from './pages/CreateReview';

// Pages
const UserOrders = lazy(() => import('./pages/UserOrders'));
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Profile = lazy(() => import('./pages/Profile'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
// Admin
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));

import { useAuth } from './context/AuthContext';

const CustomerRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner fullScreen />;
  
  // Nếu là Admin, chặn không cho vào giao diện khách hàng, đẩy thẳng vào admin
  if (user?.roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* KHU VỰC CHO ADMIN */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* KHU VỰC CHO KHÁCH HÀNG */}
        <Route path="/*" element={
          <CustomerRouteWrapper>
            <div className="min-h-screen flex flex-col selection:bg-black selection:text-white">
              <Navbar />
              <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/signin" element={<Login />} />
                <Route path="/signup" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="/reviews/create/:productId/:orderItemId" element={<CreateReview />} />
                <Route path="/login" element={<Navigate to="/signin" replace />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/orders" element={<UserOrders />} />
                <Route path="/payment-callback" element={<PaymentCallback />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
              </Routes>
            </main>
            <CustomerChatBox />
            <Footer />
            </div>
          </CustomerRouteWrapper>
        } />
      </Routes>
    </Suspense>
  );
};

export default App;
