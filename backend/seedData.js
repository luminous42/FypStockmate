const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
const Category = require("./models/categoryModel");
const Product = require("./models/productModel");
require("dotenv").config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Delete existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create categories
    const categories = await Category.insertMany([
      {
        name: "Electronics",
        description: "Electronic devices and accessories",
        createdBy: {
          user: "000000000000000000000000", // Will be updated with admin ID
          name: "System",
        },
      },
      {
        name: "Food",
        description: "Food and beverages",
        createdBy: {
          user: "000000000000000000000000", // Will be updated with admin ID
          name: "System",
        },
      },
      {
        name: "Fashion",
        description: "Clothing and accessories",
        createdBy: {
          user: "000000000000000000000000", // Will be updated with admin ID
          name: "System",
        },
      },
      {
        name: "Accessories",
        description: "General accessories",
        createdBy: {
          user: "000000000000000000000000", // Will be updated with admin ID
          name: "System",
        },
      },
    ]);

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@stockmate.com",
      password: "Admin@123",
      role: "admin",
      phone: "+9779876543210",
      bio: "System administrator",
    });

    // Update category createdBy with admin ID
    await Category.updateMany(
      {},
      {
        $set: {
          "createdBy.user": adminUser._id,
          "createdBy.name": adminUser.name,
        },
      }
    );

    // Create employee user with access to all categories
    const employeeUser = await User.create({
      name: "Regular Employee",
      email: "employee@stockmate.com",
      password: "Employee@123",
      role: "employee",
      categories: categories.map((cat) => cat._id),
      phone: "+9771234567890",
      bio: "Regular employee with access to all products",
    });

    console.log("====================================");
    console.log("Database seeded successfully!");
    console.log("====================================");
    console.log("Admin User Created:");
    console.log("Email: admin@stockmate.com");
    console.log("Password: Admin@123");
    console.log("====================================");
    console.log("Employee User Created:");
    console.log("Email: employee@stockmate.com");
    console.log("Password: Employee@123");
    console.log("====================================");
    console.log(
      "Categories Created:",
      categories.map((cat) => cat.name).join(", ")
    );
    console.log("====================================");

    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
