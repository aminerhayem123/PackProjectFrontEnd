import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CInputGroup,
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPrint } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const Transactions = ({ hideActions, hideSearch }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/transactions');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const optionsDate = {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    };

    const optionsTime = {
      hour: '2-digit',
      minute: '2-digit'
    };

    const formattedDate = date.toLocaleString('en-GB', optionsDate);
    const formattedTime = date.toLocaleString('en-US', optionsTime);

    return `${formattedDate} - ${formattedTime}`;
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);

    const filtered = transactions.filter(transaction =>
      transaction.pack_id.toString().toLowerCase().includes(value) ||
      transaction.id.toString().toLowerCase().includes(value) ||
      transaction.sale_date.toLowerCase().includes(value) ||
      transaction.amount.toString().toLowerCase().includes(value) ||
      transaction.profit.toString().toLowerCase().includes(value)
    );

    setFilteredTransactions(filtered);
  };

  const handlePrint = (transaction) => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Company Name', 15, 15);

    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    doc.text(`Date and Time: ${formattedDate}`, 15, 25);
    doc.text(`Transaction ID: ${transaction.id}`, 15, 35);
    doc.text(`Sold Pack ID: ${transaction.pack_id}`, 15, 45);
    doc.text(`Amount: ${transaction.amount}`, 15, 55);
    doc.text(`Profit: ${transaction.profit}`, 15, 65);

    doc.save(`Transaction_${transaction.id}.pdf`);
  };

  const openModal = (transaction) => {
    setTransactionToDelete(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPassword('');
    setPasswordError('');
    setTransactionToDelete(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(''); // Clear any previous error on input change
  };

  const deleteTransaction = async () => {
    try {
      if (!transactionToDelete || !transactionToDelete.id) {
        console.error('TransactionToDelete or its ID is undefined');
        return;
      }
  
      const response = await fetch(`http://localhost:5000/transactions/${transactionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }), // Assuming 'password' state is set correctly
      });
  
      if (!response.ok) {
        // Handle error response codes
        if (response.status === 401) {
          const errorResponse = await response.json();
          setPasswordError(errorResponse.message); // Display specific error message from backend
        } else {
          throw new Error('Network response was not ok');
        }
      } else {
        const result = await response.json(); // Assuming backend returns a result
        if (result.success) {
          // Update state or perform necessary actions after successful deletion
          const updatedTransactions = transactions.filter(t => t.id !== transactionToDelete.id);
          setTransactions(updatedTransactions);
          setFilteredTransactions(updatedTransactions);
          setShowModal(false);
        } else {
          // Handle other scenarios based on backend response
          console.error('Error deleting transaction:', result.message);
        }
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };
  

  return (
    <CCard className="mb-4">
      <CCardHeader>Transactions</CCardHeader>
      <CCardBody>
      {!hideSearch && (
        <CInputGroup className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Sale Date, Amount, or Profit"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </CInputGroup>
          )}
        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Pack ID</CTableHeaderCell>
              <CTableHeaderCell>Sale Date</CTableHeaderCell>
              <CTableHeaderCell>Amount</CTableHeaderCell>
              <CTableHeaderCell>Profit</CTableHeaderCell>
              {!hideActions && <CTableHeaderCell>Actions</CTableHeaderCell>}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredTransactions.map((transaction) => (
              <CTableRow key={transaction.id}>
                <CTableDataCell>{transaction.id}</CTableDataCell>
                <CTableDataCell>{transaction.pack_id}</CTableDataCell>
                <CTableDataCell>{formatDate(transaction.sale_date)}</CTableDataCell>
                <CTableDataCell>{transaction.amount}</CTableDataCell>
                <CTableDataCell>{transaction.profit}</CTableDataCell>
                {!hideActions && (
                <CTableDataCell>
                  <CButton color="danger" onClick={() => openModal(transaction)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </CButton>
                  <CButton color="info" className="ml-2" onClick={() => handlePrint(transaction)}>
                    <FontAwesomeIcon icon={faPrint} />
                  </CButton>
                </CTableDataCell>
                 )}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {/* Modal for delete confirmation */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Transaction</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this transaction?</p>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="text" // Use password type for secure input
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password..."
                isInvalid={passwordError !== ''}
              />
              <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="danger" onClick={deleteTransaction}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </CCardBody>
    </CCard>
  );
};

export default Transactions;
