import User from '../models/User.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import ApiError from '../utils/ApiError.js';

// ============================================================== 
// @desc    Get nearby workers using geospatial search
// @route   GET /api/v1/map/nearby-workers
// @access  Private (employer only)
// ============================================================== 
export const getNearbyWorkers = async (req, res, next) => {
  try {
    const { lat, lng, skill, radius = 10 } = req.query; // radius in km, default 10km

    // Validate coordinates
    if (!lat || !lng) {
      return next(new ApiError(400, 'Latitude and longitude are required'));
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return next(new ApiError(400, 'Invalid coordinates'));
    }

    // Validate radius (max 50km)
    const searchRadius = Math.min(parseFloat(radius) || 10, 50);

    // Build geospatial query
    const geoQuery = {
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // MongoDB expects [lng, lat]
          },
          $maxDistance: searchRadius * 1000, // Convert km to meters
          $minDistance: 0
        }
      }
    };

    // Add filters for workers
    const workerFilters = {
      ...geoQuery,
      role: 'worker',
      isActive: true,
      'workerProfile.isProfileComplete': true,
      'workerProfile.isOnline': true
    };

    // Add skill filter if provided
    if (skill && skill !== 'all') {
      workerFilters.$or = [
        { primarySkill: skill },
        { skills: skill }
      ];
    }

    // Execute geospatial search with population
    const workers = await User.find(workerFilters)
      .populate({
        path: 'workerProfile',
        select: 'primarySkill skills wageRate isOnline isProfileComplete stats'
      })
      .select('-password -otp -aadhaarNumber -bankAccount')
      .limit(50) // Limit results for performance
      .lean(); // Return plain JavaScript objects for better performance

    // Calculate distance for each worker
    const workersWithDistance = workers.map(worker => {
      const workerCoords = worker.address?.coordinates?.coordinates;
      if (workerCoords && workerCoords.length === 2) {
        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          latitude, longitude,
          workerCoords[1], workerCoords[0] // workerCoords is [lng, lat]
        );
        
        return {
          ...worker,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          distanceUnit: 'km'
        };
      }
      return {
        ...worker,
        distance: null,
        distanceUnit: 'km'
      };
    });

    // Sort by distance (closest first)
    workersWithDistance.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    res.status(200).json({
      success: true,
      data: {
        workers: workersWithDistance,
        searchCenter: {
          lat: latitude,
          lng: longitude,
          radius: searchRadius
        },
        totalFound: workersWithDistance.length,
        searchRadius: `${searchRadius}km`
      }
    });

  } catch (error) {
    console.error('Error in getNearbyWorkers:', error);
    next(new ApiError(500, 'Failed to search for nearby workers'));
  }
};

// ============================================================== 
// @desc    Update worker location (for live tracking)
// @route   PUT /api/v1/map/update-location
// @access  Private (worker only)
// ============================================================== 
export const updateWorkerLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return next(new ApiError(400, 'Latitude and longitude are required'));
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return next(new ApiError(400, 'Invalid coordinates'));
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return next(new ApiError(400, 'Coordinates out of valid range'));
    }

    // Update worker's location
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'address.coordinates': {
            type: 'Point',
            coordinates: [longitude, latitude] // MongoDB expects [lng, lat]
          }
        }
      },
      { new: true, runValidators: true }
    ).select('-password -otp -aadhaarNumber -bankAccount');

    if (!updatedUser) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: {
          lat: latitude,
          lng: longitude,
          updatedAt: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Error updating worker location:', error);
    next(new ApiError(500, 'Failed to update location'));
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

export default {
  getNearbyWorkers,
  updateWorkerLocation
};
