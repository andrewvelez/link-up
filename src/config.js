import { ENVIRONMENTS } from "./constants.js";

const environment = process.env.NODE_ENV;

export const isDev = environment === ENVIRONMENTS.DEV;
export const isTest = environment === ENVIRONMENTS.TEST;
export const isProd = environment === ENVIRONMENTS.PROD;
