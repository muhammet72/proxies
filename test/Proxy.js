const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Proxy", () => {
  let proxy, logic1, logic2, proxyAsLogic1, proxyAsLogic2;

  beforeEach(async () => {
    const Proxy = await ethers.getContractFactory("Proxy");
    proxy = await Proxy.deploy();

    const Logic1 = await ethers.getContractFactory("Logic1");
    logic1 = await Logic1.deploy();

    const Logic2 = await ethers.getContractFactory("Logic2");
    logic2 = await Logic2.deploy();

    // first way __________________________________________________
    // new ethers.utils.Interface(["function changeX() external"]);
    // second way__________________________________________________
    proxyAsLogic1 = await ethers.getContractAt("Logic1", proxy.address);
    proxyAsLogic2 = await ethers.getContractAt("Logic2", proxy.address);

    // accounts = await ethers.getSigners();
    // deployer = accounts[0];
    // receiver = accounts[1];
    // exchange = accounts[2];
  });

  // eth_getStorageAt
  async function lookupUint(contractAddr, slot) {
    return parseInt(await ethers.provider.getStorageAt(contractAddr, slot));
  }

  describe("Deployment", async () => {
    it("it should work with Logic1", async () => {
      await proxy.changeImplementation(logic1.address);
      // assert.equal(await logic1.x(), 0);
      assert.equal(await lookupUint(logic1.address, "0x0"), 0);

      await proxyAsLogic1.changeX(52);
      // expect(await logic1.x()).to.equal(52);
      // assert.equal(await logic1.x(), 52);
      assert.equal(await lookupUint(proxy.address, "0x0"), 52);
    });

    it("it should work with upgrades", async () => {
      // START AT LOGIC 1
      await proxy.changeImplementation(logic1.address);

      // assert.equal(await logic1.x(), 0);
      assert.equal(await lookupUint(proxy.address, "0x0"), 0);

      await proxyAsLogic1.changeX(35);
      // assert.equal(await logic1.x(), 45);
      assert.equal(await lookupUint(proxy.address, "0x0"), 35);

      // UPGRADE TO LOGIC 2
      await proxy.changeImplementation(logic2.address);

      // assert.equal(await logic2.x(), 0);
      assert.equal(await lookupUint(proxy.address, "0x0"), 35);

      await proxyAsLogic2.changeX(15);
      // assert.equal(await logic2.x(), 15);
      assert.equal(await lookupUint(proxy.address, "0x0"), 15);

      // NEW LOGIC
      await proxyAsLogic2.tripleX();
      // assert.equal(await logic2.x(), 45);
      assert.equal(await lookupUint(proxy.address, "0x0"), 45);
    });
  });
});
