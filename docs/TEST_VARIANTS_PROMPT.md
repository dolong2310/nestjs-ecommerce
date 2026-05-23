```ts
type Variant = {
  value: string;
  options: string[];
};
type SKU = {
  value: string;
  price: number;
  stock: number;
  iamge: string;
};
const variants: Variant[] = [
  {
    value: 'Màu sắc',
    options: ['Đen', 'Trắng', 'Xanh', 'Vàng'],
  },
  {
    value: 'Kích cỡ',
    options: ['S', 'M', 'L', 'XL'],
  },
];
```

Hãy tạo một hàm nhận vào variants và trả về mảng `skus: SKU[]` như sau:

```json
[
  { "value": "Đen-S", "price": 0, "stock": 100, "image": "" },
  { "value": "Đen-M", "price": 0, "stock": 100, "image": "" },
  { "value": "Đen-M", "price": 0, "stock": 100, "image": "" },
  { "value": "Đen-XL", "price": 0, "stock": 100, "image": "" },
  { "value": "Trắng-S", "price": 0, "stock": 100, "image": "" },
  { "value": "Trắng-M", "price": 0, "stock": 100, "image": "" },
  { "value": "Trắng-L", "price": 0, "stock": 100, "image": "" },
  { "value": "Trắng-XL", "price": 0, "stock": 100, "image": "" },
  { "value": "Xanh-S", "price": 0, "stock": 100, "image": "" },
  { "value": "Xanh-M", "price": 0, "stock": 100, "image": "" },
  { "value": "Xanh-L", "price": 0, "stock": 100, "image": "" },
  { "value": "Xanh-XL", "price": 0, "stock": 100, "image": "" },
  { "value": "Vàng-S", "price": 0, "stock": 100, "image": "" },
  { "value": "Vàng-M", "price": 0, "stock": 100, "image": "" },
  { "value": "Vàng-L", "price": 0, "stock": 100, "image": "" },
  { "value": "Vàng-XL", "price": 0, "stock": 100, "image": "" }
]
```

Yêu cầu nếu số lượng variants có tăng lên thì hàm vẫn hoạt động đúng.
