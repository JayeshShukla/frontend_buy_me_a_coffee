"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../utils/BuyMeACoffee.json";

interface errowallet {
  code: number;
  message: string;
  stack: string;
}

export default function Home() {
  const contractAddress = "0x50d171a56c55277884338bb81436391725fFE566";
  const contractABI = abi.abi;

  const [walletFound, setWalletFound] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [walletAction, setWalletAction] = useState("");
  const [currentAccount, setCurrentAccount] = useState();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memo, setMemo] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);

  const buyCoffee = async (amount: string) => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        // makes connection with ethereum network through your wallet. To contact with contract for future references.
        const provider = new ethers.BrowserProvider(ethereum); // passing ethereum as wallet.
        const signer = await provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const coffeeTxn = await buyMeACoffee.buyCoffee(name, message, {
          value: ethers.parseEther(amount),
        });
        setLoader(true);
        await coffeeTxn.wait();
        setLoader(false);

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMessages = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum && currentAccount) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const allMessages = await buyMeACoffee.getMemos();
        setMemo((prevData) => [...prevData, ...allMessages]);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
        getMessages();
      }
    } catch (error) {
      console.log(error);
    }
  }, [currentAccount]);

  useEffect(() => {
    const EventListener = async () => {
      let buyMeACoffee: ethers.Contract;

      // Create an event handler function for when someone sends
      // us a new memo.
      const onNewMemo = (
        from: any,
        timestamp: number,
        name: any,
        message: any
      ) => {
        console.log("Memo received: ", from, timestamp, name, message);
        setMemo((prevState: any) => [
          ...prevState,
          {
            address: from,
            timestamp: new Date(Number(timestamp) * 1000), // Explicitly convert timestamp to a number
            message,
            name,
          },
        ]);
      };

      const { ethereum } = window as any;

      // Listen for new memo events.
      if (ethereum && currentAccount) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        buyMeACoffee.on("NewMemo", onNewMemo);
      }

      return () => {
        if (buyMeACoffee) {
          buyMeACoffee.off("NewMemo", onNewMemo);
        }
      };
    };
    EventListener();
  }, [currentAccount]);

  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;

      // makes connection with the wallet extension.
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
        <p
          style={{
            color: "white",
            fontSize: "30px",
            marginTop: "15px",
            marginBottom: "40px",
          }}
        >
          buy
          <strong style={{ color: "turquoise" }}> Jayesh</strong> a coffee!
        </p>
        {loader ? (
          <div>sending coffee...</div>
        ) : currentAccount ? (
          <div>
            <p style={{ color: "yellow" }}>Name :</p>
            <input
              style={{
                marginTop: "5px",
                border: "0px",
                color: "Turquoise",
                padding: "5px",
                background: "#2f2f31",
              }}
              value={name}
              onChange={(event) => setName(event?.target.value)}
            />
            <p style={{ marginTop: "10px", color: "yellow" }}>
              Send Jayesh a message :
            </p>
            <textarea
              rows={3}
              placeholder="Wish us!"
              required
              style={{
                color: "turquoise",
                marginTop: "5px",
                paddingLeft: "5px",
                background: "#2f2f31",
              }}
              onChange={(event) => setMessage(event?.target.value)}
              value={message}
            />
            <div style={{ marginTop: "15px" }}>
              <button
                style={{
                  color: "white",
                  border: "1px solid Turquoise",
                  borderRadius: "4px",
                  padding: "10px",
                  cursor: "Pointer",
                }}
                disabled={name ? (message ? false : true) : true}
                onClick={() => buyCoffee("0.001")}
              >
                Send 1 Coffee (0.001ETH)
              </button>
            </div>
            <button
              style={{
                color: "white",
                border: "1px solid Turquoise",
                borderRadius: "4px",
                padding: "10px",
                cursor: "Pointer",
                marginTop: "15px",
              }}
              disabled={name ? (message ? false : true) : true}
              onClick={() => buyCoffee("0.005")}
            >
              Send 1 Large Coffee (0.005ETH)
            </button>
          </div>
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
        <div
          style={{
            color: "white",
            marginTop: "30px",
            fontSize: "30px",
            padding: "50px",
          }}
        >
          <div
            style={{
              background: "#2f2f31",
              paddingTop: "20px",
              paddingLeft: "100px",
              paddingRight: "100px",
              minHeight: "44vh",
              borderRadius: "8px",
            }}
          >
            <div>Coffee Lover's Zone</div>
            <div
              style={{
                width: "100%",
                height: "35vh",
                fontSize: "20px",
                justifyContent: "start",
                display: "block",
                overflowY: "scroll",
              }}
            >
              {currentAccount &&
                memo &&
                memo.map((item, idx) => {
                  return (
                    <div
                      key={idx}
                      style={{
                        border: "2px solid turquoise",
                        borderRadius: "5px",
                        padding: "5px",
                        margin: "10px",
                      }}
                    >
                      <p style={{ fontWeight: "bold" }}>"{item.message}"</p>
                      <p>
                        From: {item.name} at {item.timestamp.toString()}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
