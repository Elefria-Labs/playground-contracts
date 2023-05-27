import { expect } from "chai"
import { Signer } from "ethers"
import { ethers, upgrades } from "hardhat"
import { TestToken__factory } from "../build/typechain"
import { SendAll } from "../build/typechain/SendAll"
import { TestToken } from "../build/typechain/TestToken"

describe("SendAll", () => {
  let accounts: Signer[]
  let tokenDeployer
  let testTokenContract: TestToken
  let sendAllContract: SendAll
  let testTokenFactory: TestToken__factory
  beforeEach(async () => {
    accounts = await ethers.getSigners()
    tokenDeployer = accounts[0]

    testTokenFactory = await ethers.getContractFactory("TestToken")
    const sendAll = await ethers.getContractFactory("SendAll")
    testTokenContract = (await (await testTokenFactory.deploy("TestToken", "TT")).deployed()) as TestToken
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

  it("Should be able to send multiple approved tokens", async () => {
    const tokenOwner = accounts[1]
    const tokenReceiver = accounts[2]
    const spender = sendAllContract.address
    const etherAmount = ethers.BigNumber.from("2000000000000000000")
    const sendAmount = ethers.BigNumber.from("1000000000000000000")
    const tokenContract2 = (await (await testTokenFactory.deploy("TestToken2", "TT2")).deployed()) as TestToken

    await (await testTokenContract.mint(etherAmount, await tokenOwner.getAddress())).wait()
    await (await tokenContract2.mint(etherAmount, await tokenOwner.getAddress())).wait()

    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(0)
    expect(await tokenContract2.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
    expect(await tokenContract2.balanceOf(await tokenReceiver.getAddress())).to.equal(0)

    await (await testTokenContract.connect(tokenOwner).approve(spender, etherAmount)).wait()
    await (await tokenContract2.connect(tokenOwner).approve(spender, etherAmount)).wait()

    await (
      await sendAllContract
        .connect(tokenOwner)
        .transferTokens(
          [testTokenContract.address, tokenContract2.address],
          [sendAmount, sendAmount],
          await tokenReceiver.getAddress()
        )
    ).wait()

    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(sendAmount)
    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount.sub(sendAmount))
    expect(await tokenContract2.balanceOf(await tokenReceiver.getAddress())).to.equal(sendAmount)
    expect(await tokenContract2.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount.sub(sendAmount))
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

  it("Gas cost should be less to send multiple approved tokens via contract", async () => {
    const tokenOwner = accounts[1]
    const tokenReceiver = accounts[2]
    const spender = sendAllContract.address
    const etherAmount = ethers.BigNumber.from("4000000000000000000")
    const sendAmountWoContract = ethers.BigNumber.from("1000000000000000000")
    const sendAmount = ethers.BigNumber.from("1000000000000000000")
    const tokenContract2 = (await (await testTokenFactory.deploy("TestToken2", "TT2")).deployed()) as TestToken

    await (await testTokenContract.mint(etherAmount, await tokenOwner.getAddress())).wait()
    await (await tokenContract2.mint(etherAmount, await tokenOwner.getAddress())).wait()

    expect(await testTokenContract.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(0)
    expect(await tokenContract2.balanceOf(await tokenOwner.getAddress())).to.equal(etherAmount)
    expect(await tokenContract2.balanceOf(await tokenReceiver.getAddress())).to.equal(0)

    const sendToken1Tx = await (
      await testTokenContract.connect(tokenOwner).transfer(await tokenReceiver.getAddress(), sendAmountWoContract)
    ).wait()

    const sendToken2Tx = await (
      await tokenContract2.connect(tokenOwner).transfer(await tokenReceiver.getAddress(), sendAmountWoContract)
    ).wait()

    const totalGasUsed = sendToken1Tx.gasUsed.add(sendToken2Tx.gasUsed)

    await (await testTokenContract.connect(tokenOwner).approve(spender, etherAmount)).wait()
    await (await tokenContract2.connect(tokenOwner).approve(spender, etherAmount)).wait()

    const sendAllTx = await (
      await sendAllContract
        .connect(tokenOwner)
        .transferTokens(
          [testTokenContract.address, tokenContract2.address],
          [sendAmount, sendAmount],
          await tokenReceiver.getAddress()
        )
    ).wait()

    expect(await testTokenContract.balanceOf(await tokenReceiver.getAddress())).to.equal(sendAmount.add(sendAmount))
    expect(await tokenContract2.balanceOf(await tokenReceiver.getAddress())).to.equal(sendAmount.add(sendAmount))

    expect(sendAllTx.gasUsed.toNumber()).to.be.lessThan(totalGasUsed.toNumber())
  })
})
