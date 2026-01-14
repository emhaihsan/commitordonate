// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "../lib/forge-std/src/interfaces/IERC20.sol";

/// @title CommitmentVault
/// @notice A commitment contract where users stake funds that are either refunded on success or donated on failure
/// @dev Supports both native ETH and ERC20 tokens (e.g., mockUSDC)
contract CommitmentVault {
    // ============ Enums ============

    enum Status {
        CREATED,
        CONFIRMED,
        RESOLVED
    }

    enum Outcome {
        PENDING,
        SUCCESS,
        FAILURE
    }

    // ============ Structs ============

    struct Commitment {
        address creator;
        address validator;
        address charity;
        address token; // address(0) for ETH
        uint256 amount;
        uint256 deadline;
        uint256 confirmationTime;
        uint256 validatorDeadline;
        string description;
        Status status;
        Outcome outcome;
    }

    // ============ Constants ============

    uint256 public constant VALIDATOR_WINDOW = 24 hours;

    // ============ State Variables ============

    uint256 public commitmentCounter;
    mapping(uint256 => Commitment) public commitments;
    mapping(address => uint256[]) public userCommitments;
    mapping(address => uint256[]) public validatorCommitments;

    // ============ Events ============

    event CommitmentCreated(
        uint256 indexed commitmentId,
        address indexed creator,
        address indexed validator,
        address charity,
        address token,
        uint256 amount,
        uint256 deadline,
        string description
    );

    event CommitmentConfirmed(
        uint256 indexed commitmentId,
        address indexed creator,
        uint256 validatorDeadline
    );

    event CommitmentResolved(
        uint256 indexed commitmentId,
        Outcome outcome,
        address recipient,
        uint256 amount
    );

    // ============ Errors ============

    error InvalidValidator();
    error InvalidCharity();
    error InvalidAmount();
    error InvalidDeadline();
    error InvalidCommitmentId();
    error NotCreator();
    error NotValidator();
    error WrongStatus();
    error DeadlineNotPassed();
    error DeadlinePassed();
    error ValidatorWindowNotPassed();
    error TransferFailed();
    error IncorrectETHAmount();

    // ============ Modifiers ============

    modifier validCommitment(uint256 commitmentId) {
        if (commitmentId == 0 || commitmentId > commitmentCounter) {
            revert InvalidCommitmentId();
        }
        _;
    }

    modifier onlyCreator(uint256 commitmentId) {
        if (commitments[commitmentId].creator != msg.sender) {
            revert NotCreator();
        }
        _;
    }

    modifier onlyValidator(uint256 commitmentId) {
        if (commitments[commitmentId].validator != msg.sender) {
            revert NotValidator();
        }
        _;
    }

    modifier inStatus(uint256 commitmentId, Status expectedStatus) {
        if (commitments[commitmentId].status != expectedStatus) {
            revert WrongStatus();
        }
        _;
    }

    // ============ External Functions ============

    /// @notice Create a new commitment with ETH stake
    /// @param validator Address that will validate completion
    /// @param charity Address that receives funds on failure
    /// @param deadline Unix timestamp by which user must confirm completion
    /// @param description Description of the commitment
    /// @return commitmentId The ID of the created commitment
    function createCommitmentETH(
        address validator,
        address charity,
        uint256 deadline,
        string calldata description
    ) external payable returns (uint256 commitmentId) {
        if (validator == address(0) || validator == msg.sender) {
            revert InvalidValidator();
        }
        if (charity == address(0)) {
            revert InvalidCharity();
        }
        if (msg.value == 0) {
            revert InvalidAmount();
        }
        if (deadline <= block.timestamp) {
            revert InvalidDeadline();
        }

        commitmentId = ++commitmentCounter;

        commitments[commitmentId] = Commitment({
            creator: msg.sender,
            validator: validator,
            charity: charity,
            token: address(0),
            amount: msg.value,
            deadline: deadline,
            confirmationTime: 0,
            validatorDeadline: 0,
            description: description,
            status: Status.CREATED,
            outcome: Outcome.PENDING
        });

        userCommitments[msg.sender].push(commitmentId);
        validatorCommitments[validator].push(commitmentId);

        emit CommitmentCreated(
            commitmentId,
            msg.sender,
            validator,
            charity,
            address(0),
            msg.value,
            deadline,
            description
        );
    }

    /// @notice Create a new commitment with ERC20 token stake
    /// @param validator Address that will validate completion
    /// @param charity Address that receives funds on failure
    /// @param token ERC20 token address
    /// @param amount Amount of tokens to stake
    /// @param deadline Unix timestamp by which user must confirm completion
    /// @param description Description of the commitment
    /// @return commitmentId The ID of the created commitment
    function createCommitmentToken(
        address validator,
        address charity,
        address token,
        uint256 amount,
        uint256 deadline,
        string calldata description
    ) external returns (uint256 commitmentId) {
        if (validator == address(0) || validator == msg.sender) {
            revert InvalidValidator();
        }
        if (charity == address(0)) {
            revert InvalidCharity();
        }
        if (token == address(0)) {
            revert InvalidAmount();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }
        if (deadline <= block.timestamp) {
            revert InvalidDeadline();
        }

        // Transfer tokens to this contract
        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert TransferFailed();
        }

        commitmentId = ++commitmentCounter;

        commitments[commitmentId] = Commitment({
            creator: msg.sender,
            validator: validator,
            charity: charity,
            token: token,
            amount: amount,
            deadline: deadline,
            confirmationTime: 0,
            validatorDeadline: 0,
            description: description,
            status: Status.CREATED,
            outcome: Outcome.PENDING
        });

        userCommitments[msg.sender].push(commitmentId);
        validatorCommitments[validator].push(commitmentId);

        emit CommitmentCreated(
            commitmentId,
            msg.sender,
            validator,
            charity,
            token,
            amount,
            deadline,
            description
        );
    }

    /// @notice User confirms they have completed the commitment
    /// @param commitmentId The ID of the commitment
    function confirmCompletion(uint256 commitmentId)
        external
        validCommitment(commitmentId)
        onlyCreator(commitmentId)
        inStatus(commitmentId, Status.CREATED)
    {
        Commitment storage c = commitments[commitmentId];
        
        if (block.timestamp > c.deadline) {
            revert DeadlinePassed();
        }

        c.status = Status.CONFIRMED;
        c.confirmationTime = block.timestamp;
        c.validatorDeadline = block.timestamp + VALIDATOR_WINDOW;

        emit CommitmentConfirmed(commitmentId, msg.sender, c.validatorDeadline);
    }

    /// @notice Validator approves the commitment (success path)
    /// @param commitmentId The ID of the commitment
    function approve(uint256 commitmentId)
        external
        validCommitment(commitmentId)
        onlyValidator(commitmentId)
        inStatus(commitmentId, Status.CONFIRMED)
    {
        Commitment storage c = commitments[commitmentId];
        
        if (block.timestamp > c.validatorDeadline) {
            revert DeadlinePassed();
        }

        c.status = Status.RESOLVED;
        c.outcome = Outcome.SUCCESS;

        _transferFunds(c.token, c.creator, c.amount);

        emit CommitmentResolved(commitmentId, Outcome.SUCCESS, c.creator, c.amount);
    }

    /// @notice Validator rejects the commitment (failure path)
    /// @param commitmentId The ID of the commitment
    function reject(uint256 commitmentId)
        external
        validCommitment(commitmentId)
        onlyValidator(commitmentId)
        inStatus(commitmentId, Status.CONFIRMED)
    {
        Commitment storage c = commitments[commitmentId];
        
        if (block.timestamp > c.validatorDeadline) {
            revert DeadlinePassed();
        }

        c.status = Status.RESOLVED;
        c.outcome = Outcome.FAILURE;

        _transferFunds(c.token, c.charity, c.amount);

        emit CommitmentResolved(commitmentId, Outcome.FAILURE, c.charity, c.amount);
    }

    /// @notice Resolve a commitment that missed its deadline or validator window
    /// @dev Anyone can call this to trigger auto-donation
    /// @param commitmentId The ID of the commitment
    function resolveExpired(uint256 commitmentId)
        external
        validCommitment(commitmentId)
    {
        Commitment storage c = commitments[commitmentId];
        
        if (c.status == Status.RESOLVED) {
            revert WrongStatus();
        }

        bool canResolve = false;

        // Case 1: User missed confirmation deadline
        if (c.status == Status.CREATED && block.timestamp > c.deadline) {
            canResolve = true;
        }
        // Case 2: Validator window expired (silence = failure)
        else if (c.status == Status.CONFIRMED && block.timestamp > c.validatorDeadline) {
            canResolve = true;
        }

        if (!canResolve) {
            revert DeadlineNotPassed();
        }

        c.status = Status.RESOLVED;
        c.outcome = Outcome.FAILURE;

        _transferFunds(c.token, c.charity, c.amount);

        emit CommitmentResolved(commitmentId, Outcome.FAILURE, c.charity, c.amount);
    }

    // ============ View Functions ============

    /// @notice Get commitment details
    /// @param commitmentId The ID of the commitment
    /// @return The commitment struct
    function getCommitment(uint256 commitmentId)
        external
        view
        validCommitment(commitmentId)
        returns (Commitment memory)
    {
        return commitments[commitmentId];
    }

    /// @notice Get all commitment IDs for a user
    /// @param user The user address
    /// @return Array of commitment IDs
    function getUserCommitments(address user) external view returns (uint256[] memory) {
        return userCommitments[user];
    }

    /// @notice Get all commitment IDs where address is validator
    /// @param validator The validator address
    /// @return Array of commitment IDs
    function getValidatorCommitments(address validator) external view returns (uint256[] memory) {
        return validatorCommitments[validator];
    }

    /// @notice Check if a commitment can be resolved as expired
    /// @param commitmentId The ID of the commitment
    /// @return canResolve Whether the commitment can be resolved
    /// @return reason The reason (0 = cannot, 1 = missed deadline, 2 = validator timeout)
    function canResolveExpired(uint256 commitmentId)
        external
        view
        validCommitment(commitmentId)
        returns (bool canResolve, uint8 reason)
    {
        Commitment storage c = commitments[commitmentId];
        
        if (c.status == Status.RESOLVED) {
            return (false, 0);
        }

        if (c.status == Status.CREATED && block.timestamp > c.deadline) {
            return (true, 1);
        }

        if (c.status == Status.CONFIRMED && block.timestamp > c.validatorDeadline) {
            return (true, 2);
        }

        return (false, 0);
    }

    // ============ Internal Functions ============

    /// @dev Transfer ETH or ERC20 tokens
    function _transferFunds(address token, address to, uint256 amount) internal {
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            if (!success) {
                revert TransferFailed();
            }
        } else {
            bool success = IERC20(token).transfer(to, amount);
            if (!success) {
                revert TransferFailed();
            }
        }
    }
}
