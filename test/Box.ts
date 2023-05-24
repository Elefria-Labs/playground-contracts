import { expect } from "chai"
import { Signer } from "ethers"
import { ethers, upgrades } from "hardhat"
import { time } from "@nomicfoundation/hardhat-network-helpers"
import { Box } from "../build/typechain/Box"
import { BoxV2 } from "../build/typechain/BoxV2"

describe("Transparent Proxy", () => {
  let accounts: Signer[]

  before(async () => {
    accounts = await ethers.getSigners()
    // manager = accounts[1]
    // const managerAddr = await manager.getAddress()
    // const quizApp = await ethers.getContractFactory("Pythagoras")
    // pythagorasContract = await (await quizApp.deploy(managerAddr)).deployed()
  })

  it.only("Deploy proxy and implementation box contract", async () => {
    const Box = await ethers.getContractFactory("Box")
    const box = await upgrades.deployProxy(Box, [42], { initializer: "store" })
    await box.deployed()
    // const implAddr = await upgrades.erc1967.getImplementationAddress(box.address)
    // const adminAddress = await upgrades.erc1967.getAdminAddress(box.address)
  })

  it("Should be able to call functions of impl via proxy contract", async () => {
    const Box = await ethers.getContractFactory("Box")
    const proxy = await upgrades.deployProxy(Box, [0], { initializer: "store" })
    await proxy.deployed()
    const proxiedBox = (await Box.attach(proxy.address)) as Box

    expect(await proxiedBox.retrieve()).to.equal(0)

    await (await proxiedBox.connect(accounts[0]).store(10)).wait()

    expect(await proxiedBox.retrieve()).to.equal(10)
  })

  it("Should be able to upgrade to BoxV2", async () => {
    const Box = await ethers.getContractFactory("Box")
    const BoxV2 = await ethers.getContractFactory("BoxV2")
    const proxy = await upgrades.deployProxy(Box, [8], { initializer: "store" })
    await proxy.deployed()
    const proxiedBox = (await Box.attach(proxy.address)) as Box

    expect(await proxiedBox.retrieve()).to.equal(8)

    await (await proxiedBox.connect(accounts[0]).store(88)).wait()

    await (await upgrades.upgradeProxy(proxy.address, BoxV2)).deployed()

    const proxiedBoxV2 = (await BoxV2.attach(proxy.address)) as BoxV2

    expect(await proxiedBoxV2.retrieve()).to.equal(88)
    await (await proxiedBoxV2.connect(accounts[0]).store(16)).wait()
    await (await proxiedBoxV2.connect(accounts[0]).decreaseBy(8)).wait()
    expect(await proxiedBox.retrieve()).to.equal(8)
  })
})
