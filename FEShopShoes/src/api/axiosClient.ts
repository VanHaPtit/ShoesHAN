import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// INTERCEPTOR CHO REQUEST: Tự động thêm Token
axiosClient.interceptors.request.use((config) => {
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            const parsedUser = JSON.parse(userData);
            // KIỂM TRA KỸ: Backend của bạn trả về 'token' hay 'accessToken'?
            const token = parsedUser.token || parsedUser.accessToken;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Lỗi parse thông tin user", error);
        }
    }
    return config;
}, (error) => Promise.reject(error));

// INTERCEPTOR CHO RESPONSE: Xử lý lỗi 401 tập trung
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Phiên đăng nhập hết hạn!");
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
