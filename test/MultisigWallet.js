// The ethers variable is available in the global scope. If you like your code always being explicit, you can add this line at the top:
const { ethers } = require("hardhat");
// This is an example test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("MultisigWallet contract", function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployFixture() {
    // Get the Signers here.
    const [approver1, approver2, approver3, nonApprover] =
      await ethers.getSigners();

    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.
    const hardhatMultisigWallet = await ethers.deployContract(
      "MultisigWallet",
      [[approver1.address, approver2.address, approver3.address], 3]
    );

    await hardhatMultisigWallet.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return {
      hardhatMultisigWallet,
      approver1,
      approver2,
      approver3,
      nonApprover,
    };
  }

  it("should deploy with the correct initial state", async function () {
    // We use loadFixture to setup our environment, and then assert that
    // things went well
    const {
      hardhatMultisigWallet,
      approver1,
      approver2,
      approver3,
      nonApprover,
    } = await loadFixture(deployFixture);

    // Test the initial state of the contract
    expect(await hardhatMultisigWallet.quorum()).to.equal(3);
    const approvers = await hardhatMultisigWallet.getApprovers();
    expect(approvers).to.deep.include.members([
      approver1.address,
      approver2.address,
      approver3.address,
    ]);
    expect(approvers).to.not.deep.include.members([nonApprover.address]);

    const transferCount = await hardhatMultisigWallet.getTransferCount();
    expect(transferCount).to.equal(0);
  });
});
