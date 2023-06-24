import { expect } from "chai"
import { Signer } from "ethers"
import { ethers, upgrades } from "hardhat"
import { SendAll } from "../build/typechain/SendAll"
import { TestToken } from "../build/typechain/TestToken"

describe("SendAll", () => {
  let accounts: Signer[]
  let tokenDeployer
  let testTokenContract: TestToken
  let sendAllContract: SendAll
  beforeEach(async () => {
    accounts = await ethers.getSigners()
    tokenDeployer = accounts[0]

    const testToken = await ethers.getContractFactory("TestToken")
    const sendAll = await ethers.getContractFactory("SendAll")
    testTokenContract = (await (await testToken.deploy("TestToken", "TT")).deployed()) as TestToken
    sendAllContract = (await (await sendAll.deploy()).deployed()) as SendAll
  })

  it("Should be able to send all approved tokens", async () => {
    const tokenOwner = accounts[1]
    const tokenReceiver = accounts[2]
    const spender = sendAllContract.address
    const etherAmount = ethers.BigNumber.from("1000000000000000000")
    const mintTx = (await testTokenContract.mint(etherAmount, await tokenOwner.getAddress())).wait()

    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(0)
    await (await testTokenContract.connect(tokenOwner).approve(spender, etherAmount)).wait()

    await (
      await sendAllContract
        .connect(tokenOwner)
        .transferTokens([await testTokenContract.address], [etherAmount], await tokenReceiver.getAddress())
    ).wait()

    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(etherAmount)
    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(0)
  })

  it("Should be able to send some approved tokens", async () => {
    const tokenOwner = accounts[1]
    const tokenReceiver = accounts[2]
    const spender = sendAllContract.address
    const etherAmount = ethers.BigNumber.from("2000000000000000000")
    const sendAmount = ethers.BigNumber.from("1000000000000000000")
    const mintTx = (await testTokenContract.mint(etherAmount, await tokenOwner.getAddress())).wait()

    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(0)

    await (await testTokenContract.connect(tokenOwner).approve(spender, etherAmount)).wait()

    await (
      await sendAllContract
        .connect(tokenOwner)
        .transferTokens([await testTokenContract.address], [sendAmount], await tokenReceiver.getAddress())
    ).wait()

    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(sendAmount)
    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount.sub(sendAmount))
  })

  it("Should not be able to send more than approved tokens", async () => {
    const tokenOwner = accounts[1]
    const tokenReceiver = accounts[2]
    const spender = sendAllContract.address
    const etherAmount = ethers.BigNumber.from("2000000000000000000")
    const sendAmount = ethers.BigNumber.from("1000000000000000000")
    const mintTx = (await testTokenContract.mint(etherAmount, await tokenOwner.getAddress())).wait()

    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(0)

    await (await testTokenContract.connect(tokenOwner).approve(spender, sendAmount)).wait()

    // note that reverted messages are matched as a substring
    await expect(
      sendAllContract
        .connect(tokenOwner)
        .transferTokens([testTokenContract.address], [etherAmount], await tokenReceiver.getAddress())
    ).to.be.revertedWith("ERC20: insufficient allowance")

    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
  })

  it("Should not be able to send approved tokens if not owner", async () => {
    const tokenOwner = accounts[1]
    const tokenReceiver = accounts[2]
    const notTokenOwner = accounts[3]
    const spender = sendAllContract.address
    const etherAmount = ethers.BigNumber.from("2000000000000000000")
    const sendAmount = ethers.BigNumber.from("1000000000000000000")

    await (await testTokenContract.mint(etherAmount, await tokenOwner.getAddress())).wait()

    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(0)

    await (await testTokenContract.connect(tokenOwner).approve(spender, etherAmount)).wait()

    // note that reverted messages are matched as a substring
    await expect(
      sendAllContract
        .connect(notTokenOwner)
        .transferTokens([testTokenContract.address], [sendAmount], await tokenReceiver.getAddress())
    ).to.be.revertedWith("ERC20: insufficient allowance")

    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
  })

  it("Should not be able to send tokens via an approved address", async () => {
    const tokenOwner = accounts[1]
    const tokenReceiver = accounts[2]
    const notTokenOwner = accounts[3]
    const spender = sendAllContract.address
    const etherAmount = ethers.BigNumber.from("2000000000000000000")

    await (await testTokenContract.mint(etherAmount, await tokenOwner.getAddress())).wait()

    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(0)

    await (await testTokenContract.connect(tokenOwner).approve(await notTokenOwner.getAddress(), etherAmount)).wait()

    // note that reverted messages are matched as a substring
    await expect(
      sendAllContract
        .connect(notTokenOwner)
        .transferTokens([testTokenContract.address], [etherAmount], await tokenReceiver.getAddress())
    ).to.be.revertedWith("ERC20: insufficient allowance")

    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
  })
})
