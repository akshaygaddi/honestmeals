'use client'

// pages/addMenu.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AddMenu() {
    // State for form inputs
    const [menuItem, setMenuItem] = useState({
        name: '',
        category: 'meal', // Default category
        ingredients: [],
        price: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        description: '',
        image: '' // URL for image
    });

    // State for current ingredient being added
    const [currentIngredient, setCurrentIngredient] = useState('');

    // State for all menu items
    const [menuItems, setMenuItems] = useState([]);

    // State for UI
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'view'
    const [filter, setFilter] = useState('all'); // Filter for viewing menu items

    // Load menu items from localStorage on component mount
    useEffect(() => {
        const storedMenuItems = localStorage.getItem('healthyMenuItems');
        if (storedMenuItems) {
            setMenuItems(JSON.parse(storedMenuItems));
        }
    }, []);

    // Save menu items to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('healthyMenuItems', JSON.stringify(menuItems));
    }, [menuItems]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setMenuItem({
            ...menuItem,
            [name]: name === 'price' || name === 'calories' || name === 'protein' || name === 'carbs' || name === 'fats'
                ? parseFloat(value) || value
                : value
        });
    };

    // Add ingredient to the list
    const addIngredient = () => {
        if (currentIngredient.trim() !== '') {
            setMenuItem({
                ...menuItem,
                ingredients: [...menuItem.ingredients, currentIngredient.trim()]
            });
            setCurrentIngredient('');
        }
    };

    // Remove ingredient from the list
    const removeIngredient = (index) => {
        const updatedIngredients = [...menuItem.ingredients];
        updatedIngredients.splice(index, 1);
        setMenuItem({
            ...menuItem,
            ingredients: updatedIngredients
        });
    };

    // Submit form to add new menu item
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!menuItem.name || menuItem.ingredients.length === 0 || !menuItem.price) {
            alert('Please fill in at least the name, ingredients, and price!');
            return;
        }

        // Add new menu item with a unique ID
        const newItem = {
            ...menuItem,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        setMenuItems([...menuItems, newItem]);

        // Reset form
        setMenuItem({
            name: '',
            category: 'meal',
            ingredients: [],
            price: '',
            calories: '',
            protein: '',
            carbs: '',
            fats: '',
            description: '',
            image: ''
        });

        alert('Menu item added successfully!');
    };

    // Delete a menu item
    const deleteMenuItem = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            const updatedItems = menuItems.filter(item => item.id !== id);
            setMenuItems(updatedItems);
        }
    };

    // Filter menu items by category
    const filteredMenuItems = filter === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === filter);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
            <Head>
                <title>Add Menu Items | Health-Focused Brand</title>
                <meta name="description" content="Add and manage menu items for your health-focused brand" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" />
            </Head>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-green-800">Menu Management</h1>
                    <p className="text-lg text-gray-600 mt-2">Add and view your health-focused menu items</p>
                </div>

                {/* Tab navigation */}
                <div className="flex justify-center mb-8">
                    <nav className="flex rounded-lg overflow-hidden shadow-md">
                        <button
                            className={`px-6 py-3 font-medium ${activeTab === 'add' ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'}`}
                            onClick={() => setActiveTab('add')}
                        >
                            <i className="fas fa-plus mr-2"></i> Add New Item
                        </button>
                        <button
                            className={`px-6 py-3 font-medium ${activeTab === 'view' ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'}`}
                            onClick={() => setActiveTab('view')}
                        >
                            <i className="fas fa-eye mr-2"></i> View Menu
                        </button>
                    </nav>
                </div>

                {activeTab === 'add' ? (
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-semibold text-green-700 mb-6">Add New Menu Item</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left column */}
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-medium mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={menuItem.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="e.g., Quinoa Power Bowl"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-medium mb-2">Category</label>
                                        <select
                                            name="category"
                                            value={menuItem.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="meal">Meal Dish</option>
                                            <option value="smoothie">Smoothie</option>
                                            <option value="juice">Juice</option>
                                            <option value="snack">Snack</option>
                                            <option value="dessert">Healthy Dessert</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-medium mb-2">Price ($)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={menuItem.price}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="e.g., 12.99"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-medium mb-2">Image URL (optional)</label>
                                        <input
                                            type="text"
                                            name="image"
                                            value={menuItem.image}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-medium mb-2">Description (optional)</label>
                                        <textarea
                                            name="description"
                                            value={menuItem.description}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="A brief description of the dish..."
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Right column */}
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-medium mb-2">Ingredients</label>
                                        <div className="flex mb-2">
                                            <input
                                                type="text"
                                                value={currentIngredient}
                                                onChange={(e) => setCurrentIngredient(e.target.value)}
                                                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="Add an ingredient..."
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                                            />
                                            <button
                                                type="button"
                                                onClick={addIngredient}
                                                className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        <div className="mt-2 max-h-32 overflow-y-auto">
                                            {menuItem.ingredients.length > 0 ? (
                                                <ul className="bg-gray-50 rounded-md p-2">
                                                    {menuItem.ingredients.map((ingredient, index) => (
                                                        <li key={index} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                                                            <span>{ingredient}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeIngredient(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-400 text-sm italic">No ingredients added yet</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">Calories (kcal)</label>
                                            <input
                                                type="number"
                                                name="calories"
                                                value={menuItem.calories}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="e.g., 350"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">Protein (g)</label>
                                            <input
                                                type="number"
                                                name="protein"
                                                value={menuItem.protein}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.1"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="e.g., 15"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">Carbs (g)</label>
                                            <input
                                                type="number"
                                                name="carbs"
                                                value={menuItem.carbs}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.1"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="e.g., 45"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">Fats (g)</label>
                                            <input
                                                type="number"
                                                name="fats"
                                                value={menuItem.fats}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.1"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="e.g., 12"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    <i className="fas fa-plus-circle mr-2"></i>
                                    Add to Menu
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-green-700">Your Menu Items</h2>

                            <div className="inline-flex rounded-md shadow-sm">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('meal')}
                                    className={`px-4 py-2 text-sm font-medium ${filter === 'meal' ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'}`}
                                >
                                    Meals
                                </button>
                                <button
                                    onClick={() => setFilter('smoothie')}
                                    className={`px-4 py-2 text-sm font-medium ${filter === 'smoothie' ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'}`}
                                >
                                    Smoothies
                                </button>
                                <button
                                    onClick={() => setFilter('juice')}
                                    className={`px-4 py-2 text-sm font-medium ${filter === 'juice' ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'}`}
                                >
                                    Juices
                                </button>
                                <button
                                    onClick={() => setFilter('snack')}
                                    className={`px-4 py-2 text-sm font-medium ${filter === 'snack' ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'}`}
                                >
                                    Snacks
                                </button>
                                <button
                                    onClick={() => setFilter('dessert')}
                                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${filter === 'dessert' ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'}`}
                                >
                                    Desserts
                                </button>
                            </div>
                        </div>

                        {filteredMenuItems.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">
                                    <i className="fas fa-leaf"></i>
                                </div>
                                <h3 className="text-xl font-medium text-gray-700">No menu items found</h3>
                                <p className="text-gray-500 mt-2">
                                    {filter === 'all'
                                        ? "You haven't added any menu items yet."
                                        : `You haven't added any ${filter} items yet.`}
                                </p>
                                <button
                                    onClick={() => setActiveTab('add')}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                    <i className="fas fa-plus-circle mr-2"></i>
                                    Add Your First Item
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMenuItems.map((item) => (
                                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                        {item.image ? (
                                            <div className="h-48 overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://via.placeholder.com/300x150/e2f5ea/176b33?text=${encodeURIComponent(item.name)}`;
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-32 bg-gradient-to-r from-green-100 to-teal-100 flex items-center justify-center">
                                                {item.category === 'meal' && <i className="fas fa-utensils text-4xl text-green-600"></i>}
                                                {item.category === 'smoothie' && <i className="fas fa-blender text-4xl text-green-600"></i>}
                                                {item.category === 'juice' && <i className="fas fa-glass-citrus text-4xl text-green-600"></i>}
                                                {item.category === 'snack' && <i className="fas fa-apple-alt text-4xl text-green-600"></i>}
                                                {item.category === 'dessert' && <i className="fas fa-ice-cream text-4xl text-green-600"></i>}
                                            </div>
                                        )}

                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                                            </div>

                                            <div className="mb-4">
                        <span className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded-md capitalize">
                          {item.category}
                        </span>
                                            </div>

                                            {item.description && (
                                                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                                            )}

                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Ingredients:</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.ingredients.map((ingredient, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                                                        >
                              {ingredient}
                            </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-100 pt-4">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Nutrition Facts:</h4>
                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-sm font-medium">{item.calories || '0'}</div>
                                                        <div className="text-xs text-gray-500">kcal</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-sm font-medium">{item.protein || '0'}g</div>
                                                        <div className="text-xs text-gray-500">protein</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-sm font-medium">{item.carbs || '0'}g</div>
                                                        <div className="text-xs text-gray-500">carbs</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <div className="text-sm font-medium">{item.fats || '0'}g</div>
                                                        <div className="text-xs text-gray-500">fats</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => deleteMenuItem(item.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm flex items-center"
                                                >
                                                    <i className="fas fa-trash-alt mr-1"></i>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}