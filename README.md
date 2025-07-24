# 📊 Portfolio Summary App

A high-performance React + TypeScript web application that displays a large portfolio of assets with sorting, searching, and chart visualization. Optimized with pagination, debouncing, lazy loading, and Web Workers to handle 10,000+ assets smoothly.


## 🚀 Features

- ✅ Used **Debouncing** for Search across 10,000 assets  
- ✅ Paginated the asset table to render only 50 assets at a time, reducing **DOM Size**
- ✅ Memoized expensive **calculation, filtering, and sorting logic**
- ✅ Used **Web Workers** to offload chart data processing to a different thread, preventing UI lag during search


## 🛠️ Getting Started

### 1. Clone the Repository

``` bash
git clone https://github.com/AryanRajdev/Portfolio-Summary

```

### 2. Install Dependencies

``` bash

npm install

```
### 3. Start the Development Server

``` bash

npm run dev

```


## Optimizations

- ✅ Debounced Search Input to prevent performance drops
- ✅ Web Worker for heavy data transformations (e.g., top chart data)
- ✅ Pagination to reduce DOM load
- ✅ Lazy loading + memoization for smooth UX

