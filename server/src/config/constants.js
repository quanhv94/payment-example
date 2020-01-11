import dotenv from 'dotenv';

dotenv.config();

const constants = {
  appName: 'payment',
  env: process.env.ENV,
  jwtKey: `hls-${process.env.ENV}`,
};

export default constants;
