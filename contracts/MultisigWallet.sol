// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultisigWallet {
    address[] public approvers;
    mapping(address => bool) public isApprover;

    event Deposit(address indexed sender, uint256 amount);
    event Submission(
        uint256 indexed transferIndex,
        address indexed to,
        uint256 amount,
        string description
    );
    event Confirmation(address indexed sender, uint256 indexed transferIndex);
    event Execution(uint256 indexed transferIndex, address indexed sender);

    struct Transfer {
        uint256 id;
        string description;
        address payable to;
        uint256 amount;
        bool sent;
        uint256 approvalsCount;
    }

    Transfer[] public transfers;

    mapping(address => mapping(uint256 => bool)) public approvals;

    uint256 public quorum;

    modifier onlyApprover() {
        require(isApprover[msg.sender], "Only an approver is allowed");
        _;
    }

    modifier transferExists(uint256 _id) {
        require(_id < transfers.length, "Transfer does not exist");
        _;
    }

    modifier notSent(uint256 _id) {
        require(!transfers[_id].sent, "Transfer already sent");
        _;
    }

    modifier notConfirmed(uint256 _id) {
        require(
            !approvals[msg.sender][_id],
            "Address already confirmed this transfer"
        );
        _;
    }

    constructor(address[] memory _approvers, uint256 _quorum) {
        require(_approvers.length > 0, "Approvers required");
        require(_quorum > 0 && _quorum <= _approvers.length, "Invalid quorum");

        for (uint256 i = 0; i < _approvers.length; i++) {
            address approver = _approvers[i];
            require(approver != address(0), "Invalid approver");
            require(!isApprover[approver], "Duplicate approver");

            isApprover[approver] = true;
            approvers.push(approver);
        }

        quorum = _quorum;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function createTransfer(
        address payable _to,
        uint256 _amount,
        string memory _description
    ) external onlyApprover {
        uint256 transferIndex = transfers.length;

        transfers.push(
            Transfer({
                id: transferIndex,
                description: _description,
                to: _to,
                amount: _amount,
                sent: false,
                approvalsCount: 0
            })
        );
        emit Submission(transferIndex, _to, _amount, _description);
    }

    function approveTransfer(
        uint256 _id
    ) external onlyApprover transferExists(_id) notConfirmed(_id) {
        Transfer storage transfer = transfers[_id];

        approvals[msg.sender][_id] = true;
        transfer.approvalsCount++;

        emit Confirmation(msg.sender, _id);

        if (transfer.approvalsCount >= quorum) {
            executeTransfer(_id);
        }
    }

    function getTransferCount() external view returns (uint256) {
        return transfers.length;
    }

    function getApprovers() external view returns (address[] memory) {
        return approvers;
    }

    function executeTransfer(
        uint256 _id
    ) private transferExists(_id) notSent(_id) returns (bool) {
        Transfer storage transfer = transfers[_id];
        transfer.sent = true;

        if (address(this).balance >= transfer.amount) {
            if (transfer.to.send(transfer.amount)) {
                emit Execution(_id, msg.sender);
                return true;
            } else {
                // Rollback changes if the transfer fails
                transfer.sent = false;
                return false;
            }
        }

        // Rollback changes if there is insufficient contract balance
        transfer.sent = false;
        revert(
            "Transfer reverted. Insufficient contract balance for transfer."
        );
    }
}
