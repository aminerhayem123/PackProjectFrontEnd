import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';  // Importing delete icon from React-icons (example)

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
} from '@coreui/react';
import {
  Button,
  Modal,
  Form,
  Image,
  Row,
  Col,
  Dropdown, 
  ButtonGroup,
} from 'react-bootstrap';
import PackStatusCell from './PackStatusCell';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown,faArrowLeft,faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useMemo } from 'react';
import { Trash } from 'react-bootstrap-icons';
import AddImageModal from './AddImageModal'
import avatar1 from 'src/assets/images/avatars/1.jpg';
import ReactPaginate from 'react-paginate';
import  '../items/items.css';

const Packs = (hideActions, hideSearch ) => {
  const formatDate = (date) => {
    // Format options for date and time
    const optionsDate = {
      day: '2-digit', // Two-digit day (01, 02, ..., 31)
      month: '2-digit', // Two-digit month (01, 02, ..., 12)
      year: '2-digit' // Two-digit year (e.g., 21 for 2021)
    };

    const optionsTime = {
      hour: '2-digit', // Two-digit hour (00 through 23)
      minute: '2-digit' // Two-digit minute (00 through 59)
    };

    // Format date and time separately
    const formattedDate = date.toLocaleString('en-GB', optionsDate);
    const formattedTime = date.toLocaleString('en-US', optionsTime); // Adjust locale as needed

    // Concatenate date and time with a hyphen
    return `${formattedDate} - ${formattedTime}`;
  };
  const [showModal, setShowModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'price', direction: 'ascending' });
  const [packs, setPacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false); // State for image modal
  const [modalImages, setModalImages] = useState([]); // State to hold images for modal display
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleAmount, setSaleAmount] = useState('');
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [selectedPackPrice, setSelectedPackPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const packsPerPage = 10; // Number of packs to display per page
  const [formData, setFormData] = useState({
    brand: '',
    numberOfItems: 1,
    images: [],
    price: '',
    category: '',
  });
  const [newItemData, setNewItemData] = useState({
    packId: '',
    name: ''
  });
  const [selectedImageIds, setSelectedImageIds] = useState([]); // State to hold IDs of selected images to delete

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const response = await fetch('http://localhost:5000/packs');
        const data = await response.json();
        setPacks(data);
      } catch (error) {
        console.error('Error fetching packs:', error);
      }
    };

    fetchPacks();
    fetchCategories();
  }, []);


  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/categories');
      const categoriesData = response.data;

      setCategories(categoriesData); // Assuming categoriesData is an array of strings
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFormChangeCat = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    // Always show dropdown if there are categories available
    if (value.trim() === '') {
      setShowDropdown(true); // Show dropdown if input is empty
    } else {
      setShowDropdown(categories.includes(value)); // Show dropdown if category exists
    }
  };
  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    setShowDropdown(false);
  };
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedPacks = useMemo(() => {
    const sortablePacks = [...packs];
    if (sortConfig.key === 'price') {
      sortablePacks.sort((a, b) => {
        if (sortConfig.direction === 'ascending') {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });
    } else if (sortConfig.key === 'date') {
      sortablePacks.sort((a, b) => {
        const dateA = new Date(a.created_date);
        const dateB = new Date(b.created_date);
        if (sortConfig.direction === 'ascending') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }
    return sortablePacks;
  }, [packs, sortConfig]);
  
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, '']
    });
  };

  const handleItemChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handleDrop = (acceptedFiles) => {
    setFormData({
      ...formData,
      images: [...formData.images, ...acceptedFiles]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('brand', formData.brand);
    data.append('price', formData.price);
    data.append('numberOfItems', formData.numberOfItems);
    data.append('category', formData.category);

    // Append images as files
    formData.images.forEach((image, index) => {
      data.append('images', image); // Assuming 'image' is a File object
    });

    try {
      const response = await axios.post('http://localhost:5000/packs', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      window.location.reload();
      console.log('Pack creation response:', response.data);
      fetchPacks(); // Update pack list
      setFormData({
        brand: '',
        numberOfItems: 1,
        images: [],
        price: '',
        category: '' // Clear category input
      });
    } catch (error) {
      console.error('Error creating pack:', error);
    }
  };

  const handleAddNewItem = async (e) => {
    e.preventDefault();
    try {
      // Ensure newItemData.packId is set correctly before proceeding
      if (!newItemData.packId) {
        console.error('Pack ID is missing.');
        return;
      }
  
      // Send the POST request to add a new item
      await axios.post(`http://localhost:5000/packs/${newItemData.packId}/items`, { name: newItemData.name });
      window.location.reload();
      // Refresh the packs list after adding the new item
      fetchPacks();
      
      // Reset the form and modal state
      setShowItemForm(false);
      setNewItemData({ packId: '', name: '' });
    } catch (error) {
      console.error('Error adding new item:', error);
    }
  };
  

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/items/${itemId}`);
      fetchPacks(); // Refresh the list after deletion
      window.location.reload();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleShowImages = (images) => {
    setModalImages(images);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setModalImages([]);
    setSelectedImageIds([]); // Clear selected image IDs on modal close
  };

  const handleImageSelect = (index) => {
    setSelectedImageIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(modalImages[index].id)) {
        return prevSelectedIds.filter((id) => id !== modalImages[index].id);
      } else {
        return [...prevSelectedIds, modalImages[index].id];
      }
    });
  };

  const handleDeleteSelectedImages = async () => {
    try {
      await axios.delete(`http://localhost:5000/images/delete`, {
        data: { imageIds: selectedImageIds }, // Pass array of selected image IDs to delete
      });
  
      // Remove selected images from modalImages state
      const updatedImages = modalImages.filter((image) => !selectedImageIds.includes(image.id));
      setModalImages(updatedImages);
      window.location.reload();
      setSelectedImageIds([]); // Clear selected image IDs after deletion
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  };  

  const { getRootProps, getInputProps } = useDropzone({ onDrop: handleDrop });

  // Function to render the delete button
  const renderDeleteButton = () => {
    if (selectedImageIds.length > 0) {
      return (
        <Button variant="danger" onClick={handleDeleteSelectedImages}>
          Delete Selected Images
        </Button>
      );
    }
    return null;
  };

  const filteredPacks = useMemo(() => {
    let filteredData = sortedPacks;
    // Filter by search input
    if (searchFilter) {
      const lowercasedFilter = searchFilter.toLowerCase();
      filteredData = filteredData.filter(pack => {
        // Check for existence of each property before accessing them
        const brand = pack.brand && pack.brand.toLowerCase();
        const category = pack.category && pack.category.toString().toLowerCase();
        const price = pack.price && pack.price.toString().toLowerCase();
        const numberOfItems = pack.NumberofItems && pack.NumberofItems.toString().toLowerCase();
        const id = pack.id && pack.id.toString().toLowerCase();
  
        return (
          (brand && brand.includes(lowercasedFilter)) ||
          (category && category.includes(lowercasedFilter)) ||
          (price && price.includes(lowercasedFilter)) ||
          (numberOfItems && numberOfItems.includes(lowercasedFilter)) ||
          (id && id.includes(lowercasedFilter))
        );
      });
    }
    return filteredData;
  }, [sortedPacks,searchFilter]);
  
  const handleSold = (packId, packPrice) => {
    setSelectedPackId(packId);
    setSelectedPackPrice(packPrice);
    setShowSaleModal(true);
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    if (Number(saleAmount) < selectedPackPrice) {
      setErrorMessage('Amount value should be bigger or equal to price.');
      return;
    }
    const profit = saleAmount - selectedPackPrice;
  
    try {
      const response = await axios.post(`http://localhost:5000/packs/${selectedPackId}/sold`, {
        amount: saleAmount,
        profit: profit,
      });
      window.location.reload();
      console.log('Sale recorded successfully:', response.data);
  
      // Close the modal after submitting
      setShowSaleModal(false);
  
      // Refresh packs data
      fetchPacks();
    } catch (error) {
      console.error('Error recording sale:', error);
    }
  };

