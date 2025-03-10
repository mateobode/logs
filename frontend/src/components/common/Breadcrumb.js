import React from 'react';
import { Breadcrumb as BsBreadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const Breadcrumb = ({ items }) => {
  return (
    <BsBreadcrumb className="mb-4">
      <BsBreadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
        Dashboard
      </BsBreadcrumb.Item>
      {items.map((item, index) => (
        <BsBreadcrumb.Item
          key={index}
          active={index === items.length - 1}
          linkAs={index !== items.length - 1 ? Link : undefined}
          linkProps={index !== items.length - 1 ? { to: item.path } : undefined}
        >
          {item.label}
        </BsBreadcrumb.Item>
      ))}
    </BsBreadcrumb>
  );
};