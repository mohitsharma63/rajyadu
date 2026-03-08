// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  products;
  categories;
  currentProductId;
  currentCategoryId;
  constructor() {
    this.products = /* @__PURE__ */ new Map();
    this.categories = /* @__PURE__ */ new Map();
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.initializeData();
  }
  initializeData() {
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
    categoriesData.forEach((cat) => {
      const category = { ...cat, id: this.currentCategoryId++ };
      this.categories.set(category.id, category);
    });
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
        name: "Patu\xE1 & Keratin Smoothening Shampoo",
        slug: "keratin-smoothening-shampoo",
        description: "Smoothening shampoo infused with Patu\xE1 oil and keratin that tames frizz and adds shine to hair.",
        shortDescription: "10X Keratin-Smooth Hair in 1 Wash",
        price: "395",
        category: "haircare",
        subcategory: "shampoos",
        imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: "4.7",
        reviewCount: 5602,
        saleOffer: "B1G1FREE",
        size: "200ml",
        ingredients: ["Patu\xE1 Oil", "Keratin", "Argan Oil"],
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
    productsData.forEach((prod) => {
      const product = {
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
  async getProduct(id) {
    return this.products.get(id);
  }
  async getProductBySlug(slug) {
    return Array.from(this.products.values()).find((p) => p.slug === slug);
  }
  async getProducts() {
    return Array.from(this.products.values());
  }
  async getProductsByCategory(category) {
    return Array.from(this.products.values()).filter((p) => p.category === category);
  }
  async getFeaturedProducts() {
    return Array.from(this.products.values()).filter((p) => p.featured);
  }
  async getBestsellerProducts() {
    return Array.from(this.products.values()).filter((p) => p.bestseller);
  }
  async getNewLaunchProducts() {
    return Array.from(this.products.values()).filter((p) => p.newLaunch);
  }
  async createProduct(insertProduct) {
    const product = {
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
  async getCategory(id) {
    return this.categories.get(id);
  }
  async getCategoryBySlug(slug) {
    return Array.from(this.categories.values()).find((c) => c.slug === slug);
  }
  async getCategories() {
    return Array.from(this.categories.values());
  }
  async createCategory(insertCategory) {
    const category = {
      ...insertCategory,
      id: this.currentCategoryId++,
      productCount: insertCategory.productCount ?? 0
    };
    this.categories.set(category.id, category);
    return category;
  }
};
var storage = new MemStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });
  app2.get("/api/products/bestsellers", async (req, res) => {
    try {
      const products = await storage.getBestsellerProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bestseller products" });
    }
  });
  app2.get("/api/products/new-launches", async (req, res) => {
    try {
      const products = await storage.getNewLaunchProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch new launch products" });
    }
  });
  app2.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });
  app2.get("/api/products/filters", async (req, res) => {
    try {
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085";
      const response = await fetch(`${backendUrl}/api/products/filters`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch filter options" });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching filters:", error);
      res.status(500).json({ error: "Failed to fetch filter options" });
    }
  });
  app2.get("/api/products/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  app2.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "127.0.0.1"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
