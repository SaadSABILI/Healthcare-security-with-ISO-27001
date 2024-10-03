package com.dessec.services.admin.faq;

import com.dessec.dto.FAQDto;
import com.dessec.entity.FAQ;
import com.dessec.entity.Product;
import com.dessec.repository.FAQRepository;
import com.dessec.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FAQServiceImpl implements FAQService{

    private final FAQRepository faqRepository;

    private final ProductRepository productRepository;

    @Override
    public FAQDto postFAQ(Long productId, FAQDto faqDto) {
        if (faqDto.getAnswer() == null || faqDto.getAnswer().trim().isEmpty()) {
            throw new IllegalArgumentException("Answer cannot be null or empty");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow();

        FAQ faq = new FAQ();
        faq.setQuestion(faqDto.getQuestion());
        faq.setAnswer(faqDto.getAnswer());  // Ensure answer is not null
        faq.setProduct(product);

        faq = faqRepository.save(faq);

        return faq.getFAQDto();
    }



}
