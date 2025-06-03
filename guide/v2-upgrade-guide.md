# HonestMeals v2 Upgrade Guide

This comprehensive guide provides step-by-step instructions for upgrading the HonestMeals application to v2. Follow each phase sequentially to ensure a smooth transition.

## Table of Contents

- [Phase 1: Code Architecture & Structure](#phase-1-code-architecture--structure)
- [Phase 2: Performance Optimization](#phase-2-performance-optimization)
- [Phase 3: Security Enhancements](#phase-3-security-enhancements)
- [Phase 4: User Experience Improvements](#phase-4-user-experience-improvements)
- [Phase 5: Technical Debt Reduction](#phase-5-technical-debt-reduction)
- [Implementation Timeline](#implementation-timeline)

## Phase 1: Code Architecture & Structure

### Step 1: Implement Clear Component Separation

**Objective**: Separate server and client components for better code organization.

1. Identify server components and rename with `.server.tsx` suffix
2. Extract client-side logic to separate components
3. Implement consistent data fetching pattern:

```tsx
// Server component (MealPage.server.tsx)
import { fetchMeals } from '@/lib/data';
import MealClient from './MealClient';

export default async function MealPage() {
  const meals = await fetchMeals();
  return <MealClient initialData={meals} />;
}

// Client component (MealClient.tsx)
'use client';

import { useState, useEffect } from 'react';

export default function MealClient({ initialData }) {
  const [meals, setMeals] = useState(initialData);
  // Client-side logic here
  return (
    // JSX here
  );
}
```

4. Apply this pattern across:
   - Meal browsing pages
   - User profile components
   - Admin dashboard sections

### Step 2: Centralize Authentication Logic

**Objective**: Create a single source of truth for authentication.

1. Create an authentication hook:

```tsx
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          setIsAdmin(profile?.role === 'admin');
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  return {
    user,
    isAdmin,
    isLoading,
    signIn: async (email, password) => await supabase.auth.signInWithPassword({ email, password }),
    signUp: async (email, password, metadata) => await supabase.auth.signUp({ email, password, options: { data: metadata } }),
    signOut: async () => await supabase.auth.signOut()
  };
}
```

2. Replace all direct Supabase auth calls with this hook
3. Remove duplicated auth logic from components

### Step 3: Implement Context for Global State

**Objective**: Eliminate prop drilling for frequently used data.

1. Create auth context:

```tsx
// store/AuthContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
```

2. Create cart context:

```tsx
// store/CartContext.tsx
'use client';

import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const initialState = {
  items: [],
  total: 0
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      // Logic to add item
      return newState;
    case 'REMOVE_ITEM':
      // Logic to remove item
      return newState;
    // Other cases
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  
  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
```

3. Add providers to layout:

```tsx
// app/layout.tsx
import { AuthProvider } from '@/store/AuthContext';
import { CartProvider } from '@/store/CartContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 4: Standardize Form Handling

**Objective**: Create consistent, type-safe form implementation.

1. Install dependencies:

```bash
npm install react-hook-form zod @hookform/resolvers
```

2. Create form wrapper component:

```tsx
// components/form-wrapper.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export function FormWrapper({ 
  schema, 
  defaultValues, 
  onSubmit, 
  children 
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {typeof children === 'function' ? children(form) : children}
    </form>
  );
}
```

3. Create form schemas:

```tsx
// schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});
```

4. Refactor forms:

```tsx
// app/(auth-pages)/sign-in/page.tsx
'use client';

import { FormWrapper } from '@/components/form-wrapper';
import { loginSchema } from '@/schemas/auth';
import { signInAction } from '@/app/actions';

export default function SignInPage() {
  const defaultValues = {
    email: '',
    password: ''
  };
  
  return (
    <FormWrapper
      schema={loginSchema}
      defaultValues={defaultValues}
      onSubmit={async (values) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          formData.append(key, value);
        });
        await signInAction(formData);
      }}
    >
      {({ register, formState }) => (
        <>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" {...register('email')} />
            {formState.errors.email && (
              <p className="text-red-500">{formState.errors.email.message}</p>
            )}
          </div>
          {/* Other fields */}
          <button type="submit">Sign In</button>
        </>
      )}
    </FormWrapper>
  );
}
```

5. Apply this pattern to all forms

## Phase 2: Performance Optimization

### Step 5: Break Down Large Components

**Objective**: Improve maintainability and reduce render costs.

1. Split the main page into sections:

```
components/
  home/
    hero-section.tsx
    about-section.tsx
    meal-options-section.tsx
    testimonials-section.tsx
```

2. Refactor main page:

```tsx
// app/page.tsx
import HeroSection from '@/components/home/hero-section';
import AboutSection from '@/components/home/about-section';
import MealOptionsSection from '@/components/home/meal-options-section';
import TestimonialsSection from '@/components/home/testimonials-section';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <MealOptionsSection />
      <TestimonialsSection />
    </div>
  );
}
```

3. Extract complex logic from admin pages into component files

### Step 6: Optimize Images

**Objective**: Reduce layout shifts and improve loading performance.

1. Update all Image components:

```tsx
// Before
<Image src={mainLogo} alt="Honest Meals Logo" />

