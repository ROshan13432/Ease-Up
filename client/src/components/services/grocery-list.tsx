import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface GroceryListProps {
  items: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (index: number) => void;
  onUpdateItems: (items: string[]) => void;
}

export default function GroceryList({ 
  items, 
  onAddItem, 
  onRemoveItem, 
  onUpdateItems 
}: GroceryListProps) {
  const [newItem, setNewItem] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const commonGroceryItems = [
    "Milk", "Bread", "Eggs", "Cheese", "Chicken", "Apples", 
    "Bananas", "Potatoes", "Rice", "Pasta", "Cereal", "Yogurt"
  ];

  const handleAddItem = () => {
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleAddCommonItem = (item: string) => {
    // Only add if it's not already in the list
    if (!items.map(i => i.toLowerCase()).includes(item.toLowerCase())) {
      onAddItem(item);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleRemoveSelected = () => {
    // Sort indexes in descending order to avoid shifting issues when removing
    const sortedIndexes = [...selectedItems].sort((a, b) => b - a);
    
    // Create a new array without the selected items
    const newItems = [...items];
    sortedIndexes.forEach(index => {
      newItems.splice(index, 1);
    });
    
    // Update the parent component
    onUpdateItems(newItems);
    setSelectedItems([]);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">My Grocery List</h3>
      
      {/* Add new item */}
      <div className="flex space-x-2">
        <Input
          placeholder="Add item to list..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-base"
        />
        <Button 
          onClick={handleAddItem}
          className="shrink-0 bg-[#0A5E44] hover:bg-[#084835]"
        >
          Add
        </Button>
      </div>
      
      {/* Quick add common items */}
      <div className="mt-2">
        <p className="text-sm text-gray-600 mb-2">Quick add common items:</p>
        <div className="flex flex-wrap gap-2">
          {commonGroceryItems.map((item) => (
            <Button
              key={item}
              variant="outline"
              size="sm"
              onClick={() => handleAddCommonItem(item)}
              className="text-sm border-[#0A5E44] text-[#0A5E44]"
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      
      {/* List of items */}
      <div className="border rounded-lg overflow-hidden mt-4">
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Your grocery list is empty. Add items above.
          </div>
        ) : (
          <>
            <div className="max-h-64 overflow-y-auto">
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center p-3 border-b last:border-b-0 ${
                    selectedItems.includes(index) ? "bg-gray-100" : ""
                  }`}
                >
                  <Checkbox 
                    checked={selectedItems.includes(index)} 
                    onCheckedChange={() => toggleSelect(index)}
                    className="mr-3"
                  />
                  <span className="flex-grow text-base">{item}</span>
                  <button 
                    onClick={() => onRemoveItem(index)}
                    className="text-gray-500 hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
              ))}
            </div>
            
            {/* Action buttons for list */}
            <div className="border-t p-3 bg-gray-50 flex justify-between">
              <span className="text-sm text-gray-700">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              {selectedItems.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleRemoveSelected}
                  className="text-sm"
                >
                  Remove Selected ({selectedItems.length})
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}