const buyProducts = [
  {
    id: 1,
    slug: "sony-alpha-a7-iii",
    name: "Sony Alpha A7 III",
    brand: "Sony",
    category: "Camera",

    price: 120000,
    condition: "Like New",
    warranty: "6 Months",

    stock: true,
    featured: true,

    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80",

    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80",
      "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=1200&q=80",
    ],

    description:
      "Professional full-frame mirrorless camera for photography and videography.",

    specifications: {
      sensor: "24.2 MP Full Frame",
      video: "4K 30fps",
      battery: "2 Batteries Included",
      shutter: "50K Clicks",
    },

    accessories: ["Battery", "Charger", "Camera Strap", "Original Box"],
  },

  {
    id: 2,
    slug: "canon-r6-mark-ii",
    name: "Canon EOS R6 Mark II",
    brand: "Canon",
    category: "Camera",

    price: 185000,
    condition: "Excellent",
    warranty: "1 Year",

    stock: true,
    featured: true,

    image:
      "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=1200&q=80",

    images: [
      "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=1200&q=80",
      "https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=1200&q=80",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80",
    ],

    description: "High-performance mirrorless camera with advanced autofocus.",

    specifications: {
      sensor: "24 MP",
      video: "4K 60fps",
      battery: "2 Batteries",
      shutter: "20K Clicks",
    },

    accessories: ["Battery", "Charger", "Original Box"],
  },

  {
    id: 3,
    slug: "dji-mini-4-pro",
    name: "DJI Mini 4 Pro",
    brand: "DJI",
    category: "Drone",

    price: 95000,
    condition: "Excellent",
    warranty: "6 Months",

    stock: true,

    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&q=80",

    images: [
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&q=80",
      "https://images.unsplash.com/photo-1508614999368-9260051292e5?w=1200&q=80",
      "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?w=1200&q=80",
    ],

    description: "Compact professional drone with 4K HDR recording.",

    specifications: {
      camera: "48 MP",
      video: "4K 60fps",
      range: "20 KM",
      battery: "34 Minutes",
    },

    accessories: ["Remote Controller", "Battery", "Carrying Bag"],
  },
];

export default buyProducts;
