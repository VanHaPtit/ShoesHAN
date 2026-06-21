package com.shop.backend.payment;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final VNPAYConfig vnPayConfig;

    public PaymentDTO.VNPayResponse createVnPayPayment(HttpServletRequest request, String orderNumber) {
        long amount = Long.parseLong(request.getParameter("amount")) * 100L;
        String bankCode = request.getParameter("bankCode");
        String domain = request.getParameter("domain");
        Map<String, String> vnpParamsMap = new TreeMap<>(vnPayConfig.getVNPayConfig());

        String returnUrl = request.getRequestURL().toString().replace("/vn-pay", "/vn-pay-callback");
        if (domain != null && !domain.isEmpty()) {
            try {
                returnUrl += "?domain=" + java.net.URLEncoder.encode(domain, "UTF-8");
            } catch (Exception e) {}
        }
        vnpParamsMap.put("vnp_ReturnUrl", returnUrl);

        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));
        vnpParamsMap.put("vnp_TxnRef", orderNumber);
        vnpParamsMap.put("vnp_OrderInfo", "Thanh toan don hang: " + orderNumber);
        vnpParamsMap.put("vnp_OrderType", "other");
        vnpParamsMap.put("vnp_Locale", "vn");
        if (bankCode != null && !bankCode.isEmpty()) {
            vnpParamsMap.put("vnp_BankCode", bankCode);
        }

        String ipAddress = VNPayUtil.getIpAddress(request);
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "103.166.184.151";
        }
        vnpParamsMap.put("vnp_IpAddr", ipAddress);

        String hashData = VNPayUtil.buildHashData(vnpParamsMap);
        String vnpSecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), hashData);

        String queryUrl = VNPayUtil.buildQueryData(vnpParamsMap)
                + "&vnp_SecureHash=" + vnpSecureHash;

        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;
        return PaymentDTO.VNPayResponse.builder()
                .code("ok")
                .message("success")
                .paymentUrl(paymentUrl)
                .build();
    }
}
