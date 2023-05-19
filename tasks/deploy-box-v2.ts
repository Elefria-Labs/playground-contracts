import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:boxv2", "Deploy box contract")
  .addOptionalParam<boolean>("logs", "Logs ", true, types.boolean)
  .setAction(async ({ logs }, { ethers, upgrades }): Promise<Contract> => {
    const implAddr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    const BoxV2 = await ethers.getContractFactory("BoxV2")
    console.log("Deploying Box...")
    const box = await upgrades.upgradeProxy(implAddr, BoxV2)
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(box.address)
    const adminAddress = await upgrades.erc1967.getAdminAddress(box.address)
    await box.deployed()
    console.log("BoxV2 implementationAddress:", implementationAddress)
    // 0x5FbDB2315678afecb367f032d93F642f64180aa3
    console.log("BoxV2 proxyAddress:", box.address)
    // 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
    console.log("BoxV2 adminAddress:", adminAddress)
    // 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
    return box
  })
