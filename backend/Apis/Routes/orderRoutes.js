const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifytoken');
const OrderController = require('../OrderControllers/OrderController');

router.post('/create-order', verifyToken, OrderController.createOrder);
router.get('/order-history', verifyToken, OrderController.getOrderHistory);
router.get('/frequent-customers', verifyToken, OrderController.getFrequentCustomers);
router.get('/frequent-customers/:customerName', verifyToken, OrderController.getFrequentCustomerDetails);

module.exports = router;
