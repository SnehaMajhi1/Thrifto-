const Donation = require('../models/Donation');
const User = require('../models/User');

const listDonations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      donor
    } = req.query;

    const query = {};

    // Admin can see all, users can only see their own
    if (req.userRole !== 'admin') {
      query.donor = req.userId;
    } else if (donor) {
      query.donor = donor;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donations, total] = await Promise.all([
      Donation.find(query)
        .populate('donor', 'name email phone')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 }),
      Donation.countDocuments(query)
    ]);

    return res.status(200).json({
      data: donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('List donations error:', error);
    return res.status(500).json({ message: 'Failed to fetch donations' });
  }
};

const createDonation = async (req, res) => {
  try {
    let donationData = req.body;

    // Handle FormData parsing
    if (typeof donationData.items === 'string') {
      try {
        donationData.items = JSON.parse(donationData.items);
      } catch (e) {
        // Fallback if parsing fails
      }
    }
    if (typeof donationData.pickupLocation === 'string') {
      try {
        donationData.pickupLocation = JSON.parse(donationData.pickupLocation);
      } catch (e) {
        // Fallback
      }
    }

    // Set donor to current user
    donationData.donor = req.userId;

    // Handle uploaded files
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (donationData.images && typeof donationData.images === 'string') {
      images = donationData.images.split(',').map(url => url.trim()).filter(Boolean);
    }

    // Validate items
    if (!donationData.items || donationData.items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Assign images to the first item (since frontend form creates 1 item type at a time)
    if (images.length > 0 && Array.isArray(donationData.items) && donationData.items[0]) {
      donationData.items[0].images = images;
    }

    const donation = await Donation.create(donationData);
    await donation.populate('donor', 'name email phone');

    return res.status(201).json({ data: donation });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Create donation error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(400).json({ message: error.message || 'Failed to create donation' });
  }
};

const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findById(id).populate('donor', 'name email phone');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Users can only view their own donations (unless admin)
    if (req.userRole !== 'admin' && donation.donor._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(200).json({ data: donation });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get donation error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid donation ID' });
    }

    return res.status(500).json({ message: 'Failed to fetch donation' });
  }
};

const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ecoPointsAwarded } = req.body;

    // Only admin can update donation status
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.status = status;

    // Award EcoPoints when donation is completed
    if (status === 'completed' && ecoPointsAwarded && ecoPointsAwarded > 0) {
      donation.ecoPointsAwarded = ecoPointsAwarded;
      donation.actualPickupDate = new Date();

      // Update donor's EcoPoints
      await User.findByIdAndUpdate(
        donation.donor,
        { $inc: { ecoPoints: ecoPointsAwarded } }
      );
    }

    await donation.save();
    await donation.populate('donor', 'name email ecoPoints');

    return res.status(200).json({ data: donation, message: 'Donation status updated successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Update donation status error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid donation ID' });
    }

    return res.status(500).json({ message: 'Failed to update donation status' });
  }
};

module.exports = { listDonations, createDonation, getDonationById, updateDonationStatus };
