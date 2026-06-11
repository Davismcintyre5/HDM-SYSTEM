// services/mpesaService.js

const axios = require('axios');
const { env } = require('../config/env');

const getBaseUrl = () => {
  return env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
};

const getAccessToken = async () => {
  const auth = Buffer.from(`${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const response = await axios.get(
    `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
};

const stkPush = async ({ phoneNumber, amount, accountReference, transactionDesc }) => {
  try {
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${env.MPESA_SHORTCODE}${env.MPESA_PASSKEY}${timestamp}`).toString('base64');

    const response = await axios.post(
      `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: phoneNumber.replace(/^0/, '254').replace(/^\+/, ''),
        PartyB: env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber.replace(/^0/, '254').replace(/^\+/, ''),
        CallBackURL: `${env.MPESA_CALLBACK_BASE_URL}/api/cyber/mpesa/callback`,
        AccountReference: accountReference || 'Payment',
        TransactionDesc: transactionDesc || 'Payment',
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    return {
      success: true,
      merchantRequestId: response.data.MerchantRequestID,
      checkoutRequestId: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
    };
  } catch (error) {
    console.error('STK Push error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.errorMessage || error.message };
  }
};

const handleCallback = (callbackData) => {
  const { Body } = callbackData;
  const { stkCallback } = Body;

  return {
    merchantRequestId: stkCallback.MerchantRequestID,
    checkoutRequestId: stkCallback.CheckoutRequestID,
    resultCode: stkCallback.ResultCode,
    resultDesc: stkCallback.ResultDesc,
    amount: stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value,
    mpesaReceiptNumber: stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value,
    transactionDate: stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'TransactionDate')?.Value,
    phoneNumber: stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'PhoneNumber')?.Value,
  };
};

module.exports = { stkPush, handleCallback };