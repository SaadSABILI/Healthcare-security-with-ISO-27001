package com.dessec.services.admin.faq;

import com.dessec.dto.FAQDto;

public interface FAQService {
    FAQDto postFAQ(Long productId, FAQDto faqDto);
}
