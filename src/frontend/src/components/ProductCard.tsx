import type { Product } from "../backend.d";

const gradients = [
  "from-purple-500 to-indigo-600",
  "from-orange-400 to-red-500",
  "from-yellow-400 to-orange-500",
  "from-blue-400 to-purple-500",
  "from-green-400 to-teal-500",
  "from-pink-400 to-rose-500",
];

interface ProductCardProps {
  product: Product;
  index: number;
  onClick: (product: Product) => void;
}

export default function ProductCard({
  product,
  index,
  onClick,
}: ProductCardProps) {
  const gradient = gradients[index % gradients.length];
  const hasImage = product.imageUrl?.startsWith("/");

  return (
    <button
      type="button"
      data-ocid={`product.item.${index + 1}`}
      onClick={() => onClick(product)}
      className="flex flex-col rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 text-left w-full"
    >
      <div
        className={`relative w-full aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-3xl font-black opacity-80">
            {product.name.charAt(0)}
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            HOT
          </div>
        )}
      </div>
      <div className="p-2 bg-white">
        <p className="text-xs font-semibold text-gray-800 leading-tight truncate">
          {product.name}
        </p>
        <p className="text-xs font-bold text-orange-500 mt-0.5">
          ৳ {product.price.toString()} Tk
        </p>
      </div>
    </button>
  );
}
