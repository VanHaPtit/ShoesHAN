package com.shop.backend.SendEmail;

import lombok.Data;

@Data
public class EmailConditionRequest {
    private Integer minPaidCount;       // Số đơn thành công tối thiểu
    private Double minTotalSpent;       // Tổng tiền đã chi tối thiểu
    private Boolean hasAbandonedCart;   // Có bỏ quên giỏ hàng không?
    private Integer specificReviewRating; // Lọc theo số sao đánh giá (1-5)
    private Integer inactiveDays;       // Không hoạt động/mua hàng trong X ngày
    private Integer isNewUserDays;      // Đăng ký mới trong vòng X ngày
}
