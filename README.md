# Hệ Thống Quản Lý Sản Phẩm

Ứng dụng web quản lý sản phẩm với khả năng upload hình ảnh, sử dụng Flask backend và giao diện HTML/CSS/JS.

## ✨ Tính năng

- ➕ Thêm sản phẩm mới (tên, giá, số lượng, mô tả, hình ảnh)
- ✏️ Chỉnh sửa sản phẩm
- 🗑️ Xóa sản phẩm
- 🖼️ Upload và hiển thị hình ảnh sản phẩm
- 🔍 Tìm kiếm sản phẩm theo tên/mô tả
- 📊 Thống kê tổng số lượng và giá trị
- 💾 Lưu trữ dữ liệu JSON
- 📱 Giao diện responsive

## 🛠️ Cài đặt

### 1. Cài đặt Python packages

```powershell
pip install -r requirements.txt
```

### 2. Chạy Flask server

```powershell
python app.py
```

Server sẽ chạy tại: http://localhost:5000

### 3. Mở ứng dụng

Mở file `index.html` trong trình duyệt hoặc truy cập: http://localhost:5000

## 📁 Cấu trúc thư mục

```
New folder/
│
├── index.html          # Giao diện chính
├── style.css           # CSS styling
├── script.js           # Frontend logic
├── app.py              # Flask backend API
├── requirements.txt    # Python dependencies
├── products.json       # Database (auto-created)
└── uploads/           # Thư mục lưu ảnh (auto-created)
```

## 🔌 API Endpoints

- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Thêm sản phẩm mới
- `PUT /api/products/<id>` - Cập nhật sản phẩm
- `DELETE /api/products/<id>` - Xóa sản phẩm
- `GET /api/uploads/<filename>` - Lấy hình ảnh

## 🎨 Hình ảnh hỗ trợ

- PNG, JPG, JPEG, GIF, WEBP
- Kích thước tối đa: 16MB

## 💡 Sử dụng

1. Khởi động Flask server
2. Mở index.html trong trình duyệt
3. Thêm sản phẩm mới với thông tin và hình ảnh
4. Quản lý sản phẩm: sửa, xóa, tìm kiếm

## 🔧 Yêu cầu

- Python 3.8+
- Trình duyệt web hiện đại (Chrome, Firefox, Edge)
