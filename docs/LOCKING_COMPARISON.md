## So sánh các cơ chế lock: Pessimistic Lock, Optimistic Lock, Redlock (Redis Lock)

Tài liệu này tóm tắt và hệ thống lại nội dung trong các slide về 3 cơ chế lock phổ biến khi xử lý concurrency: **Pessimistic Lock**, **Optimistic Lock** và **Redlock (Redis Lock)**.

---

## 1. Pessimistic Lock (`SELECT ... FOR UPDATE`)

### Ưu điểm

- **An toàn tuyệt đối**:
  Không xảy ra oversell, race condition vì chỉ một transaction được thao tác trên bản ghi tại một thời điểm.
- **Đơn giản về mặt logic**:
  Không cần xử lý retry ở tầng ứng dụng.

### Nhược điểm

- **Hiệu suất thấp khi nhiều người cùng thao tác**:
  Các transaction khác sẽ bị block/chờ, dễ gây nghẽn cổ chai.
- **Nguy cơ deadlock**:
  Nếu lock nhiều bản ghi theo thứ tự khác nhau.
- **Không scale tốt**:
  Chỉ hiệu quả khi dùng 1 DB, không phù hợp với hệ thống phân tán nhiều DB.
- **Giới hạn hệ quản trị CSDL hỗ trợ**:
  Thường chỉ hỗ trợ tốt trên một số DB (Postgres, MySQL, ...).

### Khi nào nên dùng?

- Khi số lượng xung đột thấp, hệ thống nhỏ hoặc vừa.
- Khi cần đảm bảo tuyệt đối không oversell (ví dụ: bán vé sự kiện, flash sale nhỏ).
- Khi chỉ chạy 1 instance app hoặc 1 DB.

---

## 2. Optimistic Lock (kiểm tra `version`/`updatedAt`)

### Ưu điểm

- **Hiệu suất cao**:
  Không block transaction khác, phù hợp hệ thống nhiều đọc, ít ghi xung đột.
- **Dễ scale**:
  Không phụ thuộc vào lock của DB, dễ mở rộng nhiều instance app.
- **Triển khai đơn giản**:
  Chỉ cần thêm trường `version` hoặc `updatedAt`.

### Nhược điểm

- **Có thể xảy ra lỗi khi xung đột**:
  Nếu nhiều người cùng thao tác, sẽ có request bị lỗi _version conflict_, cần retry ở frontend hoặc backend.
- **Cần xử lý retry ở tầng ứng dụng hoặc báo lỗi cho người dùng**.
- **Không phù hợp cho thao tác ghi xung đột cao** (flash sale lớn, ghi rất nhiều).

### Khi nào nên dùng?

- Khi hệ thống chủ yếu là đọc, ít ghi xung đột.
- Khi cần scale out nhiều instance app.
- Khi chấp nhận được việc một số request bị lỗi và phải retry.

---

## 3. Redlock (Redis Lock)

### Ưu điểm

- **Phù hợp hệ thống phân tán**:
  Đảm bảo chỉ một tiến trình thao tác trên tài nguyên dù chạy nhiều instance app/server.
- **Không phụ thuộc DB**:
  Có thể dùng với bất kỳ DB nào.
- **Hiệu suất cao hơn Pessimistic Lock khi scale out**.

### Nhược điểm

- **Không tuyệt đối an toàn**:
  Nếu lock Redis hết hạn trước khi transaction xong, vẫn có thể xảy ra race condition.
- **Cần quản lý thời gian lock**:
  Phải đặt TTL hợp lý, gia hạn lock nếu transaction lâu.
- **Phức tạp hơn về triển khai và vận hành Redis** (cluster, HA, giám sát, ...).
- **Nếu Redis cluster gặp sự cố**:
  Có thể ảnh hưởng đến logic lock.

### Khi nào nên dùng?

- Khi hệ thống chạy nhiều instance app, cần lock phân tán ngoài DB.
- Khi DB không hỗ trợ tốt Pessimistic Lock hoặc không muốn lock ở DB.
- Khi thao tác ghi xung đột vừa phải, transaction xử lý tương đối nhanh.
- Khi muốn kiểm soát lock ở tầng ứng dụng (application-level lock).

---

## 4. Bảng tóm tắt so sánh

| Tiêu chí          | Pessimistic Lock      | Optimistic Lock                      | Redlock (Redis Lock)                        |
| ----------------- | --------------------- | ------------------------------------ | ------------------------------------------- |
| **Độ an toàn**    | Tuyệt đối             | Cao (nếu retry tốt)                  | Cao (nếu lock không hết hạn)                |
| **Hiệu suất**     | Thấp nếu xung đột cao | Cao                                  | Cao nếu cấu hình lock hợp lý                |
| **Scale out**     | Kém                   | Tốt                                  | Tốt                                         |
| **Độ phức tạp**   | Trung bình            | Thấp                                 | Cao                                         |
| **Dễ triển khai** | Dễ với 1 DB           | Dễ                                   | Cần Redis, code xử lý lock phức tạp hơn     |
| **Retry**         | Không cần             | Cần (thường ở frontend hoặc backend) | Có thể cần (thường ở frontend hoặc backend) |
| **Deadlock**      | Có thể xảy ra         | Không                                | Không                                       |

---

## 5. Khi nào chọn cơ chế nào?

- **Hệ thống nhỏ, ít xung đột, cần an toàn tuyệt đối, dùng 1 DB**
  → Ưu tiên **Pessimistic Lock**.

- **Hệ thống lớn, cần scale out, ít ghi xung đột, chấp nhận retry**
  → Ưu tiên **Optimistic Lock**.

- **Hệ thống phân tán, nhiều instance, cần lock ngoài DB, thao tác ghi vừa phải, transaction nhanh**
  → Ưu tiên **Redlock (Redis Lock)**.
