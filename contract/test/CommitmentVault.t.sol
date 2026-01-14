// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {CommitmentVault} from "../src/CommitmentVault.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract CommitmentVaultTest is Test {
    CommitmentVault public vault;
    MockUSDC public usdc;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob"); // validator
    address public charity = makeAddr("charity");
    address public anyone = makeAddr("anyone");

    uint256 public constant STAKE_AMOUNT = 100 ether;
    uint256 public constant USDC_AMOUNT = 100 * 10**6; // 100 USDC
    uint256 public constant ONE_DAY = 1 days;
    uint256 public constant ONE_WEEK = 7 days;

    function setUp() public {
        vault = new CommitmentVault();
        usdc = new MockUSDC();

        // Fund alice
        vm.deal(alice, 1000 ether);
        usdc.mint(alice, 10000 * 10**6);

        // Approve vault for alice
        vm.prank(alice);
        usdc.approve(address(vault), type(uint256).max);
    }

    // ============ Constructor Tests ============

    function test_InitialState() public view {
        assertEq(vault.commitmentCounter(), 0);
        assertEq(vault.VALIDATOR_WINDOW(), 24 hours);
    }

    // ============ Create Commitment ETH Tests ============

    function test_CreateCommitmentETH_Success() public {
        uint256 deadline = block.timestamp + ONE_WEEK;

        vm.prank(alice);
        uint256 id = vault.createCommitmentETH{value: STAKE_AMOUNT}(
            bob,
            charity,
            deadline,
            "Exercise daily"
        );

        assertEq(id, 1);
        assertEq(vault.commitmentCounter(), 1);

        CommitmentVault.Commitment memory c = vault.getCommitment(id);
        assertEq(c.creator, alice);
        assertEq(c.validator, bob);
        assertEq(c.charity, charity);
        assertEq(c.token, address(0));
        assertEq(c.amount, STAKE_AMOUNT);
        assertEq(c.deadline, deadline);
        assertEq(c.confirmationTime, 0);
        assertEq(c.validatorDeadline, 0);
        assertEq(c.description, "Exercise daily");
        assertEq(uint8(c.status), uint8(CommitmentVault.Status.CREATED));
        assertEq(uint8(c.outcome), uint8(CommitmentVault.Outcome.PENDING));

        // Check user commitments mapping
        uint256[] memory userComms = vault.getUserCommitments(alice);
        assertEq(userComms.length, 1);
        assertEq(userComms[0], 1);

        // Check validator commitments mapping
        uint256[] memory valComms = vault.getValidatorCommitments(bob);
        assertEq(valComms.length, 1);
        assertEq(valComms[0], 1);

        // Check contract balance
        assertEq(address(vault).balance, STAKE_AMOUNT);
    }

    function test_CreateCommitmentETH_EmitsEvent() public {
        uint256 deadline = block.timestamp + ONE_WEEK;

        vm.expectEmit(true, true, true, true);
        emit CommitmentVault.CommitmentCreated(
            1,
            alice,
            bob,
            charity,
            address(0),
            STAKE_AMOUNT,
            deadline,
            "Exercise daily"
        );

        vm.prank(alice);
        vault.createCommitmentETH{value: STAKE_AMOUNT}(bob, charity, deadline, "Exercise daily");
    }

    function test_CreateCommitmentETH_RevertInvalidValidator_Zero() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidValidator.selector);
        vault.createCommitmentETH{value: STAKE_AMOUNT}(
            address(0),
            charity,
            block.timestamp + ONE_WEEK,
            "Test"
        );
    }

    function test_CreateCommitmentETH_RevertInvalidValidator_Self() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidValidator.selector);
        vault.createCommitmentETH{value: STAKE_AMOUNT}(
            alice, // self as validator
            charity,
            block.timestamp + ONE_WEEK,
            "Test"
        );
    }

    function test_CreateCommitmentETH_RevertInvalidCharity() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidCharity.selector);
        vault.createCommitmentETH{value: STAKE_AMOUNT}(
            bob,
            address(0),
            block.timestamp + ONE_WEEK,
            "Test"
        );
    }

    function test_CreateCommitmentETH_RevertInvalidAmount() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidAmount.selector);
        vault.createCommitmentETH{value: 0}(bob, charity, block.timestamp + ONE_WEEK, "Test");
    }

    function test_CreateCommitmentETH_RevertInvalidDeadline_Past() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidDeadline.selector);
        vault.createCommitmentETH{value: STAKE_AMOUNT}(
            bob,
            charity,
            block.timestamp - 1, // past deadline
            "Test"
        );
    }

    function test_CreateCommitmentETH_RevertInvalidDeadline_Now() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidDeadline.selector);
        vault.createCommitmentETH{value: STAKE_AMOUNT}(
            bob,
            charity,
            block.timestamp, // exact now
            "Test"
        );
    }

    // ============ Create Commitment Token Tests ============

    function test_CreateCommitmentToken_Success() public {
        uint256 deadline = block.timestamp + ONE_WEEK;

        vm.prank(alice);
        uint256 id = vault.createCommitmentToken(
            bob,
            charity,
            address(usdc),
            USDC_AMOUNT,
            deadline,
            "Read 5 books"
        );

        assertEq(id, 1);

        CommitmentVault.Commitment memory c = vault.getCommitment(id);
        assertEq(c.creator, alice);
        assertEq(c.token, address(usdc));
        assertEq(c.amount, USDC_AMOUNT);

        // Check token transferred
        assertEq(usdc.balanceOf(address(vault)), USDC_AMOUNT);
    }

    function test_CreateCommitmentToken_EmitsEvent() public {
        uint256 deadline = block.timestamp + ONE_WEEK;

        vm.expectEmit(true, true, true, true);
        emit CommitmentVault.CommitmentCreated(
            1,
            alice,
            bob,
            charity,
            address(usdc),
            USDC_AMOUNT,
            deadline,
            "Read 5 books"
        );

        vm.prank(alice);
        vault.createCommitmentToken(bob, charity, address(usdc), USDC_AMOUNT, deadline, "Read 5 books");
    }

    function test_CreateCommitmentToken_RevertInvalidValidator_Zero() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidValidator.selector);
        vault.createCommitmentToken(
            address(0),
            charity,
            address(usdc),
            USDC_AMOUNT,
            block.timestamp + ONE_WEEK,
            "Test"
        );
    }

    function test_CreateCommitmentToken_RevertInvalidValidator_Self() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidValidator.selector);
        vault.createCommitmentToken(
            alice,
            charity,
            address(usdc),
            USDC_AMOUNT,
            block.timestamp + ONE_WEEK,
            "Test"
        );
    }

    function test_CreateCommitmentToken_RevertInvalidCharity() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidCharity.selector);
        vault.createCommitmentToken(
            bob,
            address(0),
            address(usdc),
            USDC_AMOUNT,
            block.timestamp + ONE_WEEK,
            "Test"
        );
    }

    function test_CreateCommitmentToken_RevertInvalidToken() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidAmount.selector);
        vault.createCommitmentToken(
            bob,
            charity,
            address(0), // invalid token
            USDC_AMOUNT,
            block.timestamp + ONE_WEEK,
            "Test"
        );
    }

    function test_CreateCommitmentToken_RevertInvalidAmount() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidAmount.selector);
        vault.createCommitmentToken(
            bob,
            charity,
            address(usdc),
            0, // zero amount
            block.timestamp + ONE_WEEK,
            "Test"
        );
    }

    function test_CreateCommitmentToken_RevertInvalidDeadline() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidDeadline.selector);
        vault.createCommitmentToken(
            bob,
            charity,
            address(usdc),
            USDC_AMOUNT,
            block.timestamp, // invalid deadline
            "Test"
        );
    }

    function test_CreateCommitmentToken_RevertTransferFailed() public {
        // Use a mock token that returns false on transferFrom
        FailingToken failToken = new FailingToken();
        failToken.mint(alice, USDC_AMOUNT);
        
        vm.prank(alice);
        failToken.approve(address(vault), USDC_AMOUNT);

        vm.prank(alice);
        vm.expectRevert(CommitmentVault.TransferFailed.selector);
        vault.createCommitmentToken(
            bob,
            charity,
            address(failToken),
            USDC_AMOUNT,
            block.timestamp + ONE_WEEK,
            "Test"
        );
    }

    // ============ Confirm Completion Tests ============

    function test_ConfirmCompletion_Success() public {
        uint256 id = _createETHCommitment();

        // Advance time but stay before deadline
        vm.warp(block.timestamp + 3 days);

        vm.prank(alice);
        vault.confirmCompletion(id);

        CommitmentVault.Commitment memory c = vault.getCommitment(id);
        assertEq(uint8(c.status), uint8(CommitmentVault.Status.CONFIRMED));
        assertEq(c.confirmationTime, block.timestamp);
        assertEq(c.validatorDeadline, block.timestamp + 24 hours);
    }

    function test_ConfirmCompletion_EmitsEvent() public {
        uint256 id = _createETHCommitment();

        vm.expectEmit(true, true, false, true);
        emit CommitmentVault.CommitmentConfirmed(id, alice, block.timestamp + 24 hours);

        vm.prank(alice);
        vault.confirmCompletion(id);
    }

    function test_ConfirmCompletion_RevertInvalidCommitmentId_Zero() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidCommitmentId.selector);
        vault.confirmCompletion(0);
    }

    function test_ConfirmCompletion_RevertInvalidCommitmentId_NotExist() public {
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.InvalidCommitmentId.selector);
        vault.confirmCompletion(999);
    }

    function test_ConfirmCompletion_RevertNotCreator() public {
        uint256 id = _createETHCommitment();

        vm.prank(bob);
        vm.expectRevert(CommitmentVault.NotCreator.selector);
        vault.confirmCompletion(id);
    }

    function test_ConfirmCompletion_RevertWrongStatus() public {
        uint256 id = _createETHCommitment();

        // Confirm first time
        vm.prank(alice);
        vault.confirmCompletion(id);

        // Try to confirm again
        vm.prank(alice);
        vm.expectRevert(CommitmentVault.WrongStatus.selector);
        vault.confirmCompletion(id);
    }

    function test_ConfirmCompletion_RevertDeadlinePassed() public {
        uint256 id = _createETHCommitment();

        // Warp past deadline
        vm.warp(block.timestamp + ONE_WEEK + 1);

        vm.prank(alice);
        vm.expectRevert(CommitmentVault.DeadlinePassed.selector);
        vault.confirmCompletion(id);
    }

    // ============ Approve Tests ============

    function test_Approve_Success_ETH() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        uint256 aliceBalanceBefore = alice.balance;

        vm.prank(bob);
        vault.approve(id);

        CommitmentVault.Commitment memory c = vault.getCommitment(id);
        assertEq(uint8(c.status), uint8(CommitmentVault.Status.RESOLVED));
        assertEq(uint8(c.outcome), uint8(CommitmentVault.Outcome.SUCCESS));

        // Check funds returned
        assertEq(alice.balance, aliceBalanceBefore + STAKE_AMOUNT);
        assertEq(address(vault).balance, 0);
    }

    function test_Approve_Success_Token() public {
        uint256 id = _createTokenCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        uint256 aliceBalanceBefore = usdc.balanceOf(alice);

        vm.prank(bob);
        vault.approve(id);

        // Check funds returned
        assertEq(usdc.balanceOf(alice), aliceBalanceBefore + USDC_AMOUNT);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_Approve_EmitsEvent() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.expectEmit(true, false, false, true);
        emit CommitmentVault.CommitmentResolved(id, CommitmentVault.Outcome.SUCCESS, alice, STAKE_AMOUNT);

        vm.prank(bob);
        vault.approve(id);
    }

    function test_Approve_RevertInvalidCommitmentId() public {
        vm.prank(bob);
        vm.expectRevert(CommitmentVault.InvalidCommitmentId.selector);
        vault.approve(0);
    }

    function test_Approve_RevertNotValidator() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.prank(anyone);
        vm.expectRevert(CommitmentVault.NotValidator.selector);
        vault.approve(id);
    }

    function test_Approve_RevertWrongStatus_Created() public {
        uint256 id = _createETHCommitment();

        // Try to approve without confirmation
        vm.prank(bob);
        vm.expectRevert(CommitmentVault.WrongStatus.selector);
        vault.approve(id);
    }

    function test_Approve_RevertWrongStatus_Resolved() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.prank(bob);
        vault.approve(id);

        // Try to approve again
        vm.prank(bob);
        vm.expectRevert(CommitmentVault.WrongStatus.selector);
        vault.approve(id);
    }

    function test_Approve_RevertDeadlinePassed() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        // Warp past validator deadline
        vm.warp(block.timestamp + 25 hours);

        vm.prank(bob);
        vm.expectRevert(CommitmentVault.DeadlinePassed.selector);
        vault.approve(id);
    }

    // ============ Reject Tests ============

    function test_Reject_Success_ETH() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        uint256 charityBalanceBefore = charity.balance;

        vm.prank(bob);
        vault.reject(id);

        CommitmentVault.Commitment memory c = vault.getCommitment(id);
        assertEq(uint8(c.status), uint8(CommitmentVault.Status.RESOLVED));
        assertEq(uint8(c.outcome), uint8(CommitmentVault.Outcome.FAILURE));

        // Check funds donated
        assertEq(charity.balance, charityBalanceBefore + STAKE_AMOUNT);
        assertEq(address(vault).balance, 0);
    }

    function test_Reject_Success_Token() public {
        uint256 id = _createTokenCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        uint256 charityBalanceBefore = usdc.balanceOf(charity);

        vm.prank(bob);
        vault.reject(id);

        // Check funds donated
        assertEq(usdc.balanceOf(charity), charityBalanceBefore + USDC_AMOUNT);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_Reject_EmitsEvent() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.expectEmit(true, false, false, true);
        emit CommitmentVault.CommitmentResolved(id, CommitmentVault.Outcome.FAILURE, charity, STAKE_AMOUNT);

        vm.prank(bob);
        vault.reject(id);
    }

    function test_Reject_RevertNotValidator() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.prank(anyone);
        vm.expectRevert(CommitmentVault.NotValidator.selector);
        vault.reject(id);
    }

    function test_Reject_RevertWrongStatus() public {
        uint256 id = _createETHCommitment();

        vm.prank(bob);
        vm.expectRevert(CommitmentVault.WrongStatus.selector);
        vault.reject(id);
    }

    function test_Reject_RevertDeadlinePassed() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.warp(block.timestamp + 25 hours);

        vm.prank(bob);
        vm.expectRevert(CommitmentVault.DeadlinePassed.selector);
        vault.reject(id);
    }

    // ============ Resolve Expired Tests ============

    function test_ResolveExpired_MissedConfirmationDeadline_ETH() public {
        uint256 id = _createETHCommitment();

        // Warp past deadline without confirming
        vm.warp(block.timestamp + ONE_WEEK + 1);

        uint256 charityBalanceBefore = charity.balance;

        vm.prank(anyone);
        vault.resolveExpired(id);

        CommitmentVault.Commitment memory c = vault.getCommitment(id);
        assertEq(uint8(c.status), uint8(CommitmentVault.Status.RESOLVED));
        assertEq(uint8(c.outcome), uint8(CommitmentVault.Outcome.FAILURE));

        assertEq(charity.balance, charityBalanceBefore + STAKE_AMOUNT);
    }

    function test_ResolveExpired_MissedConfirmationDeadline_Token() public {
        uint256 id = _createTokenCommitment();

        vm.warp(block.timestamp + ONE_WEEK + 1);

        uint256 charityBalanceBefore = usdc.balanceOf(charity);

        vm.prank(anyone);
        vault.resolveExpired(id);

        assertEq(usdc.balanceOf(charity), charityBalanceBefore + USDC_AMOUNT);
    }

    function test_ResolveExpired_ValidatorSilence_ETH() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        // Warp past validator window (silence = failure)
        vm.warp(block.timestamp + 25 hours);

        uint256 charityBalanceBefore = charity.balance;

        vm.prank(anyone);
        vault.resolveExpired(id);

        CommitmentVault.Commitment memory c = vault.getCommitment(id);
        assertEq(uint8(c.outcome), uint8(CommitmentVault.Outcome.FAILURE));

        assertEq(charity.balance, charityBalanceBefore + STAKE_AMOUNT);
    }

    function test_ResolveExpired_ValidatorSilence_Token() public {
        uint256 id = _createTokenCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.warp(block.timestamp + 25 hours);

        uint256 charityBalanceBefore = usdc.balanceOf(charity);

        vm.prank(anyone);
        vault.resolveExpired(id);

        assertEq(usdc.balanceOf(charity), charityBalanceBefore + USDC_AMOUNT);
    }

    function test_ResolveExpired_EmitsEvent() public {
        uint256 id = _createETHCommitment();

        vm.warp(block.timestamp + ONE_WEEK + 1);

        vm.expectEmit(true, false, false, true);
        emit CommitmentVault.CommitmentResolved(id, CommitmentVault.Outcome.FAILURE, charity, STAKE_AMOUNT);

        vm.prank(anyone);
        vault.resolveExpired(id);
    }

    function test_ResolveExpired_RevertInvalidCommitmentId() public {
        vm.expectRevert(CommitmentVault.InvalidCommitmentId.selector);
        vault.resolveExpired(0);
    }

    function test_ResolveExpired_RevertWrongStatus_AlreadyResolved() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.prank(bob);
        vault.approve(id);

        vm.expectRevert(CommitmentVault.WrongStatus.selector);
        vault.resolveExpired(id);
    }

    function test_ResolveExpired_RevertDeadlineNotPassed_Created() public {
        uint256 id = _createETHCommitment();

        // Still within deadline
        vm.expectRevert(CommitmentVault.DeadlineNotPassed.selector);
        vault.resolveExpired(id);
    }

    function test_ResolveExpired_RevertDeadlineNotPassed_Confirmed() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        // Still within validator window
        vm.expectRevert(CommitmentVault.DeadlineNotPassed.selector);
        vault.resolveExpired(id);
    }

    // ============ View Functions Tests ============

    function test_GetCommitment_RevertInvalidId() public {
        vm.expectRevert(CommitmentVault.InvalidCommitmentId.selector);
        vault.getCommitment(0);

        vm.expectRevert(CommitmentVault.InvalidCommitmentId.selector);
        vault.getCommitment(999);
    }

    function test_GetUserCommitments() public {
        _createETHCommitment();
        _createTokenCommitment();

        uint256[] memory comms = vault.getUserCommitments(alice);
        assertEq(comms.length, 2);
        assertEq(comms[0], 1);
        assertEq(comms[1], 2);
    }

    function test_GetValidatorCommitments() public {
        _createETHCommitment();
        _createTokenCommitment();

        uint256[] memory comms = vault.getValidatorCommitments(bob);
        assertEq(comms.length, 2);
    }

    function test_CanResolveExpired_Created_NotYet() public {
        uint256 id = _createETHCommitment();

        (bool canResolve, uint8 reason) = vault.canResolveExpired(id);
        assertEq(canResolve, false);
        assertEq(reason, 0);
    }

    function test_CanResolveExpired_Created_DeadlinePassed() public {
        uint256 id = _createETHCommitment();

        vm.warp(block.timestamp + ONE_WEEK + 1);

        (bool canResolve, uint8 reason) = vault.canResolveExpired(id);
        assertEq(canResolve, true);
        assertEq(reason, 1); // missed deadline
    }

    function test_CanResolveExpired_Confirmed_NotYet() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        (bool canResolve, uint8 reason) = vault.canResolveExpired(id);
        assertEq(canResolve, false);
        assertEq(reason, 0);
    }

    function test_CanResolveExpired_Confirmed_ValidatorTimeout() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.warp(block.timestamp + 25 hours);

        (bool canResolve, uint8 reason) = vault.canResolveExpired(id);
        assertEq(canResolve, true);
        assertEq(reason, 2); // validator timeout
    }

    function test_CanResolveExpired_Resolved() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.prank(bob);
        vault.approve(id);

        (bool canResolve, uint8 reason) = vault.canResolveExpired(id);
        assertEq(canResolve, false);
        assertEq(reason, 0);
    }

    function test_CanResolveExpired_RevertInvalidId() public {
        vm.expectRevert(CommitmentVault.InvalidCommitmentId.selector);
        vault.canResolveExpired(0);
    }

    // ============ Multiple Commitments Tests ============

    function test_MultipleCommitments() public {
        // Create 3 commitments
        uint256 id1 = _createETHCommitment();
        uint256 id2 = _createTokenCommitment();
        
        vm.prank(alice);
        uint256 id3 = vault.createCommitmentETH{value: 50 ether}(
            bob,
            charity,
            block.timestamp + ONE_WEEK,
            "Third commitment"
        );

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
        assertEq(vault.commitmentCounter(), 3);
    }

    // ============ Edge Cases ============

    function test_ConfirmAtExactDeadline() public {
        uint256 deadline = block.timestamp + ONE_WEEK;
        
        vm.prank(alice);
        uint256 id = vault.createCommitmentETH{value: STAKE_AMOUNT}(
            bob,
            charity,
            deadline,
            "Test"
        );

        // Warp to exact deadline - contract uses > so exact deadline still works
        vm.warp(deadline);

        // At exact deadline, confirmation still succeeds (uses >)
        vm.prank(alice);
        vault.confirmCompletion(id);
        
        // Verify it worked
        CommitmentVault.Commitment memory c = vault.getCommitment(id);
        assertEq(uint8(c.status), uint8(CommitmentVault.Status.CONFIRMED));
    }

    function test_ApproveAtExactValidatorDeadline() public {
        uint256 id = _createETHCommitment();

        vm.prank(alice);
        vault.confirmCompletion(id);

        CommitmentVault.Commitment memory c = vault.getCommitment(id);

        // Warp to exact validator deadline - contract uses > so exact deadline still works
        vm.warp(c.validatorDeadline);

        // At exact deadline, approval still succeeds (uses >)
        vm.prank(bob);
        vault.approve(id);
        
        // Verify it worked
        c = vault.getCommitment(id);
        assertEq(uint8(c.outcome), uint8(CommitmentVault.Outcome.SUCCESS));
    }

    // ============ Helper Functions ============

    function _createETHCommitment() internal returns (uint256) {
        vm.prank(alice);
        return vault.createCommitmentETH{value: STAKE_AMOUNT}(
            bob,
            charity,
            block.timestamp + ONE_WEEK,
            "Exercise daily"
        );
    }

    function _createTokenCommitment() internal returns (uint256) {
        vm.prank(alice);
        return vault.createCommitmentToken(
            bob,
            charity,
            address(usdc),
            USDC_AMOUNT,
            block.timestamp + ONE_WEEK,
            "Read 5 books"
        );
    }
}

