// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VidaSUSAudit
 * @notice Protótipo de auditoria imutável de agendamentos para o VidaSUS.
 *         CPF armazenado como hash (bytes32) por motivo de LGPD.
 *         NUNCA adequado para dados clínicos em si — apenas trilha de auditoria.
 */
contract VidaSUSAudit {
    struct Appointment {
        uint256 id;
        bytes32 cpfHash;
        string especialidade;
        uint256 timestamp;
        address bookedBy;
    }

    mapping(uint256 => Appointment) public appointments;
    uint256[] public appointmentIds;

    event AppointmentBooked(uint256 indexed id, string especialidade, uint256 timestamp);
    event AppointmentCancelled(uint256 indexed id, uint256 timestamp);

    function bookAppointment(uint256 _id, bytes32 _cpfHash, string memory _especialidade) public {
        require(appointments[_id].timestamp == 0, "ja existe");
        appointments[_id] = Appointment(_id, _cpfHash, _especialidade, block.timestamp, msg.sender);
        appointmentIds.push(_id);
        emit AppointmentBooked(_id, _especialidade, block.timestamp);
    }

    function cancelAppointment(uint256 _id) public {
        require(appointments[_id].timestamp != 0, "nao existe");
        emit AppointmentCancelled(_id, block.timestamp);
        // Agendamento NAO removido: audit trail imutavel.
    }

    function totalAppointments() public view returns (uint256) {
        return appointmentIds.length;
    }
}