// After
<Image 
  src={mainLogo} 
  alt="Honest Meals Logo" 
  width={200} 
  height={80} 
  priority={isHero} 
/>
```

2. Add responsive image handling:

```tsx
<Image
  src={mealImage}
  alt={mealName}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover"
/>
```

3. Create responsive image component:

```tsx
// components/responsive-image.tsx
import Image from 'next/image';

export function ResponsiveImage({ 
  src, 
  alt, 
  className,
  ...props 
}) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        {...props}
      />
    </div>
  );
}
```

### Step 7: Move API Calls to Server Components

**Objective**: Reduce client-side network requests.

1. Identify components making client-side API calls
2. Convert to server component pattern:

```tsx
// Before (client component)
'use client';

function MealsPage() {
  const [meals, setMeals] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('meals').select('*');
      setMeals(data);
    }
    fetchData();
  }, []);
  
  return <MealList meals={meals} />;
}

// After (server component)
import { createClient } from '@/utils/supabase/server';

async function MealsPage() {
  const supabase = createClient();
  const { data: meals } = await supabase.from('meals').select('*');
  
  return <MealListClient initialMeals={meals} />;
}
```

3. Create corresponding client components for interactive features

### Step 8: Optimize Renders

**Objective**: Reduce unnecessary re-renders.

1. Apply React.memo to pure components:

```tsx
const MealCard = React.memo(function MealCard({ meal }) {
  return (
    <div className="meal-card">
      {/* Card content */}
    </div>
  );
});
```

2. Fix useEffect dependencies:

```tsx
// Before
useEffect(() => {
  // Effect that uses filteredMeals but doesn't list it as dependency
}, []);

// After
useEffect(() => {
  // Effect logic
}, [filteredMeals]);
```

3. Use useMemo for expensive calculations:

```tsx
const filteredMeals = useMemo(() => {
  return meals.filter(meal => 
    meal.calories <= calorieLimit && 
    meal.type === dietType
  );
}, [meals, calorieLimit, dietType]);
```

4. Use useCallback for event handlers:

```tsx
const handleAddToCart = useCallback((mealId) => {
  // Add to cart logic
}, [/* dependencies */]);
```

## Phase 3: Security Enhancements

### Step 9: Improve Form Validation

**Objective**: Ensure data integrity and prevent security issues.

1. Enhance Zod schemas with stricter validation:

```tsx
// schemas/auth.ts
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
});
```

2. Update server actions to use schema validation:

```tsx
// app/actions.ts
import { loginSchema } from '@/schemas/auth';

