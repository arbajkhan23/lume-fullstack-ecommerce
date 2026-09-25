const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Admin dashboard summary — revenue, orders, customers, products, recent activity
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRevenueAgg,
    totalOrders,
    todayOrders,
    totalCustomers,
    totalProducts,
    lowStockCount,
    pendingOrders,
    recentOrders,
    revenueByDay,
    ordersByStatus,
    topProducts,
  ] = await Promise.all([
    Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.countDocuments({}),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.countDocuments({}),
    Product.countDocuments({}),
    Product.countDocuments({ stock: { $lte: 5, $gt: 0 } }),
    Order.countDocuments({ status: 'Pending' }),
    Order.find({}).sort('-createdAt').limit(8).populate('user', 'firstName lastName email'),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', unitsSold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', unitsSold: 1, revenue: 1, image: { $arrayElemAt: ['$product.images.url', 0] } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      totalOrders,
      todayOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      pendingOrders,
      recentOrders,
      revenueByDay,
      ordersByStatus,
      topProducts,
    },
  });
});

module.exports = { getDashboardStats };
