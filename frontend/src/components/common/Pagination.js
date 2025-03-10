import React from 'react';
import { Pagination as BsPagination } from 'react-bootstrap';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageItems = () => {
    const items = [];

    // Previous button
    items.push(
      <BsPagination.Prev
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    // First page
    items.push(
      <BsPagination.Item
        key={1}
        active={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        1
      </BsPagination.Item>
    );

    // Ellipsis if needed
    if (currentPage > 3) {
      items.push(<BsPagination.Ellipsis key="ellipsis-1" disabled />);
    }

    // Pages around current page
    for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page++) {
      items.push(
        <BsPagination.Item
          key={page}
          active={currentPage === page}
          onClick={() => onPageChange(page)}
        >
          {page}
        </BsPagination.Item>
      );
    }

    // Ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(<BsPagination.Ellipsis key="ellipsis-2" disabled />);
    }

    // Last page if it exists
    if (totalPages > 1) {
      items.push(
        <BsPagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </BsPagination.Item>
      );
    }

    // Next button
    items.push(
      <BsPagination.Next
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="d-flex justify-content-center mt-4">
      <BsPagination>{renderPageItems()}</BsPagination>
    </div>
  );
};