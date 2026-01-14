// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {CommitmentVault} from "../src/CommitmentVault.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockUSDC first
        MockUSDC mockUSDC = new MockUSDC();
        console.log("MockUSDC deployed at:", address(mockUSDC));

        // Deploy CommitmentVault
        CommitmentVault vault = new CommitmentVault();
        console.log("CommitmentVault deployed at:", address(vault));

        vm.stopBroadcast();

        // Output for frontend integration
        console.log("\n=== Frontend Integration ===");
        console.log("NEXT_PUBLIC_VAULT_ADDRESS=", address(vault));
        console.log("NEXT_PUBLIC_MOCKUSDC_ADDRESS=", address(mockUSDC));
    }
}
