from flask import Flask, request, jsonify
from datetime import datetime
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

inventory_items = []

def find_item(item_id):
    return next((item for item in inventory_items if item["id"] == item_id), None)

@app.route('/inventory', methods=['GET'])
def get_inventory():
    return jsonify(inventory_items)

@app.route('/inventory', methods=['POST'])
def add_inventory():
    new_item = request.json
    new_item['id'] = str(uuid.uuid4())
    new_item['added_at'] = datetime.utcnow().isoformat()
    new_item['last_updated_at'] = new_item['added_at']
    inventory_items.append(new_item)
    return jsonify(new_item), 201

@app.route('/inventory/<string:item_id>', methods=['PUT'])
def update_inventory(item_id):
    item = find_item(item_id)
    if item:
        item.update(request.json)
        item['last_updated_at'] = datetime.utcnow().isoformat()
        return jsonify(item)
    return jsonify({"error": "Item not found"}), 404

@app.route('/inventory/<string:item_id>', methods=['DELETE'])
def delete_inventory(item_id):
    global inventory_items
    inventory_items = [item for item in inventory_items if item["id"] != item_id]
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)
