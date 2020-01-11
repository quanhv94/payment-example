import express from 'express';
import uuid from 'uuid/v4';
import MomoUtil from '../util/MomoUtil';
import VNPayUtil from '../util/VNPayUtil';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  res.render('home');
});

router.post('/momo-payment', async (req, res) => {
  const response = await MomoUtil.createTransaction({
    orderId: uuid(),
    amount: req.body.amount,
  });
  if (response.errorCode === 0) {
    res.redirect(response.payUrl);
  } else {
    res.json(response);
  }
});
router.get('/momo-payment-callback', async (req, res) => {
  const { orderId } = req.query;
  const response = await MomoUtil.getTransactionStatus({ orderId });
  if (response.errorCode === 0) {
    res.send(response);
  } else {
    res.send('Failed');
  }
});
router.post('/momo-payment-callback-ipn', async (req, res) => {
  const { orderId } = req.body;
  res.send('Ok');
  const response = await MomoUtil.getTransactionStatus({ orderId });
  console.log(response);
});

router.post('/vnpay-payment', async (req, res) => {
  const vnpUrl = VNPayUtil.createPaymentUrl({
    ipAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    orderId: uuid(),
    amount: req.body.amount,
  });
  res.redirect(vnpUrl);
});
router.get('/vnpay-payment-callback', async (req, res) => {
  const vnpParams = req.query;
  if (VNPayUtil.verifyTransactionResponse({ vnpParams })) {
    if (vnpParams.vnp_ResponseCode === '00') {
      res.json(vnpParams);
    } else {
      res.send('Payment failed');
    }
  } else {
    res.send('Checksum failed');
  }
});
router.get('/vnpay-payment-callback-ipn', async (req, res) => {
  const vnpParams = req.query;
  res.send('Ok');
  if (VNPayUtil.verifyTransactionResponse({ vnpParams })) {
    if (vnpParams.vnp_ResponseCode === '00') {
      console.log(JSON.stringify(vnpParams, 0, 2));
    } else {
      console.log('Payment failed');
      console.log(JSON.stringify(vnpParams, 0, 2));
    }
  } else {
    console.log('Checksum failed');
  }
});


export default router;
