from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from werkzeug.utils import secure_filename
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
DATA_FILE = 'products.json'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create necessary folders
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_products():
    """Load products from JSON file"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_products(products):
    """Save products to JSON file"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

def get_next_id(products):
    """Get next available ID"""
    if not products:
        return 1
    return max(p['id'] for p in products) + 1

# Routes
@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products"""
    products = load_products()
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    """Add new product"""
    try:
        products = load_products()
        
        # Get form data
        name = request.form.get('name')
        price = float(request.form.get('price'))
        quantity = int(request.form.get('quantity'))
        description = request.form.get('description', '')
        
        # Handle image upload
        image_filename = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                # Create unique filename
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = secure_filename(file.filename)
                name_part, ext = os.path.splitext(filename)
                image_filename = f"{name_part}_{timestamp}{ext}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], image_filename))
        
        # Create new product
        new_product = {
            'id': get_next_id(products),
            'name': name,
            'price': price,
            'quantity': quantity,
            'description': description,
            'image': image_filename
        }
        
        products.append(new_product)
        save_products(products)
        
        return jsonify(new_product), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update existing product"""
    try:
        products = load_products()
        product_index = next((i for i, p in enumerate(products) if p['id'] == product_id), None)
        
        if product_index is None:
            return jsonify({'error': 'Product not found'}), 404
        
        # Get existing product
        product = products[product_index]
        
        # Update fields
        product['name'] = request.form.get('name', product['name'])
        product['price'] = float(request.form.get('price', product['price']))
        product['quantity'] = int(request.form.get('quantity', product['quantity']))
        product['description'] = request.form.get('description', product['description'])
        
        # Handle new image upload
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                # Delete old image if exists
                if product.get('image'):
                    old_image_path = os.path.join(app.config['UPLOAD_FOLDER'], product['image'])
                    if os.path.exists(old_image_path):
                        os.remove(old_image_path)
                
                # Save new image
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = secure_filename(file.filename)
                name_part, ext = os.path.splitext(filename)
                image_filename = f"{name_part}_{timestamp}{ext}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], image_filename))
                product['image'] = image_filename
        
        products[product_index] = product
        save_products(products)
        
        return jsonify(product)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete product"""
    try:
        products = load_products()
        product = next((p for p in products if p['id'] == product_id), None)
        
        if product is None:
            return jsonify({'error': 'Product not found'}), 404
        
        # Delete image file if exists
        if product.get('image'):
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], product['image'])
            if os.path.exists(image_path):
                os.remove(image_path)
        
        # Remove product from list
        products = [p for p in products if p['id'] != product_id]
        save_products(products)
        
        return jsonify({'message': 'Product deleted successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS)"""
    return send_from_directory('.', filename)

if __name__ == '__main__':
    print("🚀 Starting Product Management API Server...")
    print("📡 Server running at: http://localhost:5000")
    print("📂 Upload folder:", UPLOAD_FOLDER)
    print("💾 Data file:", DATA_FILE)
    app.run(debug=True, host='0.0.0.0', port=5000)
