type Variant = {
  value: string;
  options: string[];
};

type SKU = {
  value: string;
  price: number;
  stock: number;
  image: string;
};

type Data = {
  name: string;
  basePrice: number;
  virtualPrice: number;
  brandId: number;
  images: string[];
  publishedAt: string | null; // ISO date string
  categories: number[]; // category ids
  variants: Variant[];
  skus: SKU[];
};

const data: Data = {
  name: 'Áo thun nam',
  basePrice: 100000,
  virtualPrice: 100000,
  brandId: 1,
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  publishedAt: new Date().toISOString(), // '2026-01-01T00:00:00.000Z',
  categories: [1, 2, 3],
  variants: [
    { value: 'Màu sắc', options: ['Đen', 'Trắng', 'Xanh', 'Vàng'] },
    { value: 'Kích cỡ', options: ['S', 'M', 'L', 'XL'] },
    { value: 'Chất liệu', options: ['Vải', 'Da', 'Tổng hợp'] },
  ],
  skus: [
    {
      value: 'Đen-S-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image1.jpg',
    },
    {
      value: 'Đen-S-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image2.jpg',
    },
    {
      value: 'Đen-S-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image3.jpg',
    },
    {
      value: 'Đen-M-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image4.jpg',
    },
    {
      value: 'Đen-M-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image5.jpg',
    },
    {
      value: 'Đen-M-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image6.jpg',
    },
    {
      value: 'Đen-L-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image7.jpg',
    },
    {
      value: 'Đen-L-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image8.jpg',
    },
    {
      value: 'Đen-L-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image9.jpg',
    },
    {
      value: 'Đen-XL-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image10.jpg',
    },
    {
      value: 'Đen-XL-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image11.jpg',
    },
    {
      value: 'Đen-XL-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image12.jpg',
    },
    {
      value: 'Trắng-S-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image13.jpg',
    },
    {
      value: 'Trắng-S-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image14.jpg',
    },
    {
      value: 'Trắng-S-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image15.jpg',
    },
    {
      value: 'Trắng-M-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image16.jpg',
    },
    {
      value: 'Trắng-M-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image17.jpg',
    },
    {
      value: 'Trắng-M-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image18.jpg',
    },
    {
      value: 'Trắng-L-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image19.jpg',
    },
    {
      value: 'Trắng-L-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image20.jpg',
    },
    {
      value: 'Trắng-L-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image21.jpg',
    },
    {
      value: 'Trắng-XL-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image22.jpg',
    },
    {
      value: 'Trắng-XL-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image23.jpg',
    },
    {
      value: 'Trắng-XL-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image24.jpg',
    },
    {
      value: 'Xanh-S-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image25.jpg',
    },
    {
      value: 'Xanh-S-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image26.jpg',
    },
    {
      value: 'Xanh-S-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image27.jpg',
    },
    {
      value: 'Xanh-M-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image28.jpg',
    },
    {
      value: 'Xanh-M-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image29.jpg',
    },
    {
      value: 'Xanh-M-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image30.jpg',
    },
    {
      value: 'Xanh-L-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image31.jpg',
    },
    {
      value: 'Xanh-L-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image32.jpg',
    },
    {
      value: 'Xanh-L-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image33.jpg',
    },
    {
      value: 'Xanh-XL-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image34.jpg',
    },
    {
      value: 'Xanh-XL-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image35.jpg',
    },
    {
      value: 'Xanh-XL-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image36.jpg',
    },
    {
      value: 'Vàng-S-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image37.jpg',
    },
    {
      value: 'Vàng-S-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image38.jpg',
    },
    {
      value: 'Vàng-S-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image39.jpg',
    },
    {
      value: 'Vàng-M-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image40.jpg',
    },
    {
      value: 'Vàng-M-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image41.jpg',
    },
    {
      value: 'Vàng-M-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image42.jpg',
    },
    {
      value: 'Vàng-L-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image43.jpg',
    },
    {
      value: 'Vàng-L-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image44.jpg',
    },
    {
      value: 'Vàng-L-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image45.jpg',
    },
    {
      value: 'Vàng-XL-Vải',
      price: 0,
      stock: 100,
      image: 'https://example.com/image46.jpg',
    },
    {
      value: 'Vàng-XL-Da',
      price: 0,
      stock: 100,
      image: 'https://example.com/image47.jpg',
    },
    {
      value: 'Vàng-XL-Tổng hợp',
      price: 0,
      stock: 100,
      image: 'https://example.com/image48.jpg',
    },
  ],
};

