import axiosClient from "../api/axiosClient";

const PaymentService = {
  createPaymentUrl: async (amount: number) => {
    const response = await axiosClient.get(`/vnpay/create-payment`, {
      params: { amount }
    });
    return response.data;
  }
};

export default PaymentService;
