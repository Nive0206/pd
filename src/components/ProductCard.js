import { Link } from "react-router-dom";

const ProductCard = ({ product, category }) => {
  return (
    <Link to={`/${category}/${product.id}`}>
      <div className="product-card">
        <img src={product.image} alt={product.name} />
        <h2>{product.name}</h2>
        <p>Price: ${product.price}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
