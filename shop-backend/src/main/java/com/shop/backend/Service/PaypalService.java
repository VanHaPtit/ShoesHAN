package com.shop.backend.Service;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class PaypalService {
    @Autowired
    private APIContext apiContext;

    @Autowired
    private CurrencyService currencyService;

    public String createPayment(Double totalVnd, String description, String cancelUrl, String successUrl, String orderNumber)
            throws PayPalRESTException {

        // 1. Lấy tỉ giá thời gian thực (1 USD = x VND)
        double rateVndPerUsd = currencyService.getVndToUsdRate();

        // 2. Tính toán giá USD: (VND / Tỉ giá) + 1$ phí PayPal
        // Công thức: $TotalUSD = \frac{TotalVND}{Rate} + 1.0$
        double totalUsd = (totalVnd / rateVndPerUsd) + 1.0;

        // 3. Định dạng chuẩn PayPal: 2 chữ số thập phân, dùng Locale.US cho dấu chấm (.)
        String formattedTotal = String.format(Locale.US, "%.2f", totalUsd);

        Amount amount = new Amount();
        amount.setCurrency("USD");
        amount.setTotal(formattedTotal);

        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        // Bổ sung thông tin phí thanh toán vào mô tả để khách hàng rõ ràng
        transaction.setDescription(description + " (Bao gồm 1$ phí thanh toán) - OrderNo: " + orderNumber);

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        Payment payment = new Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(Arrays.asList(transaction));

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl + (successUrl.contains("?") ? "&" : "?") + "orderNumber=" + orderNumber);
        payment.setRedirectUrls(redirectUrls);

        Payment createdPayment = payment.create(apiContext);

        for (Links link : createdPayment.getLinks()) {
            if ("approval_url".equalsIgnoreCase(link.getRel())) {
                return link.getHref();
            }
        }
        throw new PayPalRESTException("Approval URL not found");
    }

    public Payment executePayment(String paymentId, String payerId) throws PayPalRESTException {
        Payment payment = new Payment();
        payment.setId(paymentId);
        PaymentExecution paymentExecution = new PaymentExecution();
        paymentExecution.setPayerId(payerId);
        return payment.execute(apiContext, paymentExecution);
    }
}
