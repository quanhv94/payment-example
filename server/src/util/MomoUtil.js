
import crypto from 'crypto-js';
import request from 'request-promise';

const endpoint = 'https://test-payment.momo.vn/gw_payment/transactionProcessor';
const partnerCode = 'MOMOGYRV20200108';
const accessKey = 'iSgDPGDYlJ7wb0qv';
const secretKey = 'PZqh8pXPgboXy3pWEfEIH7sQ8k8elaGM';
const orderInfo = 'pay with MoMo';
const returnUrl = 'https://payment-test-123.tunnel.datahub.at/momo-payment-callback';
const notifyUrl = 'https://payment-test-123.tunnel.datahub.at/momo-payment-callback-ipn';

export default class MomoUtil {
  static createTransaction = async ({ orderId, amount, extraData = '' }) => {
    const requestId = orderId;
    const requestType = 'captureMoMoWallet';
    const rawSignature = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&returnUrl=${returnUrl}&notifyUrl=${notifyUrl}&extraData=${extraData}`;
    const signature = crypto.HmacSHA256(rawSignature, secretKey).toString();
    const body = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      returnUrl,
      notifyUrl,
      extraData,
      requestType,
      signature,
    };
    const response = await request({
      uri: endpoint,
      method: 'POST',
      body,
      json: true,
    });
    return response;
  }

  static getTransactionStatus = async ({ orderId }) => {
    const requestId = orderId;
    const requestType = 'transactionStatus';
    const rawSignature = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&orderId=${orderId}&requestType=${requestType}`;
    const signature = crypto.HmacSHA256(rawSignature, secretKey).toString();
    const body = { partnerCode, accessKey, requestId, orderId, signature, requestType };
    const response = await request({
      uri: endpoint,
      method: 'POST',
      body,
      json: true,
    });
    return response;
  }
}