export async function signInAction(formData: FormData) {
  // Parse form data into object
  const data = {
    email: formData.get('email'),
    password: formData.get('password')
  };
  
  // Validate with schema
  const result = loginSchema.safeParse(data);
  
  if (!result.success) {
    const errorMessage = result.error.errors.map(e => e.message).join(', ');
    return encodedRedirect("error", "/sign-in", errorMessage);
  }
  
  // Proceed with validated data
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password
  });
  
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }
  
  return redirect("/");
}
```

3. Apply to all form submissions

### Step 10: Implement Consistent Role Checking

**Objective**: Establish a single source of truth for authorization.

1. Create authorization utility:

```tsx
// utils/authorization.ts
import { createClient } from '@/utils/supabase/server';

export async function getUserRole(userId: string) {
  if (!userId) return null;
  
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error || !data) return null;
  return data.role;
}

export async function checkIsAdmin(userId: string) {
  const role = await getUserRole(userId);
  return role === 'admin';
}

export async function requireAdmin(userId: string) {
  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
}
```

2. Use in middleware:

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import { getUserRole } from '@/utils/authorization';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const user = response.data?.user;
  
  // Check admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return response;
}
```

3. Apply to all protected routes and components

### Step 11: Secure API Routes

**Objective**: Ensure all API endpoints enforce proper authentication.

1. Create API middleware utility:

```tsx
// utils/api-auth.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function validateApiRequest(requireAdmin = false) {
  const cookieStore = cookies();
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      authenticated: false,
      user: null,
      error: 'Unauthorized'
    };
  }
  
  if (requireAdmin) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!data || data.role !== 'admin') {
      return {
        authenticated: true,
        user,
        error: 'Admin access required'
      };
    }
  }
  
  return {
    authenticated: true,
    user,
    error: null
  };
}
```

2. Implement in API routes:

```tsx
// app/api/meals/route.ts
import { validateApiRequest } from '@/utils/api-auth';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { authenticated, error } = await validateApiRequest();
  
  if (!authenticated) {
    return new Response(JSON.stringify({ error }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const supabase = createClient();
  const { data, error: dbError } = await supabase.from('meals').select('*');
  
  if (dbError) {
    return new Response(JSON.stringify({ error: dbError.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ data }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request: Request) {
  const { authenticated, error } = await validateApiRequest(true); // Require admin
  
  if (!authenticated || error) {
    return new Response(JSON.stringify({ error: error || 'Unauthorized' }), { 
      status: error ? 403 : 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Process the request...
}
```

## Phase 4: User Experience Improvements

### Step 12: Implement Error Boundaries

**Objective**: Gracefully handle runtime errors.

1. Create error boundary component:

```tsx
// components/error-boundary.tsx
'use client';

import { Component } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-6 rounded-lg bg-red-50 border border-red-100">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline" 
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

2. Create page-level error component:

```tsx
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex justify-end">
          <Button
            onClick={reset}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
```

3. Wrap key sections:

```tsx
// app/meals/page.tsx
import { ErrorBoundary } from '@/components/error-boundary';
import MealGrid from '@/components/meal-grid';

export default function MealsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Meals</h1>
      <ErrorBoundary>
        <MealGrid />
      </ErrorBoundary>
    </div>
  );
}
```

### Step 13: Add Skeleton Loaders

**Objective**: Improve perceived performance with skeleton UI.

1. Create skeleton components:

```tsx
// components/skeletons/meal-card-skeleton.tsx
export function MealCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}
```

2. Create grid skeleton:

```tsx
// components/skeletons/meal-grid-skeleton.tsx
import { MealCardSkeleton } from './meal-card-skeleton';

