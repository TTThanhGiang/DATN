import { useState } from 'react'
import Header from "./components/Header";
import Footer from "./components/Footer";
import Banner from './components/Banner'; 
import CategorySection from './components/Category';
import "./css/vendor.css";
import "./css/normalize.css";
function App() {
  return (
    <div>
      <Header />
      <Banner />
      <CategorySection />
      <main style={{ padding: "20px", minHeight: "70vh" }}>
        <h2>Welcome to my React website 🚀</h2>
        <p>Đây là nội dung chính của trang web.</p>
      </main>
      <Footer />
    </div>
  )
}

export default App
