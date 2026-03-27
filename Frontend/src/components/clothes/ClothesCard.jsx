import { Link } from 'react-router-dom';
import { Tag, MapPin } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const BADGE_VARIANT = {
  sell: 'primary',
  swap: 'accent',
  donate: 'success',
  auction: 'warning',
};

export default function ClothesCard({ item }) {
  return (
    <Link to={`/clothes/${item._id}`}>
      <Card hover>
        <Card.Image
          src={item.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=d1fae5&color=065f46&size=400`}
          alt={item.title}
        />
        <Card.Body>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">
              {item.title}
            </h3>
            <Badge variant={BADGE_VARIANT[item.listingType] || 'default'}>
              {item.listingType}
            </Badge>
          </div>
          <p className="text-lg font-bold text-primary-600 mb-2">
            {item.listingType === 'donate' ? 'Free' : `₹${item.price}`}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {item.category}
            </span>
            {item.location?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {item.location.city}
              </span>
            )}
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}
