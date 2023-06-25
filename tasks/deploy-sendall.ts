import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:sendall", "Deploy SendAll contract")
  .addOptionalParam<boolean>("logs", "Logs ", true, types.boolean)
  .setAction(async ({}, { ethers }): Promise<Contract> => {
    const SendAll = await ethers.getContractFactory("SendAll")
    const sendAll = await SendAll.deploy()
    await sendAll.deployed()

    console.log("sendall contract address:", sendAll.address)

    return sendAll
  })
