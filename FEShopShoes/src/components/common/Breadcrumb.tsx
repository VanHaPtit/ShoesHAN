
import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-6">
      <Link to="/" className="hover:text-[#0F172A] hover:underline">Trang chủ</Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <span>/</span>
          {item.path ? (
            <Link to={item.path} className="hover:text-[#0F172A] hover:underline">{item.label}</Link>
          ) : (
            <span className="text-[#0F172A]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
