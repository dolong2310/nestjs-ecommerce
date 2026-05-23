# Client (Browser)
# Sepay (Payment SDK)
# Server (Payment Service)

1. Client sẽ bấm mua hàng với tất cả các order status (PENDING_PAYMENT) => request payment với `n` số lượng orders (nội dung chuyển tiền là các orderIds).
2. Trước khi tới Server thì request này sẽ chạy qua Sepay để kiểm tra số dư trong bank => sau đó gọi 1 request có body là thông tin chuyển khoản.
3. Server kiểm tra xác thực body (thông tin order, price,...) => nếu chuẩn và khớp tất cả các thông tin trong database thì emit event `PAYMENT_SUCCESS` => xoá orders