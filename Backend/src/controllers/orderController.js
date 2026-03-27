const Order = require('../models/Order');
const User = require('../models/User');
const Clothes = require('../models/Clothes');
const { logActivity } = require('../utils/activityLogger');
const { sendNotification } = require('../utils/notificationHelper');

const createOrder = async (req, res) => {
  try {
    const { itemId, shippingAddress } = req.body;
    
    const item = await Clothes.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'available') return res.status(400).json({ message: 'Item is no longer available' });

    const order = await Order.create({
      buyer: req.userId,
      seller: item.seller,
      item: itemId,
      totalAmount: item.price,
      shippingAddress,
      paymentStatus: 'paid' // Simulated as paid for now
    });

    // Mark item as sold
    item.status = 'sold';
    await item.save();

    await logActivity(req.userId, `placed an order for: ${item.title}`, 'item', `Order ID: ${order._id}`, order._id);
    const buyer = await User.findById(req.userId);
    await sendNotification(item.seller, 'order', `${buyer.name} bought your item: ${item.title}`, req.userId, order._id);

    res.status(201).json({ data: order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
};

const getOrders = async (req, res) => {
  try {
    const { userRole, userId } = req;
    const query = userRole === 'admin' ? {} : { $or: [{ buyer: userId }, { seller: userId }] };
    
    const orders = await Order.find(query)
      .populate('buyer seller', 'name email')
      .populate('item', 'title images price')
      .sort({ createdAt: -1 });

    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only seller or admin can update status
    if (order.seller.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({ data: order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order' });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
