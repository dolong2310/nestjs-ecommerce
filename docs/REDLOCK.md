# Cách hoạt động của Redlock trong logic đặt hàng

1. Acquire lock (xin khoá)

- khi 1 request muốn đặt hàng, nó sẽ gọi `redlock.acquire(['lock:sku:123'], 3000)` để xin quyền thao tác với SKU 123.
- nếu CHƯA CÓ AI GIỮ LOCK NÀY, redlock sẽ cấp cho request đó trong 3 giây (như đã cấu hình trên).
- nếu ĐÃ CÓ REQUEST KHÁC GIỮ LOCK, redlock sẽ tự động retry (theo cấu hình ở redlock client), nếu vẫn không được acquire thì throw lỗi.

2. Thao tác an toàn

- khi đã acquire lock thành công, chỉ request này mới được phép kiểm tra và trừ tồn kho SKU đó.
- các reuqest khác muốn thao tác cuùng SKU sẽ phải CHỜ hoặc bị TỪ CHỐI (nếu hết retry).

3. Giải phóng lock

- Sau khi thao tác xong (dù thành công hay lỗi), request phải gọi `lock.release()` để trả lại lock cho redis.
- nếu không release, lock sẽ tự động hết hạn sau thời gian đã cấu hình (là 3 giây).

4. Đảm bảo an toàn phân tán

- redlock có thể làm việc với nhiều redis node (cluster), đảm bảo tính nhất quán và an toàn khi 1 số node bị lỗi.
- trong thực tế, chỉ cần 1 redis node là đã hoạt động t ốt cho use cáe phổ biến.
