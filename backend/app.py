from flask import Flask, jsonify, request
from flask_cors import CORS
import pickle


app = Flask(__name__)
CORS(app)

# Load similarity matrix
with open('similarity_matrix.pkl', 'rb') as f:
    similarity_matrix = pickle.load(f)

# Demo products
products = {
    1: "Laptop",
    2: "Smartphone",
    3: "Headphone",
    4: "Smartwatch",
    5: "Camera"
}

@app.route('/recommendations/<int:user_id>')
def get_recommendations(user_id):
    recommended_ids = similarity_matrix.get(user_id, [1,2,3])
    recommended_products = [products[i] for i in recommended_ids]
    return jsonify(recommended_products)

if __name__ == '__main__':
    app.run(debug=True)
