package com.shop.backend.payment;

import jakarta.servlet.http.HttpServletRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Random;
import java.util.TreeMap;
import java.util.stream.Collectors;

public class VNPayUtil {
    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString().toUpperCase();
        } catch (Exception ex) {
            return "";
        }
    }

    public static String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public static String buildQueryData(Map<String, String> paramsMap) {
        return paramsMap.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> encodeParam(entry.getKey()) + "=" + encodeParam(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    public static String buildHashData(Map<String, String> paramsMap) {
        return paramsMap.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .filter(entry -> !"vnp_SecureHash".equals(entry.getKey()) && !"vnp_SecureHashType".equals(entry.getKey()))
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> encodeParam(entry.getKey()) + "=" + encodeParam(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    public static Map<String, String> extractVnPayResponseParams(HttpServletRequest request) {
        Map<String, String> params = new TreeMap<>();
        request.getParameterMap().forEach((key, value) -> {
            if (key.startsWith("vnp_") && value != null && value.length > 0) {
                params.put(key, value[0]);
            }
        });
        return params;
    }

    private static String encodeParam(String value) {
        return URLEncoder.encode(value, StandardCharsets.US_ASCII);
    }
}
