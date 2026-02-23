const Razorpay = require('razorpay');
const crypto = require('crypto'); // We'll need this later for verification

// 1. Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a new Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  const { amount } = req.body; // Amount should be in INR

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise (100 paise = 1 INR)
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).send('Error creating order');
    }
    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createOrder,
};