export function MealGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(count).fill(0).map((_, i) => (
        <MealCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

3. Implement in pages:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { MealGrid } from '@/components/meal-grid';
import { MealGridSkeleton } from '@/components/skeletons/meal-grid-skeleton';

export default function MealClientWrapper({ initialMeals }) {
  const [isLoading, setIsLoading] = useState(!initialMeals);
  const [meals, setMeals] = useState(initialMeals || []);
  
  // Fetch meals if needed
  
  return (
    <>
      {isLoading ? (
        <MealGridSkeleton />
      ) : (
        <MealGrid meals={meals} />
      )}
    </>
  );
}
```

### Step 14: Improve Accessibility

**Objective**: Make the application usable for all users.

1. Add proper ARIA attributes:

```tsx
// components/meal-card.tsx
export function MealCard({ meal, onAddToCart, isFavorite, onToggleFavorite }) {
  return (
    <div 
      className="meal-card"
      role="article"
      aria-labelledby={`meal-title-${meal.id}`}
    >
      <h3 id={`meal-title-${meal.id}`}>{meal.title}</h3>
      
      <button
        onClick={() => onAddToCart(meal.id)}
        aria-label={`Add ${meal.title} to cart`}
        className="add-to-cart-button"
      >
        Add to Cart
      </button>
      
      <button
        onClick={() => onToggleFavorite(meal.id)}
        aria-label={isFavorite ? `Remove ${meal.title} from favorites` : `Add ${meal.title} to favorites`}
        aria-pressed={isFavorite}
        className="favorite-button"
      >
        <Heart filled={isFavorite} />
      </button>
    </div>
  );
}
```

2. Implement keyboard navigation:

```tsx
// components/meal-option-card.tsx
export function MealOptionCard({ option, isSelected, onSelect }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(option);
    }
  }
  
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(option)}
      onKeyDown={handleKeyDown}
      className={`meal-option ${isSelected ? 'selected' : ''}`}
    >
      {option.title}
    </div>
  );
}
```

3. Add focus management:

```tsx
// components/modal.tsx
import { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, title, children }) {
  const closeButtonRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      
      // Trap focus inside modal
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          // Focus trap logic
        }
      };
      
      window.addEventListener('keydown', handleTabKey);
      return () => window.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="modal-overlay"
    >
      <div className="modal">
        <h2 id="modal-title">{title}</h2>
        <button
          ref={closeButtonRef}
          aria-label="Close modal"
          onClick={onClose}
          className="close-button"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
```

### Step 15: Enhance Mobile Responsiveness

**Objective**: Ensure perfect experience across all devices.

1. Implement mobile-first approach:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Grid items */}
</div>
```

2. Add responsive navigation:

```tsx
// components/mobile-menu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function MobileMenu({ items }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="md:hidden">
      <button
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2"
      >
        {isOpen ? <X /> : <Menu />}
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50 p-4">
          <div className="flex justify-end">
            <button
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
              className="p-2"
            >
              <X />
            </button>
          </div>
          
          <nav className="flex flex-col space-y-4 mt-8">
            {items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-xl py-2 border-b border-gray-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
```

## Phase 5: Technical Debt Reduction

### Step 16: Strengthen TypeScript Implementation

**Objective**: Improve type safety throughout the application.

1. Create comprehensive type definitions:

```tsx
// types/index.ts
export type UserRole = 'user' | 'admin' | 'trainer' | 'influencer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface Meal {
  id: string;
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  imageUrl: string;
  category: string[];
  tags: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isAvailable: boolean;
}

export interface CartItem {
  id: string;
  mealId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'canceled';
  createdAt: string;
  updatedAt: string;
}
```

2. Apply types throughout the application:

```tsx
// Before
function MealCard({ meal }) {
  // ...
}

// After
function MealCard({ meal }: { meal: Meal }) {
  // ...
}
```

### Step 17: Add Automated Testing

**Objective**: Ensure code quality and prevent regressions.

1. Set up Jest and React Testing Library:

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

2. Configure Jest:

