import { Contract } from "ethers"
import { task, types } from "hardhat/config"
import { TokenV1 } from "../build/typechain/TokenV1"

task("deploy:token", "Deploy box contract")
  .addOptionalParam<boolean>("logs", "Logs ", true, types.boolean)
  .setAction(async ({ logs }, { ethers, upgrades }): Promise<Contract> => {
    const TokenV1 = await ethers.getContractFactory("TokenV1")

    const token = await upgrades.deployProxy(TokenV1, { kind: "uups" })
    await token.deployed()

    const implAddr = await upgrades.erc1967.getImplementationAddress(token.address)
    const adminAddress = await upgrades.erc1967.getAdminAddress(token.address)

    console.log("Token implementationAddress:", implAddr)
    console.log("Token proxyAddress:", token.address)
    console.log("Proxy adminAddress:", adminAddress)

    const TokenContract = (await TokenV1.attach(token.address)) as TokenV1
    console.log("Token adminAddress:", await TokenContract.owner())

    return token
  })
