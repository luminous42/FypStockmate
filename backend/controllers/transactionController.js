const asyncHandler = require("express-async-handler");
const Transaction = require("../models/transactionModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// Create Transaction
const createTransaction = asyncHandler(async (req, res) => {
  const {
    products,
    customer,
    totalAmount,
    paymentMethod,
    paymentStatus,
    notes,
  } = req.body;

  // Validation
  if (
    !products ||
    products.length === 0 ||
    !customer ||
    !customer.name ||
    !totalAmount
  ) {
    res.status(400);
    throw new Error("Please provide products, customer name, and total amount");
  }

  // Create transaction
  const transaction = await Transaction.create({
    user: req.user.id,
    products,
    customer,
    totalAmount,
    paymentMethod: paymentMethod || "Cash",
    paymentStatus: paymentStatus || "Paid",
    notes,
    transactionDate: new Date(),
  });

  // Update product quantities
  for (const item of products) {
    const product = await Product.findById(item.product);
    if (product) {
      // Convert quantity strings to numbers for calculation
      const currentQuantity = parseInt(product.quantity);
      const soldQuantity = parseInt(item.quantity);

      if (!isNaN(currentQuantity) && !isNaN(soldQuantity)) {
        // Update product quantity
        product.quantity = (currentQuantity - soldQuantity).toString();
        await product.save();
      }
    }
  }

  res.status(201).json(transaction);
});

// Get All Transactions
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id })
    .sort("-createdAt")
    .populate("products.product");
  res.status(200).json(transactions);
});

// Get Single Transaction
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate(
    "products.product"
  );

  // If transaction doesn't exist
  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  // Match transaction to its user
  if (transaction.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  res.status(200).json(transaction);
});

// Get Transaction Statistics
const getTransactionStats = asyncHandler(async (req, res) => {
  // Get date range from query params or default to last 30 days
  const { startDate, endDate } = req.query;

  let dateFilter = {};

  if (startDate && endDate) {
    dateFilter = {
      transactionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
  } else {
    // Default to last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    dateFilter = {
      transactionDate: {
        $gte: thirtyDaysAgo,
      },
    };
  }

  // Get total sales amount
  const totalSales = await Transaction.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(req.user.id), ...dateFilter },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  // Get total number of transactions
  const totalTransactions = await Transaction.countDocuments({
    user: req.user.id,
    ...dateFilter,
  });

  // Get top selling products
  const topProducts = await Transaction.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(req.user.id), ...dateFilter },
    },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.product",
        name: { $first: "$products.name" },
        totalQuantity: { $sum: "$products.quantity" },
        totalRevenue: { $sum: "$products.totalPrice" },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
  ]);

  // Get sales by payment method
  const salesByPaymentMethod = await Transaction.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(req.user.id), ...dateFilter },
    },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  res.status(200).json({
    totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
    totalTransactions,
    topProducts,
    salesByPaymentMethod,
  });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  getTransactionStats,
};
