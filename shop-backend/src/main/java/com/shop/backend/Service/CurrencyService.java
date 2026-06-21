package com.shop.backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class CurrencyService {
    private static final String API_URL = "https://open.er-api.com/v6/latest/USD";

    public double getVndToUsdRate() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> response = restTemplate.getForObject(API_URL, Map.class);

            if (response != null && response.containsKey("rates")) {
                Map<String, Object> rates = (Map<String, Object>) response.get("rates");
                // API trả về 1 USD = x VND
                Object vndRate = rates.get("VND");
                return Double.parseDouble(vndRate.toString());
            }
        } catch (Exception e) {
            System.err.println("Không thể lấy tỉ giá từ API, sử dụng tỉ giá mặc định: " + e.getMessage());
        }
        return 27000.0;
    }
}