// ============ Transfer Failure Tests ============

contract TransferFailureTest is Test {
    CommitmentVault public vault;
    MockUSDC public usdc;
    RejectETH public rejectETH;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charity = makeAddr("charity");

    function setUp() public {
        vault = new CommitmentVault();
        usdc = new MockUSDC();
        rejectETH = new RejectETH();

        vm.deal(alice, 1000 ether);
    }

    function test_Approve_RevertTransferFailed_ETH() public {
        // Create commitment with rejectETH as creator
        vm.deal(address(rejectETH), 100 ether);
        
        vm.prank(address(rejectETH));
        uint256 id = vault.createCommitmentETH{value: 10 ether}(
            bob,
            makeAddr("charity"),
            block.timestamp + 1 weeks,
            "Test"
        );

        vm.prank(address(rejectETH));
        vault.confirmCompletion(id);

        // Approve should fail because rejectETH can't receive ETH
        vm.prank(bob);
        vm.expectRevert(CommitmentVault.TransferFailed.selector);
        vault.approve(id);
    }

    function test_Reject_RevertTransferFailed_ETH() public {
        vm.prank(alice);
        uint256 id = vault.createCommitmentETH{value: 10 ether}(
            bob,
            address(rejectETH), // charity that rejects ETH
            block.timestamp + 1 weeks,
            "Test"
        );

        vm.prank(alice);
        vault.confirmCompletion(id);

        vm.prank(bob);
        vm.expectRevert(CommitmentVault.TransferFailed.selector);
        vault.reject(id);
    }

    function test_ResolveExpired_RevertTransferFailed_ETH() public {
        vm.prank(alice);
        uint256 id = vault.createCommitmentETH{value: 10 ether}(
            bob,
            address(rejectETH),
            block.timestamp + 1 weeks,
            "Test"
        );

        vm.warp(block.timestamp + 2 weeks);

        vm.expectRevert(CommitmentVault.TransferFailed.selector);
        vault.resolveExpired(id);
    }

    function test_Approve_RevertTransferFailed_Token() public {
        FailingTransferToken failToken = new FailingTransferToken();
        failToken.mint(alice, 100 * 10**6);
        
        vm.prank(alice);
        failToken.approve(address(vault), type(uint256).max);

        vm.prank(alice);
        uint256 id = vault.createCommitmentToken(
            bob,
            charity,
            address(failToken),
            100 * 10**6,
            block.timestamp + 1 weeks,
            "Test"
        );

        vm.prank(alice);
        vault.confirmCompletion(id);

        // Approve should fail because token transfer fails
        vm.prank(bob);
        vm.expectRevert(CommitmentVault.TransferFailed.selector);
        vault.approve(id);
    }
}

// Helper contract that rejects ETH
contract RejectETH {
    receive() external payable {
        revert("No ETH accepted");
    }

    fallback() external payable {
        revert("No ETH accepted");
    }
}

// Helper token that returns false on transferFrom
contract FailingToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address, uint256) external pure returns (bool) {
        return false;
    }

    function transferFrom(address, address, uint256) external pure returns (bool) {
        return false; // Always fail
    }
}

// Token that works on transferFrom but fails on transfer (for testing approve/reject)
contract FailingTransferToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address, uint256) external pure returns (bool) {
        return false; // Fails on transfer (used in _transferFunds)
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true; // Works on transferFrom
    }
}
