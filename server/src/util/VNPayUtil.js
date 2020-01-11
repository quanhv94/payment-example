
import crypto from 'crypto-js';
import moment from 'moment';
import qs from 'qs';

const endpoint = 'http://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const tmnCode = '86MB7ZPA';
const secretKey = 'P7V4TGNZ3DRWVDG3E618124T8GMER70I';
const orderInfo = 'pay with VNPay';
const returnUrl = 'https://payment-test-123.tunnel.datahub.at/vnpay-payment-callback';

const sortObjectKey = (object) => Object.keys(object)
  .sort()
  .reduce((result, key) => {
    result[key] = object[key];
    return result;
  }, {});

export default class VNPayUtil {
  static createPaymentUrl = ({ ipAddr, orderId, amount }) => {
    const params = {
      vnp_Version: '2.0.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'billpayment',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
      // vnp_BankCode: 'NCB',
    };
    const vnpParams = sortObjectKey(params);
    const signData = `${secretKey}${qs.stringify(vnpParams, { encode: false })}`;
    const secureHash = crypto.SHA256(signData).toString();

    vnpParams.vnp_SecureHashType = 'SHA256';
    vnpParams.vnp_SecureHash = secureHash;
    const url = `${endpoint}?${qs.stringify(vnpParams, { encode: false })}`;
    return url;
  }

  static verifyTransactionResponse = ({ vnpParams }) => {
    vnpParams = sortObjectKey(vnpParams);
    const secureHash = vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;
    const signData = secretKey + qs.stringify(vnpParams, { encode: false });
    const checkSum = crypto.SHA256(signData).toString();
    return secureHash === checkSum;
  }
}
