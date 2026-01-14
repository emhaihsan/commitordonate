// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract MockUSDCTest is Test {
    MockUSDC public usdc;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    function setUp() public {
        usdc = new MockUSDC();
        // Warp to a realistic timestamp
        vm.warp(1700000000);
    }

    function test_Constants() public view {
        assertEq(usdc.name(), "Mock USDC");
        assertEq(usdc.symbol(), "mockUSDC");
        assertEq(usdc.decimals(), 6);
        assertEq(usdc.FAUCET_AMOUNT(), 1000 * 10**6);
        assertEq(usdc.CLAIM_COOLDOWN(), 1 hours);
    }

    function test_Faucet() public {
        vm.prank(alice);
        usdc.faucet();

        assertEq(usdc.balanceOf(alice), 1000 * 10**6);
        assertEq(usdc.totalSupply(), 1000 * 10**6);
    }

    function test_Faucet_Cooldown() public {
        vm.prank(alice);
        usdc.faucet();

        // Try again immediately - should fail
        vm.prank(alice);
        vm.expectRevert(MockUSDC.ClaimCooldown.selector);
        usdc.faucet();

        // Warp past cooldown
        vm.warp(block.timestamp + 1 hours + 1);

        // Should work now
        vm.prank(alice);
        usdc.faucet();

        assertEq(usdc.balanceOf(alice), 2000 * 10**6);
    }

    function test_Mint() public {
        usdc.mint(alice, 500 * 10**6);
        assertEq(usdc.balanceOf(alice), 500 * 10**6);
    }

    function test_Approve() public {
        vm.prank(alice);
        bool success = usdc.approve(bob, 100 * 10**6);
        
        assertTrue(success);
        assertEq(usdc.allowance(alice, bob), 100 * 10**6);
    }

    function test_Transfer() public {
        usdc.mint(alice, 1000 * 10**6);

        vm.prank(alice);
        bool success = usdc.transfer(bob, 300 * 10**6);

        assertTrue(success);
        assertEq(usdc.balanceOf(alice), 700 * 10**6);
        assertEq(usdc.balanceOf(bob), 300 * 10**6);
    }

    function test_TransferFrom() public {
        usdc.mint(alice, 1000 * 10**6);

        vm.prank(alice);
        usdc.approve(bob, 500 * 10**6);

        vm.prank(bob);
        bool success = usdc.transferFrom(alice, bob, 300 * 10**6);

        assertTrue(success);
        assertEq(usdc.balanceOf(alice), 700 * 10**6);
        assertEq(usdc.balanceOf(bob), 300 * 10**6);
        assertEq(usdc.allowance(alice, bob), 200 * 10**6);
    }

    function test_TransferFrom_MaxAllowance() public {
        usdc.mint(alice, 1000 * 10**6);

        vm.prank(alice);
        usdc.approve(bob, type(uint256).max);

        vm.prank(bob);
        usdc.transferFrom(alice, bob, 300 * 10**6);

        // Max allowance should not decrease
        assertEq(usdc.allowance(alice, bob), type(uint256).max);
    }
}
