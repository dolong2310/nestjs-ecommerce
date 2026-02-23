import { BankCodeType } from '../constants';

export type Bank = {
  napasCode: string;
  disburseCode: string;
  name: string;
  bankLogoUrl: string;
};

export type BankList = Record<BankCodeType, Bank>;
