import axiosClient from "./axiosClient";

export const orderApi = {
  // Lấy danh sách lịch sử đơn hàng của tôi
  getMyOrders: () => {
    return axiosClient.get("/orders/my-history");
  },
  getOrderDetail: (id: number | string) => {
    return axiosClient.get(`/orders/${id}`);
  }
};
