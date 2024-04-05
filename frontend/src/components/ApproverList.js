import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MultisigWallet from "../contracts/MultisigWallet.json";

export const ApproverList = ({ provider }) => {
  const [approvers, setApprovers] = useState([]);
  const [quorum, setQuorum] = useState(null);

  const fetchContractData = async () => {
    try {
      const contract = new ethers.Contract(
        MultisigWallet.address,
        MultisigWallet.abi,
        provider
      );
      const approvers = await contract.getApprovers();
      setApprovers(approvers);
      const quorum = await contract.quorum();
      setQuorum(quorum.toString());
    } catch (error) {
      console.error("Error fetching approvers:", error);
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
    </div>
  );
};
