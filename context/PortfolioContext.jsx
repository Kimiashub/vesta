"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // LOAD DATA FROM LOCALSTORAGE

  useEffect(() => {
    const savedPortfolio =
      localStorage.getItem("vestaPortfolio");

    const savedTransactions =
      localStorage.getItem("vestaTransactions");

    try {
      if (savedPortfolio) {
        setPortfolio(JSON.parse(savedPortfolio));
      }

      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.error(
        "Could not load saved portfolio data:",
        error
      );
    }

    setIsLoaded(true);
  }, []);

  // SAVE PORTFOLIO

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "vestaPortfolio",
        JSON.stringify(portfolio)
      );
    }
  }, [portfolio, isLoaded]);

  // SAVE TRANSACTIONS

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "vestaTransactions",
        JSON.stringify(transactions)
      );
    }
  }, [transactions, isLoaded]);

  // BUY STOCK

  function buyStock(stock, quantity) {
    setPortfolio((currentPortfolio) => {
      const existingInvestment =
        currentPortfolio.find(
          (investment) =>
            investment.symbol === stock.symbol
        );

      // Stock already exists in portfolio
      if (existingInvestment) {
        return currentPortfolio.map(
          (investment) => {
            if (
              investment.symbol === stock.symbol
            ) {
              const oldTotal =
                investment.price *
                investment.quantity;

              const newTotal =
                stock.price * quantity;

              const newQuantity =
                investment.quantity + quantity;

              const averagePrice =
                (oldTotal + newTotal) /
                newQuantity;

              return {
                ...investment,
                quantity: newQuantity,
                price: averagePrice,
              };
            }

            return investment;
          }
        );
      }

      // New stock
      return [
        ...currentPortfolio,
        {
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          quantity: quantity,
        },
      ];
    });

    // Save transaction
    const newTransaction = {
      id: crypto.randomUUID(),
      type: "buy",
      symbol: stock.symbol,
      name: stock.name,
      quantity: quantity,
      price: stock.price,
      date: new Date().toISOString(),
    };

    setTransactions((currentTransactions) => [
      newTransaction,
      ...currentTransactions,
    ]);
  }

  // SELL STOCK

  function sellStock(stock, quantity) {
  const investment = portfolio.find(
    (investment) =>
      investment.symbol === stock.symbol
  );

  if (!investment) {
    return;
  }

  const quantityToSell = Math.min(
    quantity,
    investment.quantity
  );

  setPortfolio((currentPortfolio) => {
    return currentPortfolio
      .map((investment) => {
        if (
          investment.symbol === stock.symbol
        ) {
          return {
            ...investment,
            quantity:
              investment.quantity -
              quantityToSell,
          };
        }

        return investment;
      })
      .filter(
        (investment) =>
          investment.quantity > 0
      );
  });

  const newTransaction = {
    id: crypto.randomUUID(),
    type: "sell",
    symbol: stock.symbol,
    name: stock.name,
    quantity: quantityToSell,

    price: stock.price,

    date: new Date().toISOString(),
  };

  setTransactions((currentTransactions) => [
    newTransaction,
    ...currentTransactions,
  ]);
}

    // Safety check
    if (!investment) {
      return;
    }

    // Don't allow selling more than the user owns
    const quantityToSell = Math.min(
      quantity,
      investment.quantity
    );

    setPortfolio((currentPortfolio) => {
      return currentPortfolio
        .map((investment) => {
          if (
            investment.symbol === symbol
          ) {
            return {
              ...investment,
              quantity:
                investment.quantity -
                quantityToSell,
            };
          }

          return investment;
        })
        .filter(
          (investment) =>
            investment.quantity > 0
        );
    });

    // Save transaction
    const newTransaction = {
      id: crypto.randomUUID(),
      type: "sell",
      symbol: investment.symbol,
      name: investment.name,
      quantity: quantityToSell,
      price: investment.price,
      date: new Date().toISOString(),
    };

    setTransactions((currentTransactions) => [
      newTransaction,
      ...currentTransactions,
    ]);
  }

  // PROVIDER

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        transactions,
        buyStock,
        sellStock,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );


export function usePortfolio() {
  return useContext(PortfolioContext);
}