function generateSKUs(variants: Variant[]): SKU[] {
  // Hàm hỗ trợ để tạo tất cả tổ hợp
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), ['']);
  }

  // Lấy mảng các options từ variants
  const options = variants.map((variant) => variant.options);

  // Tạo tất cả tổ hợp
  const combinations = getCombinations(options);

  // Map mỗi tổ hợp thành SKU (loại bỏ chuỗi rỗng nếu có)
  return combinations.map((value, index) => ({
    value,
    price: 0,
    stock: 100,
    image: `https://example.com/image${index + 1}.jpg`,
  }));
}

const testProducts = [
  // 1. Thời trang
  {
    name: 'Áo thun nam basic cotton',
    variants: [
      {
        value: 'color',
        options: ['Trắng', 'Đen', 'Xanh navy'],
      },
      {
        value: 'size',
        options: ['S', 'M', 'L', 'XL'],
      },
    ],
    basePrice: 199000,
    virtualPrice: 249000,
    brandId: 1,
    images: ['https://example.com/images/tshirt-basic-front.jpg', 'https://example.com/images/tshirt-basic-back.jpg'],
    publishedAt: new Date('2025-01-15T08:00:00.000Z'),
    categories: [1],
    skus: [
      {
        value: 'Trắng-S',
        price: 0,
        stock: 100,
        image: 'https://example.com/image1.jpg',
      },
      {
        value: 'Trắng-M',
        price: 0,
        stock: 100,
        image: 'https://example.com/image2.jpg',
      },
      {
        value: 'Trắng-L',
        price: 0,
        stock: 100,
        image: 'https://example.com/image3.jpg',
      },
      {
        value: 'Trắng-XL',
        price: 0,
        stock: 100,
        image: 'https://example.com/image4.jpg',
      },
      {
        value: 'Đen-S',
        price: 0,
        stock: 100,
        image: 'https://example.com/image5.jpg',
      },
      {
        value: 'Đen-M',
        price: 0,
        stock: 100,
        image: 'https://example.com/image6.jpg',
      },
      {
        value: 'Đen-L',
        price: 0,
        stock: 100,
        image: 'https://example.com/image7.jpg',
      },
      {
        value: 'Đen-XL',
        price: 0,
        stock: 100,
        image: 'https://example.com/image8.jpg',
      },
      {
        value: 'Xanh navy-S',
        price: 0,
        stock: 100,
        image: 'https://example.com/image9.jpg',
      },
      {
        value: 'Xanh navy-M',
        price: 0,
        stock: 100,
        image: 'https://example.com/image10.jpg',
      },
      {
        value: 'Xanh navy-L',
        price: 0,
        stock: 100,
        image: 'https://example.com/image11.jpg',
      },
      {
        value: 'Xanh navy-XL',
        price: 0,
        stock: 100,
        image: 'https://example.com/image12.jpg',
      },
    ],
  },

  // 2. Đồ công nghệ
  {
    name: 'Tai nghe Bluetooth chống ồn',
    variants: [
      {
        value: 'color',
        options: ['Đen', 'Bạc'],
      },
      {
        value: 'warranty',
        options: ['12 tháng', '24 tháng'],
      },
    ],
    basePrice: 1599000,
    virtualPrice: 1799000,
    brandId: 2,
    images: ['https://example.com/images/headphone-main.jpg', 'https://example.com/images/headphone-side.jpg'],
    publishedAt: new Date('2025-02-01T09:30:00.000Z'),
    categories: [2],
    skus: [
      {
        value: 'Đen-12 tháng',
        price: 0,
        stock: 100,
        image: 'https://example.com/image1.jpg',
      },
      {
        value: 'Đen-24 tháng',
        price: 0,
        stock: 100,
        image: 'https://example.com/image2.jpg',
      },
      {
        value: 'Bạc-12 tháng',
        price: 0,
        stock: 100,
        image: 'https://example.com/image3.jpg',
      },
      {
        value: 'Bạc-24 tháng',
        price: 0,
        stock: 100,
        image: 'https://example.com/image4.jpg',
      },
    ],
  },

  // 3. Giáo dục
  {
    name: 'Khóa học online: Lập trình TypeScript từ zero đến hero',
    variants: [
      {
        value: 'access',
        options: ['3 tháng', '12 tháng', 'Trọn đời'],
      },
      {
        value: 'support',
        options: ['Group Facebook', 'Mentor 1-1'],
      },
    ],
    basePrice: 990000,
    virtualPrice: 1490000,
    brandId: 3, // ví dụ coi như là "nhà xuất bản / đơn vị đào tạo"
    images: ['https://example.com/images/ts-course-cover.jpg', 'https://example.com/images/ts-course-preview.jpg'],
    publishedAt: new Date('2025-01-10T10:00:00.000Z'),
    categories: [3],
    skus: [
      {
        value: '3 tháng-Group Facebook',
        price: 0,
        stock: 100,
        image: 'https://example.com/image1.jpg',
      },
      {
        value: '3 tháng-Mentor 1-1',
        price: 0,
        stock: 100,
        image: 'https://example.com/image2.jpg',
      },
      {
        value: '12 tháng-Group Facebook',
        price: 0,
        stock: 100,
        image: 'https://example.com/image3.jpg',
      },
      {
        value: '12 tháng-Mentor 1-1',
        price: 0,
        stock: 100,
        image: 'https://example.com/image4.jpg',
      },
      {
        value: 'Trọn đời-Group Facebook',
        price: 0,
        stock: 100,
        image: 'https://example.com/image5.jpg',
      },
      {
        value: 'Trọn đời-Mentor 1-1',
        price: 0,
        stock: 100,
        image: 'https://example.com/image6.jpg',
      },
    ],
  },
];

