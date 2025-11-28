// Product Manager Class
class ProductManager {
    constructor() {
        this.products = this.loadProducts();
        this.nextId = this.getNextId();
        this.editingId = null;
        this.apiUrl = 'http://localhost:5000/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProductsFromServer();
    }

    setupEventListeners() {
        // Form submit
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchProducts(e.target.value);
        });

        // Cancel button
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Image upload preview
        document.getElementById('product-image').addEventListener('change', (e) => {
            this.previewImage(e.target.files[0]);
        });
    }

    previewImage(file) {
        const preview = document.getElementById('image-preview');
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    }

    async handleSubmit() {
        const name = document.getElementById('product-name').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const quantity = parseInt(document.getElementById('product-quantity').value);
        const description = document.getElementById('product-description').value.trim();
        const imageFile = document.getElementById('product-image').files[0];

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('quantity', quantity);
        formData.append('description', description);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (this.editingId !== null) {
            formData.append('id', this.editingId);
            await this.updateProduct(this.editingId, formData);
        } else {
            await this.addProduct(formData);
        }

        this.resetForm();
    }

    async loadProductsFromServer() {
        try {
            const response = await fetch(`${this.apiUrl}/products`);
            if (response.ok) {
                this.products = await response.json();
                this.renderProducts();
                this.updateStats();
            }
        } catch (error) {
            console.log('Using local storage:', error);
            this.renderProducts();
            this.updateStats();
        }
    }

    async addProduct(formData) {
        try {
            const response = await fetch(`${this.apiUrl}/products`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                await this.loadProductsFromServer();
                this.showNotification('Thêm sản phẩm thành công!', 'success');
            }
        } catch (error) {
            this.showNotification('Lỗi kết nối server. Dùng chế độ offline.', 'error');
            console.error(error);
        }
    }

    async updateProduct(id, formData) {
        try {
            const response = await fetch(`${this.apiUrl}/products/${id}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                await this.loadProductsFromServer();
                this.showNotification('Cập nhật sản phẩm thành công!', 'success');
            }
        } catch (error) {
            this.showNotification('Lỗi kết nối server.', 'error');
            console.error(error);
        }
    }

    async deleteProduct(id) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                const response = await fetch(`${this.apiUrl}/products/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadProductsFromServer();
                    this.showNotification('Xóa sản phẩm thành công!', 'success');
                }
            } catch (error) {
                this.showNotification('Lỗi kết nối server.', 'error');
                console.error(error);
            }
        }
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.editingId = id;
            document.getElementById('product-id').value = id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-quantity').value = product.quantity;
            document.getElementById('product-description').value = product.description;

            // Show existing image if available
            const preview = document.getElementById('image-preview');
            if (product.image) {
                preview.innerHTML = `<img src="${this.apiUrl}/uploads/${product.image}" alt="Preview">`;
            }

            document.getElementById('form-title').textContent = 'Chỉnh Sửa Sản Phẩm';
            document.getElementById('submit-btn').innerHTML = '<span>💾</span> Cập Nhật';
            document.getElementById('cancel-btn').style.display = 'block';

            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    cancelEdit() {
        this.resetForm();
    }

    resetForm() {
        this.editingId = null;
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('form-title').textContent = 'Thêm Sản Phẩm Mới';
        document.getElementById('submit-btn').innerHTML = '<span>➕</span> Thêm Sản Phẩm';
        document.getElementById('cancel-btn').style.display = 'none';
    }

    searchProducts(searchTerm) {
        const filteredProducts = this.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderProducts(filteredProducts);
    }

    renderProducts(productsToRender = this.products) {
        const tbody = document.getElementById('product-list');
        
        if (productsToRender.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="8">Không tìm thấy sản phẩm nào.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = productsToRender.map(product => {
            const imageHtml = product.image 
                ? `<img src="${this.apiUrl}/uploads/${product.image}" class="product-image" alt="${product.name}">`
                : `<div class="product-image no-image">📦</div>`;
            
            return `
                <tr>
                    <td>${product.id}</td>
                    <td>${imageHtml}</td>
                    <td><strong>${product.name}</strong></td>
                    <td class="price">${this.formatCurrency(product.price)}</td>
                    <td>${product.quantity}</td>
                    <td>${product.description || '-'}</td>
                    <td class="price">${this.formatCurrency(product.price * product.quantity)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="productManager.editProduct(${product.id})">
                                ✏️ Sửa
                            </button>
                            <button class="btn-delete" onclick="productManager.deleteProduct(${product.id})">
                                🗑️ Xóa
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateStats() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, product) => 
            sum + (product.price * product.quantity), 0
        );

        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('total-value').textContent = this.formatCurrency(totalValue);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    showNotification(message, type = 'success') {
        // Simple alert for now - you can enhance this with a custom notification
        alert(message);
    }

    // Local Storage Methods
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
        localStorage.setItem('nextId', this.nextId.toString());
    }

    loadProducts() {
        const stored = localStorage.getItem('products');
        return stored ? JSON.parse(stored) : [];
    }

    getNextId() {
        const stored = localStorage.getItem('nextId');
        return stored ? parseInt(stored) : 1;
    }
}

// Initialize the app
let productManager;
document.addEventListener('DOMContentLoaded', () => {
    productManager = new ProductManager();
});