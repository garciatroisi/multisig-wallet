const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Wallets", (m) => {
  const quorum = 2;
  const approver1 = "0x803e1522e136121c058dc9541e7b3164957c200e";
  const approver2 = "0xf41671100948bcb80cb9efbd3fba16c2898d9ef7";
  const approver3 = "0xa342fabbeca9174296c548f4a6f0f93872390fce";
  const approvers = [approver1, approver2, approver3];
  const msigContract = m.contract("MultisigWallet", [approvers, quorum]);

  return { msigContract };
});
