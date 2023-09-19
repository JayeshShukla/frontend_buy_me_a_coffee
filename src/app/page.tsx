"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import internal from "stream";

interface errowallet {
  code: number;
  message: string;
  stack: string;
}

export default function Home() {
  const [walletFound, setWalletFound] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [walletAction, setWalletAction] = useState("");
  const [currentAccount, setCurrentAccount] = useState();

  useEffect(() => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        alert("Please Install an Ethereum Wallet!");
        setWalletError(`Install an Ethereum Wallet & visit us back ! `);
        setWalletFound(false);
      } else {
        setWalletError("");
        setWalletFound(true);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length) {
        setWalletAction("");
        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      console.log(error);
      setWalletAction((error as errowallet).message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        paddingLeft: "15px",
        paddingRight: "15px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "Turquoise", fontSize: "30px", marginTop: "100px" }}>
          Buy <strong style={{ fontSize: "35px" }}>Jayesh</strong> A Coffee!
        </p>
        {currentAccount ? (
          <div>Connected!</div>
        ) : (
          walletFound && (
            <button
              style={{
                border: "1px solid Turquoise",
                borderRadius: "4px",
                padding: "15px",
                marginTop: "15px",
              }}
              onClick={connectWallet}
            >
              Connect your eth wallet
            </button>
          )
        )}
        <div style={{ color: "yellow", marginTop: "10px" }}>
          {walletError ? (
            <div>{walletError}</div>
          ) : walletAction ? (
            <div>{walletAction}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
