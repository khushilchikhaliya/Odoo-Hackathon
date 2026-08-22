import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

// Sample exchange rates relative to USD
const RATES = {
  USD: { symbol: '$', rate: 1.0, name: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, name: 'EUR (€)' },
  INR: { symbol: '₹', rate: 83.5, name: 'INR (₹)' },
  GBP: { symbol: '£', rate: 0.78, name: 'GBP (£)' },
  JPY: { symbol: '¥', rate: 155.0, name: 'JPY (¥)' },
  AUD: { symbol: 'A$', rate: 1.52, name: 'AUD (A$)' },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(localStorage.getItem('globetrotter_currency') || 'USD');

  const handleSetCurrency = (newCurr) => {
    if (RATES[newCurr]) {
      setCurrency(newCurr);
      localStorage.setItem('globetrotter_currency', newCurr);
    }
  };

  const formatPrice = (amountInUSD) => {
    if (amountInUSD === undefined || amountInUSD === null || isNaN(amountInUSD)) return `${RATES[currency]?.symbol || '$'}0`;
    const rate = RATES[currency]?.rate || 1.0;
    const symbol = RATES[currency]?.symbol || '$';
    const converted = Number(amountInUSD) * rate;

    if (currency === 'JPY') {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getSymbol = () => RATES[currency]?.symbol || '$';

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, getSymbol, rates: RATES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
