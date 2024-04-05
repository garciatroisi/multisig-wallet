import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MultisigWallet from "../contracts/MultisigWallet.json";

export const ContractData = ({ provider }) => {
  const [approvers, setApprovers] = useState([]);
  const [quorum, setQuorum] = useState(null);
  const [balance, setBalance] = useState(null);

  const fetchContractData = async () => {
    try {
      const contract = new ethers.Contract(
        MultisigWallet.address,
        MultisigWallet.abi,
        provider
      );

      // Fetching Approvers
      const approvers = await contract.getApprovers();
      setApprovers(approvers);

      // Fetching Quorum
      const quorum = await contract.quorum();
      setQuorum(quorum.toString());

      // Fetching Balance
      const balanceValue = await provider.getBalance(MultisigWallet.address);
      setBalance(ethers.utils.formatEther(balanceValue));
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  };

  useEffect(() => {
    fetchContractData();
  }, []); // Second argument is an empty array so it only runs once on component mount

  return (
    <div>
      {approvers.length > 0 && (
        <div>
          <h2>Approver List:</h2>
          <ul>
            {approvers.map((approver, index) => (
              <li key={index}>{approver}</li>
            ))}
          </ul>
        </div>
      )}

      {quorum !== null && (
        <div>
          <h2>Quorum:</h2>
          <p>{quorum}</p>
        </div>
      )}

      {balance !== null && (
        <div>
          <h2>Contract Balance:</h2>
          <p>{balance} MATIC</p>
        </div>
      )}
    </div>
  );
};
