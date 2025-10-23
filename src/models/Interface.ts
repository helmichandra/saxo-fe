export interface FiatsTransaction {
  id: number;
  user_id: number;
  amount: number;
  status: number;
  transactionType: string;
  transactionId: string;
  admin_notes: string;
  bank_account_id: number;
  payment_method: string;
  user_transfer_transcript: string;
  admin_approval_timestamp: string;
  date: string;
  modified_date: string;
  depositData?: DepositData;
  withdrawData?: WithdrawData;
  fiatWalletId: string; 
  balance: number; 
  user: {
    userId: number; 
    fullName: string; 
  };
  modifiedDate: string; 
  transactionNumber: string;
  nominalAmount: number;
  nominalFlow: string;
  remark: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  tradingId: string;
  cryptoWalletId: string;
  coinAmount: number;
  walletCashflow: string;
  
}


export interface Bank {
  bankId: string;
  bankName: string;
  accountNumber: string;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  isActive: number;
  mode: "company" | "user";
  bank: Bank;
  userBankAccountId: string;
  holderName: string;
  type: string;
}

export interface BankData {
  bankId: string; 
  bankCode: string; 
  name: string; 
  type: "bank" | "ewallet"; 
  createdDate: string; 
  createdBy: string; 
  modifiedDate: string; 
  modifiedBy: string; 
  bankName: string;
  accountNumber: string;
  userBankAccountId: string;
}

export interface AddBankProps {
  mode: "company" | "user"; 
}


export interface BankList {
  bank: BankData[]; 
  ewallet: BankData[]; 
}

export interface UserBank {
  userBankAccountId: string; 
  bankName: string;          
  userId: number;            
  accountNumber: string;     
  createdDate: string;       
  createdBy: string;         
  modifiedDate: string;      
  modifiedBy: string;   
  isActive: number;     
  holderName: string;
}



export interface DepositData {
  depositId: string;
  transactionType: string;
  status: number;
  bankPayment: string;
  adminApproved: string;
  adminNotes: string;
  requestDate: string;
  transferReceipt: string;
}

export interface WithdrawData {
  withdrawId: string;
  transactionType: string;
  status: number;
  bankCustomer: string;
  approvedDate: string;
  adminNotes: string;
  requestDate: string;
  bankCustomerName: string;
  bankCustomerHolderName: string;
}

export interface AdminData {
  userId: number;
  userNumber: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  roleId: number;
  password: string;
  keyCode: string;
  registeredCode: string;
  isActive: number;
  handledBy: string | null;
  adminNotes: string | null;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  creditScore: number;
}

export interface AdminResponse {
  data: AdminData[];
  total: number;
  totalPage: number;
}


export interface PhonePrefix {
  id: string;
  country: string;
  countryCode: string;
  prefix: string;
}

export interface CryptocurrencyType {
  coinId: string;
  coinCode: string;
  coinName: string;
  currentUsdRate: number;
  currentIdrRate: number;
  coinmarketcapRawdata: string;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  fiatAmountConverted: number;
}

export interface CryptoWallet {
  fiatAmountConverted: number;
  cryptoWalletId: string;
  tradingId: string;
  userId: number;
  coinId: string;
  coinCode: string;
  balance: number;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  cryptocurrencyType: CryptocurrencyType;
  type: string;
  coinAmount: number;
  walletCashflow: string;
  t: CryptocurrencyType;
  user:User;
  depositData?: DepositData;
  withdrawData?: WithdrawData;
  
}

export interface CryptocurrencyType {
  coinId: string;
  coinCode: string;
  coinName: string;
}



export interface QuoteDetails {
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  market_cap_dominance: number;
  fully_diluted_market_cap: number;
  last_updated: string;
}

export interface CryptocurrencyData {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  infinite_supply: boolean;
  last_updated: string; 
  date_added: string; 
  tags: string[];
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  targetCurrency: string;
  priceInTargetCurrency: {
    price: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    percent_change_60d: number;
    percent_change_90d: number;
    market_cap: number;
    volume_24h: number;
    fully_diluted_market_cap: number;
  };
  infoCoin: {
    website: string[];
    technical_doc: string[];
    twitter: string[];
    reddit: string[];
    message_board: string[];
    announcement: string[];
    chat: string[];
    explorer: string[];
    source_code: string[];
  };
  logoUrl: string;
  quote: {
    [key: string]: QuoteDetails;
  };
}

export interface CryptocurrencyResponse {
  data: CryptocurrencyData[];
}

export interface CoinLogo {
  id: number;
  name: string;
  symbol: string;
  logoUrl: string;
}

export interface User {
  userId: string;
  userNumber: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  email: string;
  registeredCode: string;
  isActive: number;
  handledBy: string | null;
  adminNotes: string | null;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  roleId: number;
  creditScore: number;
}

export interface RegisteredData {
  email: string;
  isAdmin: string;
  passwordRegister: string;
  status: string;
}

export interface AdminData {
  userId: number;
  userNumber: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  roleId: number;
  password: string;
  keyCode: string;
  registeredCode: string;
  isActive: number; 
  handledBy: string | null;
  adminNotes: string | null;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}


export interface UsersResponse {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: User[];
}

export interface Member {
  phoneNoReg: string;
  registrationCodeTemp: string | null;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}

export interface MembersResponse {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Member[];
}

// export interface PriceInTargetCurrency {
//   price: number;
//   percent_change_24h: number;
//   percent_change_7d: number;
//   market_cap: number;
//   volume_24h: number;
//   circulating_supply: number;
// }

export interface Urls {
  website: string[];
  technical_doc: string[];
  twitter: string[];
  reddit: string[];
  message_board: string[];
  announcement: string[];
  chat: string[];
  explorer: string[];
  source_code: string[];
}

export interface CoinData {
  urls: Urls;
  logo: string;
  id: number;
  name: string;
  symbol: string;
  slug: string;
  description: string;
  date_added: string; // Use `Date` type if you prefer working with Date objects
  date_launched?: string | null; // Optional if not always present
  tags: string[];
  platform: string | null; // If the platform is more complex, define an export interface for it
  category: string;
}

export interface CoinInfoResponse {
  data: {
    [key: string]: CoinData;
  };
}

// export interface CryptoTableData {
//   id: string;
//   name: string;
//   logoUrl: string;
//   symbol: string;
//   percent_change_24h: number;
//   percent_change_7d: number;
//   market_cap: number;
//   volume_24h: number;
//   circulating_supply: number;
//   slug: string;
//   priceInTargetCurrency: {
//     price: number;
//     percent_change_24h: number;
//     percent_change_7d: number;
//     market_cap: number;
//     volume_24h: number;
//   };
// }
