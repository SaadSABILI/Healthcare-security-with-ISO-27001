package com.dessec.services.admin.category;

import com.dessec.dto.CategoryDto;
import com.dessec.entity.Category;

import java.util.List;

public interface CategoryService {

    Category createcategory(CategoryDto categoryDto);
    List<Category> getAllCategories();
}
