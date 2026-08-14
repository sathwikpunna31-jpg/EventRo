import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryBrowse.css';

// We can define our main categories here
const categories = [
  { name: 'Tech', icon: '💻', link: '/events?category=Tech' },
  { name: 'Cultural', icon: '🎨', link: '/events?category=Cultural' },
  { name: 'Sports', icon: '🏅', link: '/events?category=Sports' },
  { name: 'Workshops', icon: '🛠️', link: '/events?category=Workshop' },
];

function CategoryBrowse() {
  return (
    <section className="category-browse-section">
      <div className="container">
        <h2 className="section-title">Browse by Category</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <Link to={category.link} key={category.name} className="category-card">
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryBrowse;