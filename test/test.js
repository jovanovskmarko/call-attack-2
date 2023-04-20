const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Delegatecall', function () {
  let deployer, attacker, secureStore, warehouse, user;

  before(async () => {
    /** SETUP EXERCISE - DON'T CHANGE ANYTHING HERE */

    [deployer, attacker, user] = await ethers.getSigners();

    const Warehouse = await ethers.getContractFactory('Warehouse');
    warehouse = await Warehouse.connect(deployer).deploy();

    const SecureStore = await ethers.getContractFactory('SecureStore');
    secureStore = await SecureStore.connect(deployer).deploy(warehouse.address, 500000);

    // Setup SecureStore
    await network.provider.send("hardhat_setBalance", [
      secureStore.address,
      "0x8AC7230489E80000",
    ]);

  });

  it('Exploit', async () => {
    /** CODE YOUR SOLUTION HERE */

    const AttackerContract = await ethers.getContractFactory('Attacker');
    const attackerContract = await AttackerContract.connect(attacker).deploy();
    await network.provider.send("hardhat_setBalance", [
      attacker.address,
      "0x8AC7230489E80000",
    ]);

    // Change the address of the Warehouse
    await attackerContract.connect(attacker).firstAttack(secureStore.address);

    // Advance the block timestamp by 1 day
    await network.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);

    // await attackerContract.connect(attacker).seccondAttack(secureStore.address);

    // Take ownership of SecureStore
    // await attackerContract.connect(attacker).attack(secureStore.address);

    // Withdrawing the SecureStore's funds
    // const attackerBefore = await ethers.provider.getBalance(attacker.address);
    // console.log(attackerBefore);
    // await secureStore.connect(attacker).withdrawAll();
    // const attackerAfter = await ethers.provider.getBalance(attacker.address);
    // console.log(attackerAfter);
  });

  after(async () => {
    /** SUCCESS CONDITIONS */

    // const balanceSecureStore = await ethers.provider.getBalance(secureStore.address);
    // expect(balanceSecureStore).to.eq(0);

    // console.log("Attacker's balance after exploit: ",await ethers.provider.getBalance(attacker.address));
  });
});