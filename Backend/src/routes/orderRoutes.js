const express = require('express');
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.use(auth);

router.post('/', createOrder);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
