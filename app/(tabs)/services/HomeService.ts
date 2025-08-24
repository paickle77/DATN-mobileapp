import type { Product } from './ProductsService';

class HomeService {
  // Validate tìm kiếm
  validateSearchQuery(query: string): {
    isValid: boolean;
    message?: string;
    sanitizedQuery?: string;
  } {
    if (!query || typeof query !== 'string') {
      return {
        isValid: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      };
    }

    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length === 0) {
      return {
        isValid: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      };
    }

    if (trimmedQuery.length < 2) {
      return {
        isValid: false,
        message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự'
      };
    }

    if (trimmedQuery.length > 100) {
      return {
        isValid: false,
        message: 'Từ khóa tìm kiếm không được quá 100 ký tự'
      };
    }

    // Loại bỏ các ký tự đặc biệt không cần thiết
    const sanitizedQuery = trimmedQuery.replace(/[<>\"'%;()&+]/g, '');

    return {
      isValid: true,
      sanitizedQuery
    };
  }

  // Filter sản phẩm theo search text
  filterProductsBySearch(products: Product[], searchText: string): Product[] {
    if (!searchText.trim()) return products;

    const validation = this.validateSearchQuery(searchText);
    if (!validation.isValid) return products;

    const searchTerm = validation.sanitizedQuery!.toLowerCase();

    return products.filter(product => {
      const name = product.name.toLowerCase();
      const categoryName = typeof product.category_id === 'object' && product.category_id 
        ? product.category_id.name?.toLowerCase() || ''
        : '';

      return name.includes(searchTerm) || categoryName.includes(searchTerm);
    });
  }

  // Lấy suggestions từ danh sách sản phẩm hiện tại
  getSearchSuggestions(products: Product[], searchText: string, limit: number = 5): Product[] {
    if (!searchText.trim()) return [];

    const validation = this.validateSearchQuery(searchText);
    if (!validation.isValid) return [];

    const searchTerm = validation.sanitizedQuery!.toLowerCase();
    
    return products
      .filter(product => product.name.toLowerCase().includes(searchTerm))
      .slice(0, limit);
  }

  // Debounce function
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Sort products
  sortProducts(products: Product[], sortType: string, productRatings: { [key: string]: number }): Product[] {
    return [...products].sort((a, b) => {
      switch (sortType) {
        case 'price_asc':
          const priceA = a.discount_price > 0 && a.discount_price < a.price ? a.discount_price : a.price;
          const priceB = b.discount_price > 0 && b.discount_price < b.price ? b.discount_price : b.price;
          return priceA - priceB;
        case 'price_desc':
          const priceA2 = a.discount_price > 0 && a.discount_price < a.price ? a.discount_price : a.price;
          const priceB2 = b.discount_price > 0 && b.discount_price < b.price ? b.discount_price : b.price;
          return priceB2 - priceA2;
        case 'discount':
          const discountA = a.discount_price > 0 && a.discount_price < a.price 
            ? ((a.price - a.discount_price) / a.price) * 100 : 0;
          const discountB = b.discount_price > 0 && b.discount_price < b.price 
            ? ((b.price - b.discount_price) / b.price) * 100 : 0;
          return discountB - discountA;
        case 'rating':
          const ratingA = productRatings[a._id] || 0;
          const ratingB = productRatings[b._id] || 0;
          return ratingB - ratingA;
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }

  // Filter products by category
  filterProductsByCategory(products: Product[], categoryFilter: string): Product[] {
    if (categoryFilter === 'all') return products;

    const filterMap: { [key: string]: string } = {
      'cake': 'bánh kem',
      'cookie': 'bánh quy',
      'sponge': 'bánh bông lan'
    };

    const filterTerm = filterMap[categoryFilter];
    if (!filterTerm) return products;

    return products.filter(item => {
      const categoryName = typeof item.category_id === 'object' && item.category_id 
        ? item.category_id.name?.toLowerCase() || ''
        : '';
      return categoryName.includes(filterTerm) || item.name.toLowerCase().includes(filterTerm);
    });
  }

  // Get category counts
  getCategoryCounts(products: Product[], filteredProducts: Product[]): Array<{key: string, label: string, count: number}> {
    const cakeFilters = [
      { key: 'all', label: 'Tất cả', count: 0 },
      { key: 'cake', label: 'Bánh kem', count: 0 },
      { key: 'cookie', label: 'Bánh quy', count: 0 },
      { key: 'sponge', label: 'Bánh bông lan', count: 0 },
    ];

    return cakeFilters.map(filter => {
      if (filter.key === 'all') {
        return { ...filter, count: filteredProducts.length };
      }
      
      const filterMap: { [key: string]: string } = {
        'cake': 'bánh kem',
        'cookie': 'bánh quy',
        'sponge': 'bánh bông lan'
      };
      
      const filterTerm = filterMap[filter.key];
      const count = products.filter(item => {
        const categoryName = typeof item.category_id === 'object' && item.category_id 
          ? item.category_id.name?.toLowerCase() || ''
          : '';
        return categoryName.includes(filterTerm) || item.name.toLowerCase().includes(filterTerm);
      }).length;
      
      return { ...filter, count };
    });
  }
}

export default new HomeService();
