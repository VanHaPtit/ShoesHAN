import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/format';
import * as React from 'react';

interface Props {
  product: Product;
  key?: React.Key;
}

const ProductCard = ({ product }: Props) => {
  const displayImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://via.placeholder.com/300';

  return (
    <Link to={`/product/${product.id}`} className="group space-y-3 block">
      <div className="bg-[#f5f5f5] aspect-square overflow-hidden relative">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.salePrice && product.salePrice < product.basePrice && (
          <div className="absolute bottom-0 left-0 bg-white px-2 py-1 text-[10px] font-bold text-red-600">
            -{Math.round((1 - product.salePrice / product.basePrice) * 100)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium uppercase tracking-tight group-hover:underline">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 italic uppercase">
          {product.category?.name || 'Sản phẩm'}
        </p>
        <div className="flex items-center space-x-2">
          <span className={`font-bold ${product.salePrice ? 'text-red-600' : 'text-[#0F172A]'}`}>
            {formatCurrency(product.salePrice || product.basePrice)}
          </span>
          {product.salePrice && (
            <span className="text-gray-400 line-through text-xs">
              {formatCurrency(product.basePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
