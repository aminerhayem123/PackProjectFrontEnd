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
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import avatar from 'src/assets/images/avatars/1.jpg';

const Items = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null); // State for password error

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const itemsWithAvatars = data.map(item => ({
        ...item,
        avatar,
      }));
      setItems(itemsWithAvatars);
      setFilteredItems(itemsWithAvatars);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const deleteItem = async () => {
    try {
      const response = await fetch(`http://localhost:5000/items/${itemIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }), // Pass password in the request body
      });
  
      if (!response.ok) {
        // Check if response status is 401 (Unauthorized)
        if (response.status === 401) {
          setPasswordError('Incorrect password. Please try again.');
        } else {
          throw new Error('Network response was not ok');
        }
      }
  
      const result = await response.json(); // Assuming backend returns a result
      if (result.success) {
        setItems(items.filter(item => item.id !== itemIdToDelete));
        setFilteredItems(filteredItems.filter(item => item.id !== itemIdToDelete));
        setShowModal(false);
        window.location.reload();
      } else {
        // Handle other scenarios based on backend response
        console.error('Error deleting item:', result.message);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const filtered = items.filter(item =>
      item.id.toString().toLowerCase().includes(value.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const handleOpenModal = (id) => {
    setItemIdToDelete(id);
    setShowModal(true);
    setPassword(''); // Clear password input when opening modal
    setPasswordError(null); // Clear password error message
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPassword(''); // Clear password input when closing modal
    setPasswordError(null); // Clear password error message
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>Items</CCardHeader>
      <CCardBody>
        <CInputGroup className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by ID"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </CInputGroup>

        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
              <CTableHeaderCell className="bg-body-tertiary">ID</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Pack ID</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredItems.map((item) => (
              <CTableRow key={item.id}>
                <CTableDataCell>{item.id}</CTableDataCell>
                <CTableDataCell>{item.pack_id}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="danger" onClick={() => handleOpenModal(item.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this item?</p>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="text"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password..."
                isInvalid={passwordError} // Highlight input if there's a password error
              />
              <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="danger" onClick={deleteItem}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </CCardBody>
    </CCard>
  );
};

export default Items;
