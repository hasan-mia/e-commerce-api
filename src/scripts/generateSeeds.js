"use strict";

const { v4: uuidv4 } = require("uuid");
const {
  Category,
  Product,
  Hero,
  Order,
  OrderItem,
  Transaction,
  User,
} = require("../models");

const generateSeeds = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Get existing users (admin and regular user)
    const adminUser = await User.findOne({
      where: { email: "admin@gmail.com" },
    });
    const regularUser = await User.findOne({
      where: { email: "user@gmail.com" },
    });

    if (!adminUser || !regularUser) {
      throw new Error(
        "Admin and User must be created first! Run generateAdmin script."
      );
    }

    // 1. Create Categories
    console.log("📁 Creating categories...");
    const categoryData = [
      {
        id: uuidv4(),
        name: "Laptops",
        description: "High-performance laptops for every need",
        icon: "/modern-laptop-workspace.png",
      },
      {
        id: uuidv4(),
        name: "Smartphones",
        description: "Latest smartphones and mobile devices",
        icon: "/modern-smartphone.png",
      },
      {
        id: uuidv4(),
        name: "Tablets",
        description: "Portable tablets for productivity",
        icon: "/modern-tablet-display.png",
      },
      {
        id: uuidv4(),
        name: "Accessories",
        description: "Tech accessories and peripherals",
        icon: "/fashion-accessories-flatlay.png",
      },
    ];

    const categories = {};
    for (const catData of categoryData) {
      let category = await Category.findOne({
        where: { name: catData.name },
      });
      if (!category) {
        category = await Category.create(catData);
        console.log(`✓ Created category: ${catData.name}`);
      }
      categories[catData.name] = category;
    }

    // 2. Create Products
    console.log("\n📦 Creating products...");
    const productData = [
      {
        id: uuidv4(),
        name: 'MacBook Pro 14"',
        description:
          "Powerful laptop with M3 Pro chip, 16GB RAM, and stunning Retina display. Perfect for professionals and creators.",
        price: 1999,
        image: ["/macbook-pro.jpg", "/macbook-pro-2.jpg", "/macbook-pro-3.jpg"],
        category_id: categories["Laptops"].id,
        stock: 15,
        rating: 4.8,
        reviews: 234,
        status: "active",
      },
      {
        id: uuidv4(),
        name: "Dell XPS 13",
        description:
          "Ultra-compact and lightweight laptop with Intel Core i7, perfect for professionals on the go.",
        price: 1299,
        image: ["/dell-xps.jpg", "/dell-xps-2.jpg"],
        category_id: categories["Laptops"].id,
        stock: 8,
        rating: 4.6,
        reviews: 189,
        status: "active",
      },
      {
        id: uuidv4(),
        name: "iPhone 15 Pro",
        description:
          "Latest iPhone with titanium design, A17 Pro chip, and advanced camera system with 5x optical zoom.",
        price: 999,
        image: [
          "/iphone-15.jpg",
          "/iphone-15-2.jpg",
          "/iphone-15-3.jpg",
          "/iphone-15-4.jpg",
        ],
        category_id: categories["Smartphones"].id,
        stock: 25,
        rating: 4.9,
        reviews: 412,
        status: "active",
      },
      {
        id: uuidv4(),
        name: "Samsung Galaxy S24",
        description:
          "High-end Android smartphone with AI features, amazing display, and professional-grade cameras.",
        price: 899,
        image: [
          "/samsung-galaxy.jpg",
          "/samsung-galaxy-2.jpg",
          "/samsung-galaxy-3.jpg",
        ],
        category_id: categories["Smartphones"].id,
        stock: 18,
        rating: 4.7,
        reviews: 356,
        status: "active",
      },
      {
        id: uuidv4(),
        name: "iPad Air",
        description:
          "Versatile tablet for work and creativity with M1 chip, Apple Pencil support, and all-day battery.",
        price: 599,
        image: ["/ipad-air.jpg", "/ipad-air-2.jpg"],
        category_id: categories["Tablets"].id,
        stock: 12,
        rating: 4.7,
        reviews: 267,
        status: "active",
      },
      {
        id: uuidv4(),
        name: "Premium Wireless Headphones",
        description:
          "Studio-quality noise-canceling headphones with spatial audio and 30-hour battery life.",
        price: 299,
        image: [
          "/diverse-people-listening-headphones.png",
          "/headphones-2.jpg",
        ],
        category_id: categories["Accessories"].id,
        stock: 30,
        rating: 4.5,
        reviews: 178,
        status: "active",
      },
      {
        id: uuidv4(),
        name: "USB-C Hub Pro",
        description:
          "Multi-port USB-C adapter with HDMI, USB 3.0, SD card reader, and 100W power delivery.",
        price: 79,
        image: ["/usb-hub.png"],
        category_id: categories["Accessories"].id,
        stock: 50,
        rating: 4.4,
        reviews: 92,
        status: "active",
      },
      {
        id: uuidv4(),
        name: "Mechanical Gaming Keyboard",
        description:
          "RGB mechanical keyboard with hot-swappable switches, premium build quality, and programmable keys.",
        price: 149,
        image: [
          "/mechanical-keyboard.png",
          "/mechanical-keyboard-2.jpg",
          "/mechanical-keyboard-3.jpg",
        ],
        category_id: categories["Accessories"].id,
        stock: 20,
        rating: 4.6,
        reviews: 134,
        status: "active",
      },
    ];

    const products = {};
    for (const prodData of productData) {
      let product = await Product.findOne({
        where: { name: prodData.name },
      });
      if (!product) {
        product = await Product.create(prodData);
        console.log(`✓ Created product: ${prodData.name}`);
      }
      products[prodData.name] = product;
    }

    // 3. Create Hero Slides
    console.log("\n🎨 Creating hero slides...");
    const heroData = [
      {
        id: uuidv4(),
        title: 'MacBook Pro 14" M3',
        subtitle: "Supercharged for pros",
        description:
          "The most powerful MacBook Pro ever with M3 Pro chip. Experience unmatched performance.",
        image: "/macbook-pro.jpg",
        bg_color: "from-slate-900 to-slate-700",
        cta: "Shop Now",
        category_id: categories["Laptops"].id,
        product_id: products['MacBook Pro 14"'].id,
        price: "$1,999",
        badge: "New Arrival",
        order: 1,
        status: "active",
      },
      {
        id: uuidv4(),
        title: "iPhone 15 Pro Max",
        subtitle: "Titanium. So strong. So light. So Pro.",
        description:
          "Forged in titanium with the powerful A17 Pro chip and advanced camera system.",
        image: "/iphone-15.jpg",
        bg_color: "from-blue-900 to-blue-600",
        cta: "Discover More",
        category_id: categories["Smartphones"].id,
        product_id: products["iPhone 15 Pro"].id,
        price: "$999",
        badge: "Best Seller",
        order: 2,
        status: "active",
      },
      {
        id: uuidv4(),
        title: "Premium Audio Collection",
        subtitle: "Immerse yourself in sound",
        description:
          "Experience studio-quality sound with our premium noise-canceling headphones.",
        image: "/diverse-people-listening-headphones.png",
        bg_color: "from-purple-900 to-purple-600",
        cta: "Shop Audio",
        category_id: categories["Accessories"].id,
        product_id: products["Premium Wireless Headphones"].id,
        price: "From $299",
        badge: "Hot Deal",
        order: 3,
        status: "active",
      },
      {
        id: uuidv4(),
        title: "Galaxy S24 Ultra",
        subtitle: "Epic in every way",
        description:
          "The ultimate Android experience with AI-powered features and stunning display.",
        image: "/samsung-galaxy.jpg",
        bg_color: "from-emerald-900 to-emerald-600",
        cta: "Learn More",
        category_id: categories["Smartphones"].id,
        product_id: products["Samsung Galaxy S24"].id,
        price: "$899",
        badge: "Featured",
        order: 4,
        status: "active",
      },
    ];

    for (const heroSlide of heroData) {
      let hero = await Hero.findOne({ where: { title: heroSlide.title } });
      if (!hero) {
        hero = await Hero.create(heroSlide);
        console.log(`✓ Created hero slide: ${heroSlide.title}`);
      }
    }

    // 4. Create Orders with Items and Transactions
    console.log("\n🛒 Creating orders...");

    // Order 1 - Delivered order for regular user
    const order1Id = uuidv4();
    const order1 = await Order.findOne({
      where: { user_id: regularUser.id, status: "DELIVERED" },
    });

    if (!order1) {
      const newOrder1 = await Order.create({
        id: order1Id,
        user_id: regularUser.id,
        status: "DELIVERED",
        payment_method: "STRIPE",
        total_amount: 999,
        shipping_address: "123 Main St, New York, NY 10001",
        tracking_number:
          "TRK" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      });

      await OrderItem.create({
        id: uuidv4(),
        order_id: order1Id,
        product_id: products["iPhone 15 Pro"].id,
        quantity: 1,
        price: 999,
      });

      await Transaction.create({
        id: uuidv4(),
        order_id: order1Id,
        amount: 999,
        status: "COMPLETED",
        method: "STRIPE",
        transaction_id:
          "TXN" + Math.random().toString(36).substr(2, 12).toUpperCase(),
      });

      console.log("✓ Created order #1 (Delivered - iPhone 15 Pro)");
    }

    // Order 2 - Shipped order for regular user
    const order2Id = uuidv4();
    const order2 = await Order.findOne({
      where: { user_id: regularUser.id, status: "SHIPPED" },
    });

    if (!order2) {
      const newOrder2 = await Order.create({
        id: order2Id,
        user_id: regularUser.id,
        status: "SHIPPED",
        payment_method: "CASH_ON_DELIVERY",
        total_amount: 598,
        shipping_address: "123 Main St, New York, NY 10001",
        tracking_number:
          "TRK" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      });

      await OrderItem.create({
        id: uuidv4(),
        order_id: order2Id,
        product_id: products["Premium Wireless Headphones"].id,
        quantity: 2,
        price: 299,
      });

      await Transaction.create({
        id: uuidv4(),
        order_id: order2Id,
        amount: 598,
        status: "PENDING",
        method: "CASH_ON_DELIVERY",
      });

      console.log("✓ Created order #2 (Shipped - Premium Headphones x2)");
    }

    // Order 3 - Processing order for admin
    const order3Id = uuidv4();
    const order3 = await Order.findOne({
      where: { user_id: adminUser.id, status: "PROCESSING" },
    });

    if (!order3) {
      const newOrder3 = await Order.create({
        id: order3Id,
        user_id: adminUser.id,
        status: "PROCESSING",
        payment_method: "STRIPE",
        total_amount: 1999,
        shipping_address:
          "456 Admin Boulevard, Suite 100, San Francisco, CA 94102",
        tracking_number:
          "TRK" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      });

      await OrderItem.create({
        id: uuidv4(),
        order_id: order3Id,
        product_id: products['MacBook Pro 14"'].id,
        quantity: 1,
        price: 1999,
      });

      await Transaction.create({
        id: uuidv4(),
        order_id: order3Id,
        amount: 1999,
        status: "COMPLETED",
        method: "STRIPE",
        transaction_id:
          "TXN" + Math.random().toString(36).substr(2, 12).toUpperCase(),
      });

      console.log("✓ Created order #3 (Processing - MacBook Pro)");
    }

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Categories: ${Object.keys(categories).length}`);
    console.log(`   - Products: ${Object.keys(products).length}`);
    console.log(`   - Hero Slides: ${heroData.length}`);
    console.log(`   - Orders: 3 (with items and transactions)`);

    return {
      categories,
      products,
      message: "Seeding completed successfully",
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

module.exports = generateSeeds;
