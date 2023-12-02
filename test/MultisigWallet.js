// The ethers variable is available in the global scope. If you like your code always being explicit, you can add this line at the top:
const { ethers } = require("hardhat");

// This is an example test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");

const { parseEther } = require("ethers");

//Set quorum const
const _quorum = 2;

// #region aux funcs
const checkContractBalance = async (contact, expected) => {
  const deployedAddress = await contact.getAddress();
  const contractBalance = await ethers.provider.getBalance(deployedAddress);
  expect(contractBalance).to.equal(parseEther(expected));
};
//#endregion

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
    const [approver1, approver2, approver3, recipient1] =
      await ethers.getSigners();

    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.
    const multisigWallet = await ethers.deployContract("MultisigWallet", [
      [approver1.address, approver2.address, approver3.address],
      _quorum,
    ]);

    await multisigWallet.waitForDeployment();

    //Found the contract
    const deployedAddress = await multisigWallet.getAddress();
    const tx = {
      to: deployedAddress,
      value: parseEther("10.0"),
    };
    await approver1.sendTransaction(tx);

    // Fixtures can return anything you consider useful for your tests
    return {
      multisigWallet,
      approver1,
      approver2,
      approver3,
      recipient1,
    };
  }

  it("should deploy with the correct initial state", async function () {
    // We use loadFixture to setup our environment, and then assert that
    // things went well
    const { multisigWallet, approver1, approver2, approver3, recipient1 } =
      await loadFixture(deployFixture);

    // Test the initial state of the contract
    expect(await multisigWallet.quorum()).to.equal(_quorum);
    const approvers = await multisigWallet.getApprovers();
    expect(approvers).to.deep.include.members([
      approver1.address,
      approver2.address,
      approver3.address,
    ]);
    expect(approvers).to.not.deep.include.members([recipient1.address]);

    const transferCount = await multisigWallet.getTransferCount();
    checkContractBalance(multisigWallet, "10.0");
  });

  it("should create and approve a transfer", async () => {
    const { multisigWallet, approver1, approver2, recipient1 } =
      await loadFixture(deployFixture);

    const transferAmount = parseEther("0.5");
    const description = "Test Transfer";

    const transferIndex = 0;

    // Check Submission event
    await expect(
      multisigWallet.createTransfer(
        recipient1.address,
        transferAmount,
        description
      )
    )
      .to.emit(multisigWallet, "Submission")
      .withArgs(transferIndex, approver1.address, transferAmount, description);

    // Approve the transfer:  emit Confirmation(msg.sender, _id);
    await expect(
      multisigWallet.connect(approver1).approveTransfer(transferIndex)
    )
      .to.emit(multisigWallet, "Confirmation")
      .withArgs(approver1.address, transferIndex);

    // // Check Execution event
    await expect(
      multisigWallet.connect(approver2).approveTransfer(transferIndex)
    )
      .to.emit(multisigWallet, "Execution")
      .withArgs(transferIndex, approver2.address);

    checkContractBalance(multisigWallet, "9.5");
  });
});
