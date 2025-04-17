"use client"
// pages/menu.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Menu() {
    // State for menu items
    const [menuItems, setMenuItems] = useState([]);

    // State for UI
    const [activeCategory, setActiveCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // Load menu items from localStorage on component mount
    useEffect(() => {
        const storedMenuItems = localStorage.getItem('healthyMenuItems');
        if (storedMenuItems) {
            setMenuItems(JSON.parse(storedMenuItems));
        }
        setIsLoading(false);
    }, []);

    // Group menu items by category for the sidebar
    const categories = [
        { id: 'all', name: 'All Items', icon: 'fa-th-large' },
        { id: 'meal', name: 'Meals', icon: 'fa-utensils' },
        { id: 'smoothie', name: 'Smoothies', icon: 'fa-blender' },
        { id: 'juice', name: 'Juices', icon: 'fa-glass-citrus' },
        { id: 'snack', name: 'Snacks', icon: 'fa-apple-alt' },
        { id: 'dessert', name: 'Desserts', icon: 'fa-ice-cream' }
    ];

    // Filter menu items by category
    const filteredItems = activeCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);

    // Function to get category icon
    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.icon : 'fa-th-large';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
            <Head>
                <title>Menu | Health-Focused Brand</title>
                <meta name="description" content="Explore our healthy menu options" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" />
            </Head>

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="text-center mb-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-green-800">Our Menu</h1>
                        <p className="text-lg text-gray-600 mt-2">Nourish your body with our nutrient-rich options</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <Link href="/addMenu" className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors">
                            <i className="fas fa-edit mr-2"></i>
                            Manage Menu
                        </Link>
                    </div>
                </header>

                {/* Main content */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar for categories */}
                    <aside className="w-full md:w-64 bg-white rounded-xl shadow-md p-4 h-fit">
                        <h2 className="text-xl font-bold text-green-700 mb-4">Categories</h2>
                        <nav>
                            <ul>
                                {categories.map((category) => (
                                    <li key={category.id} className="mb-1">
                                        <button
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                                                activeCategory === category.id
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                            onClick={() => setActiveCategory(category.id)}
                                        >
                                            <i className={`fas ${category.icon} w-6`}></i>
                                            <span className="ml-2">{category.name}</span>
                                            {activeCategory === category.id && (
                                                <i className="fas fa-chevron-right ml-auto"></i>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className="mt-8 p-4 bg-green-50 rounded-lg">
                            <h3 className="font-bold text-green-800 mb-2">Nutrition Key</h3>
                            <div className="text-sm">
                                <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span>Low Calorie</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <span>High Protein</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                                    <span>Low Carb</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main menu display */}
                    <main className="flex-1">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                            </div>
                        ) : menuItems.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                                <div className="text-green-500 text-6xl mb-4">
                                    <i className="fas fa-leaf"></i>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Menu Items Yet</h2>
                                <p className="text-gray-600 mb-6">Start creating your health-focused menu to see items here.</p>
                                <Link href="/addMenu" className="inline-flex items-center px-5 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors">
                                    <i className="fas fa-plus-circle mr-2"></i>
                                    Create Menu Items
                                </Link>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                                <div className="text-yellow-500 text-6xl mb-4">
                                    <i className="fas fa-exclamation-circle"></i>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Items in This Category</h2>
                                <p className="text-gray-600 mb-6">Try selecting a different category or add new items.</p>
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={() => setActiveCategory('all')}
                                        className="px-5 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        View All Items
                                    </button>
                                    <Link href="/addMenu" className="inline-flex items-center px-5 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors">
                                        <i className="fas fa-plus-circle mr-2"></i>
                                        Add New Item
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-green-800">
                                        {activeCategory === 'all' ? 'All Menu Items' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}s`}
                                    </h2>
                                    <span className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                    {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredItems.map((item) => {
                                        // Calculate nutrition badges
                                        const isLowCalorie = item.calories && item.calories < 300;
                                        const isHighProtein = item.protein && item.protein > 15;
                                        const isLowCarb = item.carbs && item.carbs < 20;

                                        return (
                                            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                                {item.image ? (
                                                    <div className="h-48 overflow-hidden">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = `https://via.placeholder.com/400x200/e2f5ea/176b33?text=${encodeURIComponent(item.name)}`;
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-48 bg-gradient-to-r from-green-100 to-teal-100 flex items-center justify-center">
                                                        <i className={`fas ${getCategoryIcon(item.category)} text-5xl text-green-600`}></i>
                                                    </div>
                                                )}

                                                <div className="p-5">
                                                    <div className="flex flex-wrap justify-between items-start mb-2">
                                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                                                        <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                              ${parseFloat(item.price).toFixed(2)}
                            </span>
                                                    </div>

                                                    <div className="mb-3 flex gap-1">
                                                        {isLowCalorie && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                Low Cal
                              </span>
                                                        )}
                                                        {isHighProtein && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                High Protein
                              </span>
                                                        )}
                                                        {isLowCarb && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                                Low Carb
                              </span>
                                                        )}
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

                                                    <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center">
                                                        <i className="fas fa-shopping-cart mr-2"></i>
                                                        Add to Order
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}