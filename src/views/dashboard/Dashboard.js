import React, { useState, useEffect, useMemo } from 'react';
import {
  CCard,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CCardHeader
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown,faArrowLeft,faArrowRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import WidgetsDropdown from '../widgets/WidgetsDropdown';
import Transactions from '../pages/Transactions/Transactions'; // Adjust the path as per your folder structure
import ReactPaginate from 'react-paginate'; // Import ReactPaginate

const Dashboard = ({ handleLogout }) => {
  const [packs, setPacks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'price', direction: 'ascending' });
  const [aggregatedPacks, setAggregatedPacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Add state for pagination
  const itemsPerPage = 10; // Number of items per page

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await axios.get('https://packprojectbackend-production.up.railway.app/packs');
      setPacks(response.data);
    } catch (error) {
      console.error('Error fetching packs:', error);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    const fetchAggregatedPacks = async () => {
      try {
        const response = await axios.get('https://packprojectbackend-production.up.railway.app/aggregated-packs');
        setAggregatedPacks(response.data);
      } catch (error) {
        console.error('Error fetching aggregated packs:', error);
      }
    };

    fetchAggregatedPacks();
  }, []);

  const sortedPacks = useMemo(() => {
    const sortablePacks = [...aggregatedPacks];
    if (sortConfig.key === 'price') {
      sortablePacks.sort((a, b) => (sortConfig.direction === 'ascending' ? a.price - b.price : b.price - a.price));
    } else if (sortConfig.key === 'date') {
      sortablePacks.sort((a, b) => {
        const dateA = new Date(a.created_date);
        const dateB = new Date(b.created_date);
        return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
      });
    }
    return sortablePacks;
  }, [aggregatedPacks, sortConfig]);

  const formatDate = (date) => {
    const options = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false // Use 24-hour format
    };
    return date.toLocaleString(undefined, options);
  };

  // Pagination Logic
  const offset = currentPage * itemsPerPage;
  const currentPacks = sortedPacks.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(sortedPacks.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4">
        <CCardHeader>Packs</CCardHeader>
        <CCardBody>
          <CTable align="middle" className="mb-0 border" hover responsive>
            <CTableHead className="text-nowrap">
              <CTableRow>
                <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('category')}>
                  Category
                </CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('number_of_packs')}>
                  Number of Packs
                </CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('number_of_items')}>
                  Number of Items
                </CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('packs_sold')}>
                  Packs Sold
                </CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('total_price')}>
                  Total Price
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentPacks.map((pack, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{pack.category}</CTableDataCell>
                  <CTableDataCell>{pack.number_of_packs}</CTableDataCell>
                  <CTableDataCell>{pack.number_of_items}</CTableDataCell>
                  <CTableDataCell>{pack.packs_sold}</CTableDataCell>
                  <CTableDataCell>{pack.total_price}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* Pagination aligned to the right */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
            <ReactPaginate
              previousLabel={<FontAwesomeIcon icon={faArrowLeft} />}
              nextLabel={<FontAwesomeIcon icon={faArrowRight} />}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={pageCount}
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
      {/* Transactions Table */}
      <Transactions hideActions={true} hideSearch={true} />
    </>
  );
};

export default Dashboard;