// Function to handle adding images to a pack
const handleAddImages = (packId) => {
  setSelectedPackId(packId); // Set the selected pack ID
  setShowModal(true); // Show the image modal
};
const handleCloseModal = () => {
  setShowModal(false); // Close the modal
  setSelectedPackId(null); // Reset selected pack ID
};

const handleSaleAmountChange = (e) => {
  const value = e.target.value;

  if (!isNaN(value) && Number(value) >= 0) {
    setSaleAmount(value);
    setErrorMessage(''); // Clear error message on valid input
  } else {
    setErrorMessage('Invalid amount entered.'); // Display error for invalid input
  }
};

const handlePageClick = (data) => {
  setCurrentPage(data.selected);
};
// Calculate offset for pagination
const offset = currentPage * packsPerPage;
const currentPacks = useMemo(() => filteredPacks.slice(offset, offset + packsPerPage), [filteredPacks, currentPage]);

  return (
    <>
    {!hideSearch && (
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Button variant="primary" onClick={() => setShowForm(true)} className="mb-2">
        <i className="fas fa-box"></i> Add Pack
        </Button>
          <div className="flex-grow-1 ms-3">
            <Form.Control
              type="text"
              placeholder="Filter by Brand or Pack ID"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ width: '250px' }} // Adjust width as needed
            />
          </div>
      </div>
      )}
      <CCard className="mb-4">
        <CCardHeader>Packs</CCardHeader>
        <CCardBody>
        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
            <CTableHeaderCell className="bg-body-tertiary">Brands Ids</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Brands Names</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Category</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Status</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Number of Items</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Images</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('price')}>
                Price
                {sortConfig.key === 'price' && (
                  <FontAwesomeIcon
                  icon={sortConfig.key === 'price' ? (sortConfig.direction === 'ascending' ? faCaretUp : faCaretDown) : (sortConfig.direction === 'ascending' ? faSortUp : faSortDown)}
                  className="ms-2"
                />
                )}
              </CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('date')}>
                Date
                {sortConfig.key === 'date' && (
                  <FontAwesomeIcon
                    icon={sortConfig.direction === 'ascending' ? faSortUp : faSortDown}
                    className="ms-2"
                  />
                )}
              </CTableHeaderCell>
              {!hideSearch && (<CTableHeaderCell className="bg-body-tertiary">Actions</CTableHeaderCell>)}
            </CTableRow>
          </CTableHead>
          <CTableBody>
          {currentPacks.map((pack, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{pack.id}</CTableDataCell>
                <CTableDataCell>{pack.brand}</CTableDataCell>
                <CTableDataCell>{pack.category}</CTableDataCell>
                <PackStatusCell status={pack.status} />
                <CTableDataCell>{pack.number_of_items !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>{pack.number_of_items} items</span>
                      </div>
                    ) : (
                      <span>No items</span>
                    )}
                </CTableDataCell>
                <CTableDataCell>
                  <Button
                    variant="primary"
                    onClick={() => handleShowImages(pack.images)}
                  >
                     <i className="fas fa-image" style={{ marginRight: '2px' }}></i>
                  </Button>
                </CTableDataCell>
                <CTableDataCell>{pack.price}</CTableDataCell>
                <CTableDataCell>{formatDate(new Date(pack.created_date))}</CTableDataCell>
                {!hideSearch && ( <CTableDataCell>
                    <Dropdown as={ButtonGroup} style={{ marginLeft: '4px' }} drop="end">
                      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                        <i className="fas fa-ellipsis-v"></i>
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => {
                            setNewItemData({ packId: pack.id, name: '' });
                            setShowItemForm(true);
                          }}
                        >
                          <i className="fas fa-plus" style={{ marginRight: '4px' }}></i> Add Item
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSold(pack.id, pack.price)}>
                          <i className="fas fa-dollar-sign" style={{ marginRight: '4px' }}></i> Sold
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleAddImages(pack.id)}>
                          <i className="fas fa-image" style={{ marginRight: '4px' }}></i> Add Images
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </CTableDataCell>
                )}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        <div className="d-flex justify-content-end mt-3">
          <ReactPaginate
            previousLabel={<FontAwesomeIcon icon={faArrowLeft} />}
            nextLabel={<FontAwesomeIcon icon={faArrowRight} />}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={Math.ceil(filteredPacks.length / packsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            subContainerClassName={'pages pagination'}
            activeClassName={'active'}
          />
        </div>
        </CCardBody>
      </CCard>
      {/* Modal Add Images */}
      <AddImageModal
        show={showModal}
        onHide={handleCloseModal}
        packId={selectedPackId}
      />

      {/* Modal for Images */}
      <Modal show={showImageModal} onHide={handleCloseImageModal}>
        <Modal.Header closeButton>
          <Modal.Title>Images</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {modalImages.map((image, idx) => (
              <Col md={4} key={idx} className="mb-3">
                <Image
                  src={`data:image/jpeg;base64,${image.data}`}
                  thumbnail
                  onClick={() => handleImageSelect(idx)} // Select image on click
                  className={selectedImageIds.includes(image.id) ? 'border border-primary rounded' : 'rounded'}
                />
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {renderDeleteButton()}
          <Button variant="secondary" onClick={handleCloseImageModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Pack Modal */}
    <Modal show={showForm} onHide={() => setShowForm(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add Pack</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBrand">
            <Form.Label>Brand</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter brand"
              name="brand"
              value={formData.brand}
              onChange={handleFormChange}
              required
            />
            <br />
          </Form.Group>
          <Form.Group controlId="formPrice">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter price"
              name="price"
              value={formData.price}
              onChange={handleFormChange}
              required
            />
            <br />
          </Form.Group>
          <Form.Group controlId="formNumberOfItems">
            <Form.Label>Number of Items</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter number of items"
              name="numberOfItems"
              value={formData.numberOfItems}
              onChange={handleFormChange}
              required
            />
            <br />
          </Form.Group>
          <Form.Group controlId="formCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category"
              name="category"
              value={formData.category}
              onChange={handleFormChangeCat}
              onFocus={handleFocus}
              onBlur={handleBlur}
              list="categoryDropdown"
              required
            />
            {showDropdown && (
              <datalist id="categoryDropdown">
                {categories.map((cat, index) => (
                  <option key={index} value={cat} />
                ))}
              </datalist>
            )}
         </Form.Group>
          <br />
          <Form.Group controlId="formImages">
            <Form.Label>Images</Form.Label>
            <div
              style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', cursor: 'pointer', marginTop: '10px' }}
              {...getRootProps({ className: 'dropzone' })}
            >
              <input {...getInputProps()} />
              <p>Import Pictures</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                {formData.images.map((file, index) => (
                  <div
                    key={index}
                    style={{ width: '100px', height: '100px', marginRight: '10px', marginBottom: '10px', position: 'relative' }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview-${index}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }}
                    />
                  </div>
                ))}
              </div>
              {formData.images.length > 0 && (
                <Button variant="outline-danger" onClick={() => setFormData({ ...formData, images: [] })} style={{ marginTop: '10px' }}>
                  Clear Images
                </Button>
              )}
            </div>
          </Form.Group>
          <br />
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>


      {/* Add Item Modal */}
      <Modal show={showItemForm} onHide={() => setShowItemForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddNewItem}>
            <Form.Group controlId="formItemName">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter item name"
                value={newItemData.name}
                onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                required
              />
            </Form.Group>
            <br></br>
            <Button variant="primary" type="submit">
              Add Item
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
       {/* Modal for marking pack as sold */}
       <Modal show={showSaleModal} onHide={() => setShowSaleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sold</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaleSubmit}>
            <Form.Group controlId="amount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={saleAmount}
                onChange={handleSaleAmountChange}
                required
              />
              {errorMessage && <Form.Text className="text-danger">{errorMessage}</Form.Text>}
            </Form.Group>
            <br></br>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Packs;
