import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { clothesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import LoadingScreen from '../components/ui/LoadingScreen';

const CATEGORIES = [
  { value: '', label: '-- Select Category --' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

const CONDITIONS = [
  { value: '', label: '-- Condition --' },
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'worn', label: 'Worn' },
];

const SIZES = [
  { value: '', label: '-- Size --' },
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'XXXL', label: 'XXXL' },
  { value: 'one-size', label: 'One Size' },
  { value: 'various', label: 'Various' },
];

const LISTING_TYPES = [
  { value: 'sell', label: 'For Sale' },
  { value: 'swap', label: 'For Swap' },
  { value: 'donate', label: 'Donate' },
  { value: 'auction', label: 'Auction' },
];

export default function ClothesFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    size: '',
    listingType: 'sell',
    tags: '',
    city: '',
    state: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        try {
          const res = await clothesAPI.getOne(id);
          const item = res.data.data;
          setForm({
            title: item.title || '',
            description: item.description || '',
            category: item.category || '',
            condition: item.condition || '',
            price: item.price || '',
            size: item.size || '',
            listingType: item.listingType || 'sell',
            tags: item.tags?.join(', ') || '',
            city: item.location?.city || '',
            state: item.location?.state || '',
          });
          setExistingImages(item.images || []);
        } catch (err) {
          toast.error('Failed to fetch item details');
          navigate('/clothes');
        } finally {
          setFetching(false);
        }
      };
      fetchItem();
    }
  }, [id, navigate, toast]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.condition) errs.condition = 'Condition is required';
    if (form.listingType !== 'donate' && (!form.price || Number(form.price) < 0))
      errs.price = 'Price is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('category', form.category);
      formData.append('condition', form.condition);
      formData.append('price', Number(form.price) || 0);
      formData.append('listingType', form.listingType);
      
      if (form.size) formData.append('size', form.size);
      
      if (form.tags.trim()) {
        form.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(tag => formData.append('tags', tag));
      }

      if (form.city) formData.append('location.city', form.city);
      if (form.state) formData.append('location.state', form.state);

      // Append files
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      // If editing and no new images, maybe keep old ones?
      // Backend updateClothesById currently replaces images if req.files exists.
      // If req.files is empty, it keeps existing images unless updates.images is provided.
      // So if imageFiles is empty, we don't append 'images', and backend keeps old ones.

      if (isEdit) {
        await clothesAPI.update(id, formData);
        toast.success('Listing updated!');
      } else {
        await clothesAPI.create(formData);
        toast.success('Item listed!');
      }
      navigate('/clothes');
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} listing`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingScreen message="Loading item details..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Listing' : 'List a New Item'}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4"
      >
        <Input
          label="Title"
          placeholder="e.g. Vintage Denim Jacket"
          value={form.title}
          onChange={set('title')}
          error={errors.title}
        />

        <Textarea
          label="Description"
          placeholder="Describe the item, including any flaws or special features..."
          value={form.description}
          onChange={set('description')}
          error={errors.description}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            options={CATEGORIES}
            value={form.category}
            onChange={set('category')}
            error={errors.category}
          />
          <Select
            label="Condition"
            options={CONDITIONS}
            value={form.condition}
            onChange={set('condition')}
            error={errors.condition}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Listing Type"
            options={LISTING_TYPES}
            value={form.listingType}
            onChange={set('listingType')}
          />
          <Input
            label="Price (₹)"
            type="number"
            min="0"
            placeholder="0"
            value={form.price}
            onChange={set('price')}
            error={errors.price}
            disabled={form.listingType === 'donate'}
          />
          <Select
            label="Size"
            options={SIZES}
            value={form.size}
            onChange={set('size')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="e.g. Mumbai"
            value={form.city}
            onChange={set('city')}
          />
          <Input
            label="State"
            placeholder="e.g. Maharashtra"
            value={form.state}
            onChange={set('state')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Images {isEdit && '(Adding new images will replace existing ones)'}
          </label>
          <div className="group relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full px-4 py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl group-hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-2">
              <div className="p-2 rounded-full bg-white shadow-sm">
                <Plus className="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
            </div>
          </div>

          {/* New Images Preview */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
              {imageFiles.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white text-red-500 shadow-sm cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Existing Images (if not replaced by new ones) */}
          {isEdit && imageFiles.length === 0 && existingImages.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Current Images</p>
              <div className="flex gap-2">
                {existingImages.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm transition-transform hover:scale-105" />
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Tags (comma-separated)"
          placeholder="vintage, cotton, summer"
          value={form.tags}
          onChange={set('tags')}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading} className="flex-1">
            {isEdit ? 'Update Listing' : 'Publish Listing'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
