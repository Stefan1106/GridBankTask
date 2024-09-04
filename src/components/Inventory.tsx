import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./Inventory.css";

interface InventoryItem {
  id: string;
  type:
    | "computer equipment"
    | "furniture"
    | "communication equipment"
    | "machinery";
  description: string;
  added_at: Date;
  state: "in use" | "lost" | "deprecated" | "broken";
  last_updated_at: Date;
}

function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<
    Partial<Omit<InventoryItem, "id" | "added_at" | "last_updated_at">>
  >({
    type: "computer equipment",
    description: "",
    state: "in use",
  });
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<
    Partial<Omit<InventoryItem, "id" | "added_at" | "last_updated_at">>
  >({});

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("http://localhost:5000/inventory");
        if (response.ok) {
          const data = await response.json();
          const itemsWithDates = data.map((item: any) => ({
            ...item,
            added_at: new Date(item.added_at),
            last_updated_at: new Date(item.last_updated_at),
          }));
          setItems(itemsWithDates);
        }
      } catch (error) {
        console.error("Error fetching inventory items:", error);
      }
    };
    fetchItems();
  }, []);

  const handleAddItem = async () => {
    if (newItem.type && newItem.description && newItem.state) {
      try {
        const newItemData = {
          ...newItem,
          id: uuidv4(),
          added_at: new Date().toISOString(),
          last_updated_at: new Date().toISOString(),
        };
        const response = await fetch("http://localhost:5000/inventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItemData),
        });
        if (response.ok) {
          const addedItem = await response.json();
          setItems([
            ...items,
            {
              ...addedItem,
              added_at: new Date(addedItem.added_at),
              last_updated_at: new Date(addedItem.last_updated_at),
            },
          ]);
          setNewItem({
            type: "computer equipment",
            description: "",
            state: "in use",
          });
        } else {
          console.error("Failed to add item:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding inventory item:", error);
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/inventory/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error);
    }
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditItemId(item.id);
    setEditFields({
      type: item.type,
      description: item.description,
      state: item.state,
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/inventory/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editFields,
          last_updated_at: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        const updatedItem = await response.json();
        setItems(
          items.map((item) =>
            item.id === id
              ? {
                  ...updatedItem,
                  added_at: new Date(updatedItem.added_at),
                  last_updated_at: new Date(updatedItem.last_updated_at),
                }
              : item
          )
        );
        setEditItemId(null);
      }
    } catch (error) {
      console.error("Error updating inventory item:", error);
    }
  };

  const formatDateToMacedonianTime = (date: Date) => {
    return date.toLocaleString("en-GB", {
      timeZone: "Europe/Skopje",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="container">
      <h1>Inventory Management System</h1>

      <div>
        <h3>Add New Inventory Item</h3>
        <select
          value={newItem.type}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              type: e.target.value as InventoryItem["type"],
            })
          }
        >
          <option value="computer equipment">Computer Equipment</option>
          <option value="furniture">Furniture</option>
          <option value="communication equipment">
            Communication Equipment
          </option>
          <option value="machinery">Machinery</option>
        </select>
        <input
          type="text"
          placeholder="Description"
          value={newItem.description || ""}
          onChange={(e) =>
            setNewItem({ ...newItem, description: e.target.value })
          }
        />
        <select
          value={newItem.state}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              state: e.target.value as InventoryItem["state"],
            })
          }
        >
          <option value="in use">In Use</option>
          <option value="lost">Lost</option>
          <option value="deprecated">Deprecated</option>
          <option value="broken">Broken</option>
        </select>
        <button onClick={handleAddItem}>Add Item</button>
      </div>

      <h3>Inventory List</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Description</th>
            <th>Added At</th>
            <th>State</th>
            <th>Last Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                {editItemId === item.id ? (
                  <select
                    value={editFields.type}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        type: e.target.value as InventoryItem["type"],
                      })
                    }
                  >
                    <option value="computer equipment">
                      Computer Equipment
                    </option>
                    <option value="furniture">Furniture</option>
                    <option value="communication equipment">
                      Communication Equipment
                    </option>
                    <option value="machinery">Machinery</option>
                  </select>
                ) : (
                  item.type
                )}
              </td>
              <td>
                {editItemId === item.id ? (
                  <input
                    type="text"
                    value={editFields.description || ""}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        description: e.target.value,
                      })
                    }
                  />
                ) : (
                  item.description
                )}
              </td>
              <td>{formatDateToMacedonianTime(item.added_at)}</td>
              <td>
                {editItemId === item.id ? (
                  <select
                    value={editFields.state}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        state: e.target.value as InventoryItem["state"],
                      })
                    }
                  >
                    <option value="in use">In Use</option>
                    <option value="lost">Lost</option>
                    <option value="deprecated">Deprecated</option>
                    <option value="broken">Broken</option>
                  </select>
                ) : (
                  item.state
                )}
              </td>
              <td>{formatDateToMacedonianTime(item.last_updated_at)}</td>
              <td>
                {editItemId === item.id ? (
                  <button onClick={() => handleSaveEdit(item.id)}>Save</button>
                ) : (
                  <button onClick={() => handleEditClick(item)}>Edit</button>
                )}
                <button onClick={() => handleDeleteItem(item.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;
