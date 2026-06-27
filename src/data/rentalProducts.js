const rentalProducts = [
  {
    id: "canon-eos-80d",
    category: "camera",
    brand: "Canon",
    model: "EOS 80D",
    name: "Canon EOS 80D DSLR Camera",
    megapixels: "33 MP",
    batteries: 2,
    available: true,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7N48e1fS1MI4yioCWlvu4sw1c3kDnmOrCQQeSWIe99Q&s=10",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7N48e1fS1MI4yioCWlvu4sw1c3kDnmOrCQQeSWIe99Q&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShDRyl2r-JsvZEvi1bA-h7YvcHsAyHnt88XzSSAj2lyw&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8msoOPUbOb995qTuh70-DcEpz19fmU8pWZV_J_6C_gw&s=10",
    ],
    pricing: {
      "1hr": 150,
      "5hrs": 500,
      "11hrs": 900,
      "24hrs": 1500,
      "2days": 3000,
      "3days": 4000,
      "1week": 8000,
    },
  },

  {
    id: "canon-eos-200d-ii",
    category: "camera",
    brand: "Canon",
    model: "EOS 200D II",
    name: "Canon EOS 200D II DSLR Camera",
    megapixels: "21 MP",
    batteries: 2,
    available: true,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdVL8fVq0Xzm0rHNbGEIpcoUQjGjy0_x2R1Xa7ur-S1w&s=10",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdVL8fVq0Xzm0rHNbGEIpcoUQjGjy0_x2R1Xa7ur-S1w&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCCfOloAvAbujpWP3cr9t1GJ4kPvcYU0QOEgxCCZMT3g&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq76yiG602u4uEs0NyI2j9T2R9NPq-sozaDxGf-cY9Aw&s=10",
    ],
    pricing: {
      "1hr": 100,
      "5hrs": 400,
      "11hrs": 700,
      "24hrs": 1200,
      "2days": 2400,
      "3days": 3000,
      "1week": 6500,
    },
  },

  {
    id: "sony-a7iii",
    category: "camera",
    brand: "Sony",
    model: "A7 III",
    name: "Sony Alpha A7 III Mirrorless Camera",
    megapixels: "24 MP",
    batteries: 2,
    available: true,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_i1mL8u5ETyxkkzXmvhCQWcSmUemIhXo39hohjRZSwg&s=10",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_i1mL8u5ETyxkkzXmvhCQWcSmUemIhXo39hohjRZSwg&s=10",
      "https://http2.mlstatic.com/D_NQ_NP_967682-MLA93853821769_092025-O.webp",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBvuaQsZVsoFZ_ijCsH0h2VNg-crkNgNNces6NQyiNBd_RbpJp9WSg7Sjv&s=10",
    ],
    pricing: {
      "1hr": 200,
      "5hrs": 700,
      "11hrs": 1200,
      "24hrs": 2000,
      "2days": 3500,
      "3days": 4500,
      "1week": 6000,
    },
  },

  {
    id: "canon-50mm-prime",
    category: "lens",
    brand: "Canon",
    model: "EF 50mm f/1.8 STM",
    name: "Canon EF 50mm f/1.8 STM Prime Lens",
    megapixels: "-",
    batteries: "-",
    available: true,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_c4s6acPKv_mC96m5TOO6OonAwzBpZN2L55jna1DXDQ&s=10",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_c4s6acPKv_mC96m5TOO6OonAwzBpZN2L55jna1DXDQ&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFffsAqK-JFibZF2jKaPv9g5WCmHUHjucAbaPx1Z6m0w&s=10"
    ],
    pricing: {
      "1hr": 50,
      "5hrs": 100,
      "11hrs": 200,
      "24hrs": 350,
      "2days": 500,
      "3days": 700,
      "1week": 2500,
    },
  },

  {
    id: "digitek-30w-rgb",
    category: "accessory",
    brand: "Digitek",
    model: "30W RGB",
    name: "Digitek 30W RGB LED Stick Light",
    megapixels: "-",
    batteries: "5200mAh",
    available: true,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDcTv9_Wd1Y1BhcsWJ-Hxz-BbYmggm8f7aKcljDqU9xg&s=10",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDcTv9_Wd1Y1BhcsWJ-Hxz-BbYmggm8f7aKcljDqU9xg&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS87JJJQm20NQyGTV5IY0JCshv2kgMQziywWT1Yn6dz8A&s",
    ],
    pricing: {
      "1hr": 100,
      "5hrs": 200,
      "11hrs": 300,
      "24hrs": 500,
      "2days": 1000,
      "3days": 2500,
      "1week": 6000,
    },
  },

  {
    id: "sony-70-200-gm",
    category: "lens",
    brand: "Sony",
    model: "70-200mm GM",
    name: "Sony FE 70-200mm f/2.8 GM OSS",
    megapixels: "-",
    batteries: "-",
    available: true,
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800",
    images: [
      "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=1200",
    ],
    pricing: {
      "1hr": 100,
      "5hrs": 250,
      "11hrs": 400,
      "24hrs": 600,
      "2days": 1500,
      "3days": 2000,
      "1week": 3000,
    },
  },

  {
    id: "digitek-lights",
    category: "accessory",
    brand: "Digitek",
    model: "1000W",
    name: "Digitek 1000W Video Light",
    megapixels: "-",
    batteries: "-",
    available: true,
    image:
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRn7QSKWz0EVXjcYMoZn0lQfcq-Dei25MOigq7Rryk2b9ficGs3Svmfq1BNWPA5PtvZWocm8oOQepWk7MkturFZAaarXjzGvA7cVdYsLWLwajZCo5uBvijla5oXxGRds3WNms-NbDobseU&usqp=CAc",
    images: [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRn7QSKWz0EVXjcYMoZn0lQfcq-Dei25MOigq7Rryk2b9ficGs3Svmfq1BNWPA5PtvZWocm8oOQepWk7MkturFZAaarXjzGvA7cVdYsLWLwajZCo5uBvijla5oXxGRds3WNms-NbDobseU&usqp=CAc",
      "https://m.media-amazon.com/images/I/51uJImL+dLL._SX679_.jpg",
    ],
    pricing: {
      "1hr": 100,
      "5hrs": 400,
      "11hrs": 600,
      "24hrs": 900,
      "2days": 1700,
      "3days": 2400,
      "1week": 4500,
    },
  },

  {
    id: "tripod-pro",
    category: "accessory",
    brand: "SmallRig",
    model: "SmallRig-70",
    name: "Manfrotto Professional Tripod",
    megapixels: "-",
    batteries: "-",
    available: true,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq7NW6D8DXIy0NVJhhgNF-7cy54eL7vwedmNmYeNW5OA&s=10",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq7NW6D8DXIy0NVJhhgNF-7cy54eL7vwedmNmYeNW5OA&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPjqQIEfWKXOSIDsgbP8yV64J22TjLJY6Dmr8RwVcO9Q&s=10",
    ],
    pricing: {
      "1hr": 50,
      "5hrs": 100,
      "11hrs": 250,
      "24hrs": 300,
      "2days": 600,
      "3days": 800,
      "1week": 1200,
    },
  },
];

export default rentalProducts;
