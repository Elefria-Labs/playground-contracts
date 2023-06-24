import { expect } from "chai"
import { Signer } from "ethers"
import { ethers } from "hardhat"
import { StandardToken__factory } from "../build/typechain"
import { StandardToken } from "../build/typechain/StandardToken"

describe("StandardToken (sampletoken)", () => {
  let accounts: Signer[]
  let tokenDeployer: Signer
  let standardTokenContract: StandardToken
  let standardTokenFactory: StandardToken__factory
  const tokenSupply = ethers.BigNumber.from("100000000000000000000") // 10
  const decimals = 18
  const burnPer = 2

  beforeEach(async () => {
    accounts = await ethers.getSigners()
    tokenDeployer = accounts[0]

    standardTokenFactory = await ethers.getContractFactory("StandardToken")
    standardTokenContract = (await (
      await standardTokenFactory.deploy("StandardToken", "ST", decimals, tokenSupply, burnPer)
    ).deployed()) as StandardToken
  })

  it("Owner bal should be equal to supply", async () => {
    expect(await standardTokenContract.balanceOf(await tokenDeployer.getAddress())).to.equal(tokenSupply)
  })

  it("Should burn tokens as per burn percentage on transfer", async () => {
    const tokenReceiver = accounts[1]
    const transferTokenAmount = ethers.BigNumber.from("1000000000000000000") // 1
    const receivedAmount = transferTokenAmount.sub(transferTokenAmount.mul(burnPer).div(100))

    console.log("Max balance--", await standardTokenContract.maxBalance())
    console.log("Max balance--", await standardTokenContract.maxBalPer())
    console.log("balancce Deplyer transferTokenAmount--", transferTokenAmount.toString())
    console.log("balancce Deplyer --", await standardTokenContract.balanceOf(await tokenDeployer.getAddress()))
    console.log("balancce --", await standardTokenContract.balanceOf(await tokenReceiver.getAddress()))
    await (
      await standardTokenContract.connect(tokenDeployer).transfer(await tokenReceiver.getAddress(), transferTokenAmount)
    ).wait()
    expect(await standardTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(receivedAmount)
    expect(await standardTokenContract.balanceOf(await tokenDeployer.getAddress())).to.equal(
      tokenSupply.sub(transferTokenAmount)
    )
  })

  it("Should not allow transfer from blacklisted tokens", async () => {
    const tokenReceiver = accounts[1]
    const transferTokenAmount = ethers.BigNumber.from("2000000000000000000") // 2
    const receivedAmount = transferTokenAmount.sub(transferTokenAmount.mul(2).div(100))

    await (
      await standardTokenContract.connect(tokenDeployer).transfer(await tokenReceiver.getAddress(), transferTokenAmount)
    ).wait()

    console.log("balancce Deplyer transferTokenAmount--", transferTokenAmount.toString())
    console.log("balancce Deplyer --", await standardTokenContract.balanceOf(await tokenDeployer.getAddress()))
    console.log("balancce --", await standardTokenContract.balanceOf(await tokenReceiver.getAddress()))
    expect(await standardTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(receivedAmount)
    expect(await standardTokenContract.balanceOf(await tokenDeployer.getAddress())).to.equal(
      tokenSupply.sub(transferTokenAmount)
    )

    await (await standardTokenContract.connect(tokenDeployer).blacklist([await tokenReceiver.getAddress()], [1])).wait()

    await expect(
      standardTokenContract.connect(tokenReceiver).transfer(await tokenReceiver.getAddress(), transferTokenAmount)
    ).to.be.revertedWith("Blacklisted")
  })

  it("Should allow transfer when removed from blacklist", async () => {
    const tokenReceiver = accounts[1]
    const tokenReceiver2 = accounts[2]
    const transferTokenAmount = ethers.BigNumber.from("2000000000000000000") // 2
    const receivedAmount = transferTokenAmount.sub(transferTokenAmount.mul(2).div(100))

    await (
      await standardTokenContract.connect(tokenDeployer).transfer(await tokenReceiver.getAddress(), transferTokenAmount)
    ).wait()

    // add to blacklist
    await (await standardTokenContract.connect(tokenDeployer).blacklist([await tokenReceiver.getAddress()], [1])).wait()

    await expect(
      standardTokenContract.connect(tokenReceiver).transfer(await tokenReceiver2.getAddress(), transferTokenAmount)
    ).to.be.revertedWith("Blacklisted")

    // remove from blacklist
    await (await standardTokenContract.connect(tokenDeployer).blacklist([await tokenReceiver.getAddress()], [0])).wait()

    await expect(
      standardTokenContract.connect(tokenReceiver).transfer(await tokenReceiver2.getAddress(), receivedAmount)
    )
      .to.emit(standardTokenContract, "Transfer")
      .withArgs(await tokenReceiver.getAddress(), await tokenReceiver2.getAddress(), receivedAmount)
  })

  it("Should not allow more than max wallet percentage hodling", async () => {
    const tokenReceiver = accounts[1]
    const transferTokenAmount = ethers.BigNumber.from("4000000000000000000") // 3

    await expect(
      standardTokenContract.connect(tokenDeployer).transfer(await tokenReceiver.getAddress(), transferTokenAmount)
    ).to.be.revertedWith("Max Bal exceeded")
  })

  it("Should burn 100 if not whitelisted", async () => {
    const tokenReceiver = accounts[1]
    const transferTokenAmount = ethers.BigNumber.from("2000000000000000000") // 2
    const receivedAmount = ethers.BigNumber.from("0")

    // set burn to 100
    await (await standardTokenContract.connect(tokenDeployer).setBurnPer(100)).wait()

    await expect(
      standardTokenContract.connect(tokenDeployer).transfer(await tokenReceiver.getAddress(), transferTokenAmount)
    )
      .to.emit(standardTokenContract, "Transfer")
      .withArgs(await tokenDeployer.getAddress(), await tokenReceiver.getAddress(), transferTokenAmount)
    expect(await standardTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(0)
  })

  it("Should not burn 100 if whitelisted", async () => {
    const tokenReceiver = accounts[1]
    const transferTokenAmount = ethers.BigNumber.from("1000000000000000000") // 1

    // set burn to 100
    await (await standardTokenContract.connect(tokenDeployer).setBurnPer(100)).wait()

    await (await standardTokenContract.connect(tokenDeployer).whitelist([await tokenReceiver.getAddress()], [1])).wait()

    await expect(
      standardTokenContract.connect(tokenDeployer).transfer(await tokenReceiver.getAddress(), transferTokenAmount)
    )
      .to.emit(standardTokenContract, "Transfer")
      .withArgs(await tokenDeployer.getAddress(), await tokenReceiver.getAddress(), transferTokenAmount)
    expect(await standardTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(transferTokenAmount)
  })
})
