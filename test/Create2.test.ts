import { expect } from "chai"
import { Signer } from "ethers"
import { ethers } from "hardhat"
import { Create2 } from "../build/typechain/Create2"
import { D } from "../build/typechain/D"

describe.only("Create2", () => {
  let accounts: Signer[]
  let create2: Create2
  let dBytecode: string
  let d: D

  before(async () => {
    accounts = await ethers.getSigners()

    const Create2 = await ethers.getContractFactory("Create2")
    dBytecode = (await ethers.getContractFactory("D")).bytecode
    create2 = await (await Create2.deploy()).deployed()
  })

  it("Should be able to get deterministic address using Create", async () => {
    const expectedAddress = ethers.utils.getContractAddress({
      from: create2.address,
      nonce: 1
    })
    await expect(create2.connect(accounts[0]).createD(1)).to.emit(create2, "Deployed").withArgs(expectedAddress)
  })

  it("Should be able to get deterministic address using Create2", async () => {
    const salt = "0x6372656174653200000000000000000000000000000000000000000000000000" // create2
    const args = 1
    const abiCoder = ethers.utils.defaultAbiCoder
    const initCode = dBytecode + abiCoder.encode(["uint"], [args]).slice(2)
    const expectedAddress = ethers.utils.getCreate2Address(create2.address, salt, ethers.utils.keccak256(initCode))
    expect(await create2.createDSalted(salt, args)).to.equal(expectedAddress)
  })
})
