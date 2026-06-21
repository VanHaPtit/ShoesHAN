import axiosClient from '../api/axiosClient';

export const AuthService = {
    login: (credentials: { username: string; password: string }) => {
        return axiosClient.post('/auth/signin', credentials);
    },

    register: (userData: any) => {
        const signupPayload = {
            ...userData,
            role: userData.role || ["user"] 
        };
        return axiosClient.post('/auth/signup', signupPayload);
    },

    logout: () => {
        return axiosClient.post('/auth/signout');
    },

    verifyEmail: (code: string) => {
        return axiosClient.get(`/auth/verify?code=${code}`);
    },

    forgotPassword: (email: string) => {
        return axiosClient.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
    }
};

export default AuthService;