```js
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

3. Create Jest setup file:

```js
// jest.setup.js
import '@testing-library/jest-dom';
```

4. Add tests for critical components:

```tsx
// components/meal-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MealCard } from './meal-card';

const mockMeal = {
  id: '1',
  title: 'Test Meal',
  description: 'A delicious test meal',
  calories: 500,
  protein: 30,
  carbs: 40,
  fat: 20,
  price: 9.99,
  imageUrl: '/test-meal.jpg',
  category: ['Lunch'],
  tags: ['Healthy', 'Quick'],
  isVegetarian: true,
  isVegan: false,
  isGlutenFree: true,
  isDairyFree: false,
  isAvailable: true,
};

describe('MealCard', () => {
  test('renders meal information correctly', () => {
    render(<MealCard meal={mockMeal} />);
    
    expect(screen.getByText('Test Meal')).toBeInTheDocument();
    expect(screen.getByText('A delicious test meal')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });
  
  test('calls onAddToCart when add to cart button is clicked', () => {
    const mockAddToCart = jest.fn();
    render(<MealCard meal={mockMeal} onAddToCart={mockAddToCart} />);
    
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    
    expect(mockAddToCart).toHaveBeenCalledWith('1');
  });
});
```

### Step 18: Normalize Database Schema

**Objective**: Improve database structure and performance.

1. Create migrations for schema changes:

```sql
-- Example migration
CREATE TABLE meal_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL,
  unit VARCHAR(20) NOT NULL,
  UNIQUE(meal_id, ingredient_id)
);

-- Create meal tags table
CREATE TABLE meal_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(meal_id, tag_id)
);

-- Add proper indexes
CREATE INDEX idx_meal_ingredients_meal_id ON meal_ingredients (meal_id);
CREATE INDEX idx_meal_ingredients_ingredient_id ON meal_ingredients (ingredient_id);
CREATE INDEX idx_meal_tags_meal_id ON meal_tags (meal_id);
CREATE INDEX idx_meal_tags_tag_id ON meal_tags (tag_id);
```

2. Update data access functions to use the new schema

### Step 19: Implement Environment Variable Validation

**Objective**: Ensure all required environment variables are present and valid.

1. Create environment variable schema:

```tsx
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  SITE_URL: z.string().url().optional().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);
```

2. Use validated environment variables throughout the application:

```tsx
// Before
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// After
import { env } from '@/lib/env';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

### Step 20: Standardize Naming Conventions

**Objective**: Establish consistent naming patterns throughout the codebase.

1. Adopt consistent file naming:
   - React components: PascalCase.tsx
   - Utility functions: kebab-case.ts
   - Type definitions: pascal-case.types.ts
   - Context files: kebab-case-context.tsx

2. Follow consistent component naming:
   - Components: PascalCase (e.g., MealCard)
   - Hooks: camelCase prefixed with "use" (e.g., useAuth)
   - Context Hooks: camelCase prefixed with "use" (e.g., useCart)

3. Standardize folder structure:
   - Components by feature area (e.g., auth, meals, admin)
   - Shared components in components/ui
   - Page-specific components co-located with pages

## Implementation Timeline

### Week 1-2: Architecture Improvements
- Separate server and client components
- Centralize authentication logic
- Implement global state context
- Standardize form handling

### Week 3-4: Performance Optimization
- Break down large components
- Optimize images
- Move API calls to server components
- Optimize renders

### Week 5-6: Security Enhancements
- Improve form validation
- Implement consistent role checking
- Secure API routes

### Week 7-8: User Experience Improvements
- Implement error boundaries
- Add skeleton loaders
- Improve accessibility
- Enhance mobile responsiveness

### Week 9-10: Technical Debt Reduction
- Strengthen TypeScript implementation
- Add automated testing
- Normalize database schema
- Implement environment variable validation
- Standardize naming conventions

### Final Steps
- Run comprehensive testing
- Deploy to staging environment
- Gather feedback and make adjustments
- Deploy to production