// Ví dụ sử dụng
// const variants: Variant[] = [
//   { value: 'Kích thước', options: ['S', 'M', 'L', 'XL'] },
//   { value: 'Màu sắc', options: ['Tím', 'Đen', 'Trắng', 'Xanh'] },
//   { value: 'Chất liệu', options: ['Vải', 'Da', 'Tổng hợp'] },
// ];
// const skus = generateSKUs(variants);

// Test hàm
// const skus = generateSKUs(testProducts[2].variants);
// console.log(skus);

const skus1 = generateSKUs([
  {
    value: "duration",
    options: ["6 tháng", "12 tháng", "Trọn đời"],
  },
  {
    value: "certificate",
    options: ["Có chứng chỉ", "Không chứng chỉ"],
  },
]);

const skus2 = generateSKUs([
  {
    value: "level",
    options: ["Band 5.0-6.5", "Band 6.5-8.0"],
  },
  {
    value: "package",
    options: ["Sách + Audio", "Sách + Audio + Video"],
  },
]);

const skus3 = generateSKUs([
  {
    value: "access",
    options: ["3 tháng", "6 tháng", "Trọn đời"],
  },
  {
    value: "support",
    options: ["Tự học", "Có mentor", "Mentor + Project review"],
  },
]);

const skus4 = generateSKUs([
  {
    value: "format",
    options: ["Thẻ giấy", "App mobile", "Combo giấy + App"],
  },
  {
    value: "level",
    options: ["Cơ bản", "Nâng cao"],
  },
]);


console.log("skus1: ", JSON.stringify(skus1));
console.log("###############################################################")
console.log("skus2: ", JSON.stringify(skus2));
console.log("###############################################################")
console.log("skus3: ", JSON.stringify(skus3));
console.log("###############################################################")
console.log("skus4: ", JSON.stringify(skus4));