const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");

const path = require("path");
console.log(
  "Looking for fileUpload at:",
  path.join(__dirname, "../utils/fileUpload.js")
);
console.log(
  "Exists:",
  require("fs").existsSync(path.join(__dirname, "../utils/fileUpload.js"))
);

const { fileSizeFormatter } = require("../utils/fileUpload");

const cloudinary = require("cloudinary").v2;

// Create Prouct
const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description, expiryDate } =
    req.body;

  //   Validation
  if (
    !name ||
    !category ||
    !quantity ||
    !price ||
    !description ||
    !expiryDate
  ) {
    res.status(400);
    throw new Error("Please fill in all fields including expiry date");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Pinvent App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Create Product
  const product = await Product.create({
    user: req.user.id,
    name,
    sku,
    category,
    quantity,
    price,
    description,
    expiryDate,
    image: fileData,
    createdBy: {
      user: req.user.id,
      name: req.user.name,
    },
  });

  res.status(201).json(product);
});

// Get all Products
const getProducts = asyncHandler(async (req, res) => {
  let filter = { isDeleted: { $ne: true } }; // Don't show deleted products

  // If admin, can see all products
  if (req.user.role === "admin") {
    // No additional filter
  } else {
    // For non-admin, only show products they have access to
    if (req.user.categories && req.user.categories.length > 0) {
      filter.category = { $in: req.user.categories };
    } else {
      // If user has no categories, return empty array
      return res.status(200).json([]);
    }
  }

  const products = await Product.find(filter).sort("-createdAt");
  res.status(200).json(products);
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: { $ne: true },
  });

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if user has access to this product's category
  if (req.user.role !== "admin") {
    if (
      !req.user.categories ||
      !req.user.categories.includes(product.category)
    ) {
      res.status(403);
      throw new Error("You don't have permission to view this product");
    }
  }

  res.status(200).json(product);
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check authorization based on user role and category
  if (req.user.role !== "admin") {
    // For non-admin users, check if they have access to this category
    if (
      !req.user.categories ||
      !req.user.categories.includes(product.category)
    ) {
      res.status(403);
      throw new Error("You don't have permission to delete this product");
    }
  }

  // Soft delete the product
  product.isDeleted = true;
  product.deletedBy = {
    user: req.user.id,
    name: req.user.name,
    date: new Date(),
  };

  await product.save();
  res.status(200).json({ message: "Product deleted." });
});

// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, quantity, price, description, expiryDate } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check authorization based on user role and category
  if (req.user.role !== "admin") {
    // For non-admin users, check if they have access to this category
    if (
      !req.user.categories ||
      !req.user.categories.includes(product.category)
    ) {
      res.status(403);
      throw new Error("You don't have permission to update this product");
    }

    // Additionally, check if they have access to the new category if it's being changed
    if (
      category &&
      category !== product.category &&
      (!req.user.categories || !req.user.categories.includes(category))
    ) {
      res.status(403);
      throw new Error("You don't have permission to change to this category");
    }
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Pinvent App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Add edit information
  const editInfo = {
    user: req.user.id,
    name: req.user.name,
    date: new Date(),
  };

  // Create update object
  const updateData = {
    name,
    category,
    quantity,
    price,
    description,
    image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    $push: { editedBy: editInfo },
  };

  // Only update expiryDate if it's provided
  if (expiryDate) {
    updateData.expiryDate = new Date(expiryDate);
  }

  // Update Product
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedProduct);
});

// Get expiring products
const getExpiringProducts = asyncHandler(async (req, res) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const products = await Product.find({
    user: req.user.id,
    expiryDate: { $gte: today, $lte: thirtyDaysFromNow },
  });

  res.status(200).json(products);
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  getExpiringProducts,
};
