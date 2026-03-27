export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden
        ${hover ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200' : 'shadow-sm'}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Image = function CardImage({ src, alt, className = '' }) {
  return (
    <div className={`aspect-[4/3] overflow-hidden bg-gray-100 ${className}`}>
      <img
        src={src || '/placeholder.svg'}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'Item')}&background=d1fae5&color=065f46&size=400`;
        }}
      />
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
};
