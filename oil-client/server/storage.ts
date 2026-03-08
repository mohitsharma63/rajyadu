import { products, categories, type Product, type Category, type InsertProduct, type InsertCategory } from "@shared/schema";

export interface IStorage {
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getBestsellerProducts(): Promise<Product[]>;
  getNewLaunchProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private currentProductId: number;
  private currentCategoryId: number;

  constructor() {
    this.products = new Map();
    this.categories = new Map();
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    const categoriesData = [
      {
        name: "Skincare",
        slug: "skincare",
        description: "Transform your skin with our scientifically-formulated skincare collection",
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        productCount: 8
      },
      {
        name: "Haircare",
        slug: "haircare", 
        description: "Nourish and strengthen your hair with our comprehensive range",
        imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        productCount: 6
      },
      {
        name: "Makeup",
        slug: "makeup",
        description: "Express your unique style with our premium makeup collection",
        imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        productCount: 6
      },
      {
        name: "Body Care",
        slug: "bodycare",
        description: "Pamper your skin with our luxurious body care collection",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        productCount: 4
      }
    ];

    categoriesData.forEach(cat => {
      const category: Category = { ...cat, id: this.currentCategoryId++ };
      this.categories.set(category.id, category);
    });

    // Initialize products
    const productsData = [
      // Skincare Products (8)
      {
        name: "10% Vitamin C Face Serum",
        slug: "vitamin-c-face-serum",
        description: "A powerful antioxidant serum that brightens skin and reduces signs of aging with 10% stable Vitamin C.",
        shortDescription: "Glowing, Brighter Skin in 5 Days",
        price: "545",
        category: "skincare",
        subcategory: "serums",
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.6",
        reviewCount: 2847,
        featured: true,
        bestseller: true,
        saleOffer: "B1G1FREE",
        size: "30ml",
        ingredients: ["Vitamin C", "Hyaluronic Acid", "Niacinamide"],
        benefits: ["Brightens skin", "Reduces dark spots", "Anti-aging"],
        howToUse: "Apply 2-3 drops to clean face in the morning. Follow with moisturizer and sunscreen."
      },
      {
        name: "Hyaluronic Acid Serum",
        slug: "hyaluronic-acid-serum",
        description: "Intensive hydrating serum that plumps and moisturizes skin with multiple molecular weights of hyaluronic acid.",
        shortDescription: "Deep Hydration & Plumping",
        price: "695",
        category: "skincare",
        subcategory: "serums",
        imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.8",
        reviewCount: 1923,
        saleOffer: "B1G1FREE",
        size: "30ml",
        ingredients: ["Hyaluronic Acid", "Sodium Hyaluronate", "Vitamin B5"],
        benefits: ["Deep hydration", "Plumps skin", "Reduces fine lines"]
      },
      {
        name: "Retinol Anti-Aging Serum",
        slug: "retinol-anti-aging-serum",
        description: "A gentle yet effective retinol serum that smooths fine lines and improves skin texture overnight.",
        shortDescription: "Reduces Fine Lines & Wrinkles",
        price: "895",
        category: "skincare",
        subcategory: "serums",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.5",
        reviewCount: 1456,
        saleOffer: "B1G1FREE",
        size: "30ml",
        ingredients: ["Retinol", "Squalane", "Vitamin E"],
        benefits: ["Reduces wrinkles", "Improves texture", "Anti-aging"]
      },
      {
        name: "Gentle Foaming Face Wash",
        slug: "gentle-foaming-face-wash", 
        description: "A mild, sulfate-free cleanser that removes impurities while maintaining skin's natural moisture barrier.",
        shortDescription: "Deep Cleansing & Pore Minimizing",
        price: "445",
        category: "skincare",
        subcategory: "cleansers",
        imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.7",
        reviewCount: 3241,
        saleOffer: "B1G1FREE",
        size: "120ml",
        ingredients: ["Salicylic Acid", "Niacinamide", "Aloe Vera"],
        benefits: ["Deep cleansing", "Minimizes pores", "Gentle formula"]
      },
      {
        name: "SPF 50+ Sunscreen",
        slug: "spf-50-sunscreen",
        description: "Broad-spectrum sunscreen with SPF 50+ that protects against UV rays while providing a smooth, non-greasy finish.",
        shortDescription: "Broad Spectrum UV Protection",
        price: "545",
        category: "skincare",
        subcategory: "sunscreen",
        imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.6",
        reviewCount: 2156,
        saleOffer: "B1G1FREE",
        size: "50ml",
        ingredients: ["Zinc Oxide", "Titanium Dioxide", "Hyaluronic Acid"],
        benefits: ["UV protection", "Non-greasy", "Moisturizing"]
      },
      {
        name: "10% Niacinamide Serum",
        slug: "niacinamide-serum",
        description: "High-concentration niacinamide serum that minimizes pores and controls oil production for clearer skin.",
        shortDescription: "Brightens & Fades Spots",
        price: "595",
        category: "skincare",
        subcategory: "serums",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.6",
        reviewCount: 1834,
        saleOffer: "B1G1FREE",
        size: "30ml",
        ingredients: ["Niacinamide", "Zinc PCA", "Hyaluronic Acid"],
        benefits: ["Minimizes pores", "Controls oil", "Brightens skin"]
      },
      {
        name: "25% AHA 2% BHA 5% PHA Peeling Solution",
        slug: "aha-bha-pha-peeling-solution",
        description: "Professional-strength chemical exfoliant that removes dead skin cells and reveals brighter, smoother skin.",
        shortDescription: "10-Mins Tan Removal",
        price: "645",
        category: "skincare",
        subcategory: "exfoliants",
        imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.6",
        reviewCount: 987,
        saleOffer: "B1G1FREE",
        size: "30ml",
        ingredients: ["Glycolic Acid", "Salicylic Acid", "Lactic Acid"],
        benefits: ["Exfoliates skin", "Removes tan", "Brightens complexion"]
      },
      {
        name: "Squalane Glow Moisturizer",
        slug: "squalane-glow-moisturizer",
        description: "Lightweight moisturizer enriched with squalane that hydrates and gives skin a natural, healthy glow.",
        shortDescription: "Enhances Glow",
        price: "550",
        category: "skincare",
        subcategory: "moisturizers",
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.7",
        reviewCount: 2654,
        saleOffer: "B1G1FREE",
        size: "50ml",
        ingredients: ["Squalane", "Hyaluronic Acid", "Vitamin E"],
        benefits: ["Hydrates skin", "Natural glow", "Lightweight formula"]
      },

      // Haircare Products (6)
      {
        name: "Redensyl & Anagain Hair Growth Serum",
        slug: "hair-growth-serum",
        description: "Advanced hair growth serum with clinically proven ingredients that promote new hair growth and reduce hair fall.",
        shortDescription: "New Hair Growth in 28 Days",
        price: "545",
        category: "haircare",
        subcategory: "treatments",
        imageUrl: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.7",
        reviewCount: 3456,
        featured: true,
        bestseller: true,
        saleOffer: "B1G1FREE",
        size: "50ml",
        ingredients: ["Redensyl", "Anagain", "Caffeine"],
        benefits: ["Promotes hair growth", "Reduces hair fall", "Strengthens hair"]
      },
      {
        name: "Australian Tea Tree Anti-Dandruff Shampoo",
        slug: "anti-dandruff-shampoo",
        description: "Non-drying anti-dandruff shampoo with Australian tea tree oil that eliminates flakes and soothes scalp.",
        shortDescription: "Reduces Visible Flakes From 1st Wash",
        price: "395",
        category: "haircare",
        subcategory: "shampoos",
        imageUrl: "https://pixabay.com/get/g0a6eacaa7a03f1aeec9a383a41d207a87a19f8bd68822bd5170e9291fd5f2c5af70c64606925a9dc2630653e4a83fefdaf9e3bbe0e09cc2e4bde6a24d2e96e44_1280.png",
        rating: "4.7",
        reviewCount: 5435,
        bestseller: true,
        saleOffer: "B1G1FREE",
        size: "200ml",
        ingredients: ["Tea Tree Oil", "Salicylic Acid", "Aloe Vera"],
        benefits: ["Eliminates dandruff", "Non-drying", "Soothes scalp"]
      },
      {
        name: "Patuá & Keratin Smoothening Shampoo",
        slug: "keratin-smoothening-shampoo",
        description: "Smoothening shampoo infused with Patuá oil and keratin that tames frizz and adds shine to hair.",
        shortDescription: "10X Keratin-Smooth Hair in 1 Wash",
        price: "395",
        category: "haircare",
        subcategory: "shampoos",
        imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.7",
        reviewCount: 5602,
        saleOffer: "B1G1FREE",
        size: "200ml",
        ingredients: ["Patuá Oil", "Keratin", "Argan Oil"],
        benefits: ["Smooths hair", "Reduces frizz", "Adds shine"]
      },
      {
        name: "Korean Rice Water Advanced Damage Repair Shampoo",
        slug: "korean-rice-water-shampoo",
        description: "Damage repair shampoo with Korean rice water and collagen that restores and strengthens damaged hair.",
        shortDescription: "Restores Damaged Hair",
        price: "345",
        category: "haircare",
        subcategory: "shampoos",
        imageUrl: "https://pixabay.com/get/ga0ee270f3e8efb3f636463012fad4e0268849c73a5c059fbae918cda56d7f6e29e754dc247831dc6e423f089d165d5c656fb1e4b7b6b5f345ae21772d2f91cac_1280.png",
        rating: "4.5",
        reviewCount: 156,
        newLaunch: true,
        saleOffer: "B1G1FREE",
        size: "200ml",
        ingredients: ["Rice Water", "Collagen", "Amino Acids"],
        benefits: ["Repairs damage", "Strengthens hair", "Restores elasticity"]
      },
      {
        name: "Deep Conditioning Hair Mask",
        slug: "deep-conditioning-hair-mask",
        description: "Intensive weekly treatment that deeply nourishes and repairs dry, damaged hair with natural oils.",
        shortDescription: "Weekly Intensive Treatment",
        price: "595",
        category: "haircare",
        subcategory: "treatments",
        imageUrl: "https://pixabay.com/get/g095925876d565006d90ffb8d755ebfda813f6916a04734493b52285737cd6c825f285265d27bd58058678346fb3b1c499cacdfe097f28972b0179d9ff5340ebb_1280.jpg",
        rating: "4.6",
        reviewCount: 1234,
        saleOffer: "B1G1FREE",
        size: "200ml",
        ingredients: ["Argan Oil", "Coconut Oil", "Shea Butter"],
        benefits: ["Deep conditioning", "Repairs damage", "Intensive nourishment"]
      },
      {
        name: "Spanish Rosemary Water with Biotin",
        slug: "rosemary-water-biotin",
        description: "Hair growth promoting spray with Spanish rosemary and biotin that stimulates scalp and strengthens hair.",
        shortDescription: "Promote Healthier Growth",
        price: "225",
        category: "haircare",
        subcategory: "treatments",
        imageUrl: "https://pixabay.com/get/ge4b89d2de91d4673eaa52cd71404a9c0596d54143a5a63c75eaab7b1f23b0ea31039065ed2345d2209cd0b741c5188fa19e0fb4518ebfde6751fa96284b573d2_1280.jpg",
        rating: "4.4",
        reviewCount: 567,
        saleOffer: "B1G1FREE",
        size: "100ml",
        ingredients: ["Rosemary Extract", "Biotin", "Peppermint Oil"],
        benefits: ["Stimulates growth", "Strengthens hair", "Improves circulation"]
      },

      // Makeup Products (6)
      {
        name: "Matte Me Up! Bullet Lipstick",
        slug: "matte-bullet-lipstick",
        description: "Long-lasting matte lipstick with rich pigmentation and comfortable wear that doesn't dry out lips.",
        shortDescription: "Lasts All Day Long",
        price: "595",
        category: "makeup",
        subcategory: "lips",
        imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.9",
        reviewCount: 4567,
        featured: true,
        bestseller: true,
        saleOffer: "B1G1FREE",
        variants: {
          colors: ["Coral Envy", "Red Romance", "Pink Passion", "Berry Bliss", "Nude Perfection"]
        },
        ingredients: ["Vitamin E", "Jojoba Oil", "Carnauba Wax"],
        benefits: ["Long-lasting", "Rich color", "Non-drying formula"]
      },
      {
        name: "Dream Matte Serum Foundation",
        slug: "dream-matte-foundation",
        description: "Hybrid foundation that combines skincare benefits with full coverage for a flawless, natural-looking finish.",
        shortDescription: "Makeup Meets Skincare",
        price: "695",
        category: "makeup",
        subcategory: "face",
        imageUrl: "https://images.unsplash.com/photo-1552046122-03184de85e08?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.8",
        reviewCount: 2134,
        saleOffer: "B1G1FREE",
        variants: {
          shades: ["Pure Ivory", "Light Beige", "Medium Tan", "Deep Caramel", "Rich Espresso"]
        },
        ingredients: ["Niacinamide", "Hyaluronic Acid", "SPF 20"],
        benefits: ["Full coverage", "Skincare benefits", "All-day wear"]
      },
      {
        name: "Matte Me Up! Liquid Lipstick",
        slug: "matte-liquid-lipstick",
        description: "High-impact liquid lipstick with intense color payoff and transfer-proof matte finish.",
        shortDescription: "Smooth Glide, Rich Colour",
        price: "495",
        category: "makeup",
        subcategory: "lips",
        imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.9",
        reviewCount: 3456,
        saleOffer: "B1G1FREE",
        variants: {
          colors: ["The Red Stiletto", "Burgundy Belle", "Pink Power", "Orange Crush", "Brown Sugar"]
        },
        ingredients: ["Vitamin C", "Shea Butter", "Antioxidants"],
        benefits: ["Transfer-proof", "Intense color", "Comfortable wear"]
      },
      {
        name: "Dubai Bling Glitter Lipstick",
        slug: "dubai-bling-glitter-lipstick",
        description: "Glamorous glitter lipstick that adds sparkle and shine while nourishing lips with moisturizing ingredients.",
        shortDescription: "Nourishing & Hydrating",
        price: "645",
        category: "makeup",
        subcategory: "lips",
        imageUrl: "https://pixabay.com/get/gc899bba0e4dacba4bcfa54839059d58d328e1758d8dbfda4639ebd6945d3972f90ad73829a2bcafeac796028033621df26a7b871e2219558b479b72f4891390f_1280.jpg",
        rating: "4.9",
        reviewCount: 1876,
        saleOffer: "B1G1FREE",
        variants: {
          colors: ["Jumeirah Jewel", "Gold Rush", "Rose Gold", "Silver Sparkle", "Bronze Goddess"]
        },
        ingredients: ["Hyaluronic Acid", "Vitamin E", "Coconut Oil"],
        benefits: ["Glamorous sparkle", "Hydrating", "Long-lasting"]
      },
      {
        name: "Glow BB Cream",
        slug: "glow-bb-cream",
        description: "Multi-benefit BB cream that provides coverage, hydration, and sun protection with a natural glow finish.",
        shortDescription: "Natural Glow, Matte Finish",
        price: "395",
        category: "makeup",
        subcategory: "face",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.8",
        reviewCount: 1567,
        saleOffer: "B1G1FREE",
        variants: {
          shades: ["Beige Glow", "Medium Glow", "Deep Glow"]
        },
        ingredients: ["SPF 30", "Vitamin C", "Peptides"],
        benefits: ["Natural coverage", "Sun protection", "Hydrating"]
      },
      {
        name: "Mega Curl Tubing Mascara",
        slug: "mega-curl-mascara",
        description: "Next-generation tubing mascara that creates dramatic curl and volume while being easy to remove.",
        shortDescription: "Next-gen Tubing Technology",
        price: "495",
        category: "makeup",
        subcategory: "eyes",
        imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.8",
        reviewCount: 987,
        newLaunch: true,
        saleOffer: "B1G1FREE",
        size: "5ml",
        ingredients: ["Carnauba Wax", "Vitamin E", "Panthenol"],
        benefits: ["Dramatic curl", "Volume boost", "Tubing technology"]
      },

      // Body Care Products (4) 
      {
        name: "Shea Butter Body Lotion",
        slug: "shea-butter-body-lotion",
        description: "Luxurious body lotion enriched with pure shea butter that provides 24-hour moisturization for soft, smooth skin.",
        shortDescription: "24-Hour Deep Moisturization",
        price: "495",
        category: "bodycare",
        subcategory: "moisturizers",
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.7",
        reviewCount: 2345,
        saleOffer: "B1G1FREE",
        size: "250ml",
        ingredients: ["Shea Butter", "Coconut Oil", "Vitamin E"],
        benefits: ["Long-lasting moisture", "Softens skin", "Natural ingredients"]
      },
      {
        name: "Coffee Body Scrub",
        slug: "coffee-body-scrub",
        description: "Energizing body scrub with coffee grounds and natural oils that exfoliates dead skin and improves circulation.",
        shortDescription: "Exfoliates & Energizes Skin",
        price: "395",
        category: "bodycare",
        subcategory: "exfoliants",
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.6",
        reviewCount: 1678,
        saleOffer: "B1G1FREE",
        size: "200ml",
        ingredients: ["Coffee Grounds", "Brown Sugar", "Coconut Oil"],
        benefits: ["Exfoliates skin", "Improves circulation", "Energizing"]
      },
      {
        name: "Lavender Body Wash",
        slug: "lavender-body-wash",
        description: "Relaxing body wash infused with lavender essential oil that cleanses gently while providing aromatherapy benefits.",
        shortDescription: "Relaxing & Moisturizing",
        price: "345",
        category: "bodycare",
        subcategory: "cleansers",
        imageUrl: "https://pixabay.com/get/g3e6280be5902d96e26ff6f6a376e8863e630287d24371a288e048a498999fc557d80eb0b31bacb8a7f71ff1f4312c84e5afd8f70df8ae04c5180e3fb08d88397_1280.jpg",
        rating: "4.5",
        reviewCount: 1234,
        saleOffer: "B1G1FREE",
        size: "300ml",
        ingredients: ["Lavender Oil", "Chamomile Extract", "Aloe Vera"],
        benefits: ["Relaxing scent", "Gentle cleansing", "Moisturizing"]
      },
      {
        name: "Nourishing Body Oil",
        slug: "nourishing-body-oil",
        description: "Multi-purpose body oil with a blend of natural oils that deeply hydrates and leaves skin with a healthy glow.",
        shortDescription: "Deeply Hydrates & Softens",
        price: "695",
        category: "bodycare",
        subcategory: "oils",
        imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.8",
        reviewCount: 876,
        saleOffer: "B1G1FREE",
        size: "100ml",
        ingredients: ["Jojoba Oil", "Rosehip Oil", "Vitamin E"],
        benefits: ["Deep hydration", "Natural glow", "Multi-purpose"]
      }
    ];

    productsData.forEach((prod: any) => {
      const product: Product = { 
        ...prod, 
        id: this.currentProductId++,
        inStock: true,
        featured: prod.featured || false,
        bestseller: prod.bestseller || false,
        newLaunch: prod.newLaunch || false,
        tags: prod.tags || null,
        originalPrice: prod.originalPrice || null,
        subcategory: prod.subcategory || null,
        variants: prod.variants || null,
        size: prod.size || null,
        saleOffer: prod.saleOffer || null,
        ingredients: prod.ingredients || null,
        benefits: prod.benefits || null,
        howToUse: prod.howToUse || null
      };
      this.products.set(product.id, product);
    });
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.slug === slug);
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.featured);
  }

  async getBestsellerProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.bestseller);
  }

  async getNewLaunchProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.newLaunch);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = { 
      id: this.currentProductId++,
      name: insertProduct.name,
      slug: insertProduct.slug,
      description: insertProduct.description,
      shortDescription: insertProduct.shortDescription,
      price: insertProduct.price,
      originalPrice: insertProduct.originalPrice ?? null,
      category: insertProduct.category,
      subcategory: insertProduct.subcategory ?? null,
      imageUrl: insertProduct.imageUrl,
      rating: insertProduct.rating,
      reviewCount: insertProduct.reviewCount ?? 0,
      inStock: insertProduct.inStock ?? true,
      featured: insertProduct.featured ?? false,
      bestseller: insertProduct.bestseller ?? false,
      newLaunch: insertProduct.newLaunch ?? false,
      saleOffer: insertProduct.saleOffer ?? null,
      variants: insertProduct.variants ?? null,
      ingredients: insertProduct.ingredients ?? null,
      benefits: insertProduct.benefits ?? null,
      howToUse: insertProduct.howToUse ?? null,
      size: insertProduct.size ?? null,
      tags: insertProduct.tags ?? null
    };
    this.products.set(product.id, product);
    return product;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(c => c.slug === slug);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = { 
      ...insertCategory, 
      id: this.currentCategoryId++,
      productCount: insertCategory.productCount ?? 0
    };
    this.categories.set(category.id, category);
    return category;
  }
}

export const storage = new MemStorage();
