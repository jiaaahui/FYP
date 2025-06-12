import { db } from '../firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  deleteDoc, query, where, getDocs, orderBy, addDoc
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function useSchedulingService() {
  const { currentUser } = useAuth();

  // Real installation times based on TBM data
  const getBaseInstallationTime = (itemType, installationType = 'standard') => {
    const baseTimes = {
      // TBM team installations (in minutes)
      'tv_standalone': { min: 10, max: 15, avg: 12.5 },
      'tv_wall_bracket': { min: 30, max: 40, avg: 35 },
      'fridge': { min: 5, max: 10, avg: 7.5 },
      'refrigerator': { min: 5, max: 10, avg: 7.5 }, // Same as fridge
      'washing_machine': { min: 20, max: 30, avg: 25 },
      'dryer': { min: 10, max: 15, avg: 12.5 },
      
      // Professional installer (outsource) - in minutes
      'air_conditioner': { min: 60, max: 120, avg: 90 },
      'ceiling_fan': { min: 30, max: 40, avg: 35 },
      'water_heater': { min: 60, max: 120, avg: 90 },
      'cooker_hood': { min: 60, max: 120, avg: 90 },
      
      // Default for unknown items
      'default': { min: 30, max: 60, avg: 45 }
    };
    
    const timeData = baseTimes[itemType] || baseTimes.default;
    
    // Use average time as base, with complexity adjustments
    return timeData.avg;
  };

  // Enhanced complexity calculation based on real factors
  const getComplexityMultiplier = (itemType, complexity, additionalFactors = {}) => {
    let baseMultiplier = 1.0;
    
    // Base complexity multipliers
    const complexityMultipliers = {
      'simple': 0.8,
      'medium': 1.0,
      'complex': 1.5,
      'very_complex': 2.0
    };
    
    baseMultiplier = complexityMultipliers[complexity] || 1.0;
    
    // Additional factors based on real scenarios
    if (additionalFactors.needsDismantling) {
      baseMultiplier += 0.5; // Additional time for dismantling old unit
    }
    
    if (additionalFactors.additionalPlumbing && 
        ['water_heater', 'washing_machine', 'dishwasher'].includes(itemType)) {
      baseMultiplier += 0.7; // Extra plumbing work
    }
    
    if (additionalFactors.additionalWiring && 
        ['air_conditioner', 'water_heater', 'cooker_hood'].includes(itemType)) {
      baseMultiplier += 0.6; // Extra electrical work
    }
    
    if (additionalFactors.coringRequired && itemType === 'cooker_hood') {
      baseMultiplier += 0.8; // Additional time for drilling holes
    }
    
    if (additionalFactors.stackingRequired && itemType === 'dryer') {
      baseMultiplier += 0.3; // Modification to stack on washer
    }
    
    if (additionalFactors.difficulAccess) {
      baseMultiplier += 0.4; // Difficult building/room access
    }
    
    return baseMultiplier;
  };

  // Calculate installation time with real TBM data
  const calculateInstallationTime = (items) => {
    let totalMinutes = 0;
    let breakdown = [];
    
    items.forEach(item => {
      const baseTime = getBaseInstallationTime(item.type, item.installationType);
      const complexityMultiplier = getComplexityMultiplier(
        item.type, 
        item.complexity || 'medium',
        item.additionalFactors || {}
      );
      
      // Quantity consideration (diminishing returns for multiple units)
      const quantity = item.quantity || 1;
      let quantityMultiplier;
      
      if (quantity === 1) {
        quantityMultiplier = 1;
      } else if (quantity <= 3) {
        quantityMultiplier = quantity * 0.9; // 10% efficiency gain per additional unit
      } else {
        quantityMultiplier = 3 * 0.9 + (quantity - 3) * 0.8; // Further efficiency for larger quantities
      }
      
      const itemTotalTime = baseTime * complexityMultiplier * quantityMultiplier;
      totalMinutes += itemTotalTime;
      
      breakdown.push({
        itemType: item.type,
        quantity: quantity,
        baseTime: baseTime,
        complexityMultiplier: complexityMultiplier,
        quantityMultiplier: quantityMultiplier,
        totalTime: itemTotalTime,
        installationType: ['air_conditioner', 'ceiling_fan', 'water_heater', 'cooker_hood'].includes(item.type) 
          ? 'Professional (Outsource)' : 'TBM Team'
      });
    });
    
    // Add buffer time and access time
    const accessTime = 15; // Time for accessing building, security, etc.
    const bufferTime = totalMinutes * 0.1; // 10% buffer for unexpected delays
    const totalWithBuffer = totalMinutes + accessTime + bufferTime;
    
    return {
      totalMinutes: Math.ceil(totalWithBuffer),
      installationOnly: Math.ceil(totalMinutes),
      accessTime: accessTime,
      bufferTime: Math.ceil(bufferTime),
      hours: Math.floor(totalWithBuffer / 60),
      minutes: Math.ceil(totalWithBuffer % 60),
      formattedTime: `${Math.floor(totalWithBuffer / 60)}h ${Math.ceil(totalWithBuffer % 60)}m`,
      breakdown: breakdown
    };
  };

  // Enhanced delivery constraints with building-specific data
  const checkDeliveryConstraints = (location, timeSlot, buildingInfo = {}) => {
    // Default constraints based on location type
    const defaultConstraints = {
      hdb: {
        accessStart: '08:00',
        accessEnd: '20:00',
        noiseRestrictionStart: '22:00',
        noiseRestrictionEnd: '08:00',
        requiresRegistration: false,
        hasLoadingBay: false,
        vehicleSizeLimit: '3_tonne',
        liftAccess: true,
        liftDimensions: { width: 110, height: 210, depth: 140 } // cm
      },
      condo: {
        accessStart: '09:00',
        accessEnd: '18:00',
        noiseRestrictionStart: '22:00',
        noiseRestrictionEnd: '08:00',
        requiresRegistration: true,
        hasLoadingBay: true,
        vehicleSizeLimit: '3_tonne',
        liftAccess: true,
        liftDimensions: { width: 120, height: 220, depth: 150 } // cm
      },
      landed: {
        accessStart: '08:00',
        accessEnd: '21:00',
        noiseRestrictionStart: '23:00',
        noiseRestrictionEnd: '07:00',
        requiresRegistration: false,
        hasLoadingBay: false,
        vehicleSizeLimit: '3_tonne',
        liftAccess: false,
        stairAccess: true
      },
      commercial: {
        accessStart: '07:00',
        accessEnd: '19:00',
        noiseRestrictionStart: '20:00',
        noiseRestrictionEnd: '07:00',
        requiresRegistration: true,
        hasLoadingBay: true,
        vehicleSizeLimit: '3_tonne',
        liftAccess: true,
        requiresSafetyGear: true,
        liftDimensions: { width: 140, height: 240, depth: 180 } // cm
      }
    };

    // Merge default constraints with specific building info
    const constraints = {
      ...defaultConstraints[location.type] || defaultConstraints.hdb,
      ...buildingInfo
    };

    const slotTime = new Date(`2024-01-01T${timeSlot}:00`);
    const accessStart = new Date(`2024-01-01T${constraints.accessStart}:00`);
    const accessEnd = new Date(`2024-01-01T${constraints.accessEnd}:00`);

    const isValidTime = slotTime >= accessStart && slotTime <= accessEnd;
    const hasNoiseRestriction = isWithinNoiseRestriction(timeSlot, constraints);

    return {
      isValidTime,
      hasNoiseRestriction,
      constraints,
      requiresRegistration: constraints.requiresRegistration,
      hasLoadingBay: constraints.hasLoadingBay,
      requiresSafetyGear: constraints.requiresSafetyGear || false,
      specialRequirements: getSpecialRequirements(location.type, buildingInfo)
    };
  };

  // Get special requirements based on building type
  const getSpecialRequirements = (locationType, buildingInfo) => {
    const requirements = [];

    if (locationType === 'commercial') {
      requirements.push('Hard hat required');
      requirements.push('Safety vest required');
      requirements.push('Hard toe shoes required');
    }

    if (buildingInfo.requiresRegistration) {
      requirements.push('Vehicle and worker registration required');
    }

    if (buildingInfo.hasStrictSecurity) {
      requirements.push('24-hour advance notice required');
    }

    if (buildingInfo.limitedParkingDistance && buildingInfo.limitedParkingDistance > 100) {
      requirements.push(`Parking ${buildingInfo.limitedParkingDistance}m from building`);
      requirements.push('Trolley with rubberized wheels required');
    }

    if (!buildingInfo.liftAccess) {
      requirements.push('Stair access only - additional manpower may be required');
    }

    return requirements;
  };

  // Enhanced truck capacity assessment with real truck data
  const assessTruckCapacity = async (date, timeSlot, newItems, truckType = '3_tonne') => {
    try {
      const truckCapacities = {
        '1_tonne_pickup': {
          maxWeight: 1000, // kg
          maxVolume: 8,    // cubic meters (estimated for pickup)
          maxLength: 300,  // cm
          maxWidth: 180,   // cm
          maxHeight: 200,  // cm (uncovered, height limitation)
          covered: false
        },
        '3_tonne': {
          maxWeight: 3000, // kg
          maxVolume: 25,   // cubic meters
          maxLength: 600,  // cm
          maxWidth: 220,   // cm
          maxHeight: 230,  // cm
          covered: true
        }
      };

      const truck = truckCapacities[truckType];
      
      // Get existing deliveries
      const deliveriesRef = collection(db, 'deliverySchedules');
      const q = query(
        deliveriesRef,
        where('deliveryDate', '==', date),
        where('deliveryTime', '==', timeSlot),
        where('truckType', '==', truckType)
      );
      const snapshot = await getDocs(q);
      
      let totalWeight = 0;
      let totalVolume = 0;
      const existingItems = [];

      // Calculate existing load
      snapshot.docs.forEach(doc => {
        const delivery = doc.data();
        if (delivery.items) {
          delivery.items.forEach(item => {
            totalWeight += (item.weight || 0) * (item.quantity || 1);
            totalVolume += (item.volume || 0) * (item.quantity || 1);
            existingItems.push(item);
          });
        }
      });

      // Calculate new items load
      let newWeight = 0;
      let newVolume = 0;
      newItems.forEach(item => {
        newWeight += (item.weight || 0) * (item.quantity || 1);
        newVolume += (item.volume || 0) * (item.quantity || 1);
      });

      const finalWeight = totalWeight + newWeight;
      const finalVolume = totalVolume + newVolume;

      const weightUtilization = finalWeight / truck.maxWeight;
      const volumeUtilization = finalVolume / truck.maxVolume;

      // Check for special packing considerations
      const packingIssues = checkPackingConstraints(newItems, existingItems, truck);

      return {
        canFit: weightUtilization <= 1.0 && volumeUtilization <= 1.0 && packingIssues.canPack,
        weightUtilization,
        volumeUtilization,
        capacityScore: Math.max(0, 1 - Math.max(weightUtilization, volumeUtilization)),
        packingScore: packingIssues.packingScore,
        details: {
          currentWeight: totalWeight,
          currentVolume: totalVolume,
          newWeight,
          newVolume,
          finalWeight,
          finalVolume,
          truck: truck,
          packingIssues: packingIssues.issues
        }
      };
    } catch (error) {
      console.error('Error assessing truck capacity:', error);
      return {
        canFit: false,
        capacityScore: 0,
        error: error.message
      };
    }
  };

  // Check packing constraints (fragile items, orientation, etc.)
  const checkPackingConstraints = (newItems, existingItems, truck) => {
    const issues = [];
    let packingScore = 1.0;

    const allItems = [...existingItems, ...newItems];
    
    // Check for items that cannot lie down
    const uprightOnlyItems = allItems.filter(item => 
      ['fridge', 'refrigerator', 'washing_machine', 'dryer'].includes(item.type)
    );

    // Check for fragile items
    const fragileItems = allItems.filter(item => 
      ['tv_standalone', 'tv_wall_bracket'].includes(item.type)
    );

    // Check height limitations for uncovered trucks
    if (!truck.covered) {
      const tallItems = allItems.filter(item => 
        (item.height || 0) > truck.maxHeight * 0.8 // 80% of max height for safety
      );
      
      if (tallItems.length > 0) {
        issues.push('Tall items may exceed truck height capacity (uncovered truck)');
        packingScore -= 0.3;
      }
    }

    // Check for delivery order arrangement requirements
    const deliveryOrderComplexity = calculateDeliveryOrderComplexity(allItems);
    if (deliveryOrderComplexity > 0.7) {
      issues.push('Complex loading arrangement required for delivery order');
      packingScore -= 0.2;
    }

    // Fragile items placement
    if (fragileItems.length > 2) {
      issues.push('Multiple fragile items require careful placement');
      packingScore -= 0.1;
    }

    return {
      canPack: packingScore > 0.3, // Minimum viable packing score
      packingScore: Math.max(0, packingScore),
      issues: issues
    };
  };

  // Calculate delivery order complexity for packing
  const calculateDeliveryOrderComplexity = (items) => {
    // This is a simplified calculation
    // In reality, you'd consider actual delivery addresses and order
    const uniqueDeliveries = new Set(items.map(item => item.deliveryAddress)).size;
    const totalItems = items.length;
    
    return Math.min(1.0, uniqueDeliveries / totalItems);
  };

  // Building database for future reference
  const saveBuildingInfo = async (buildingAddress, buildingInfo) => {
    try {
      const buildingRef = doc(collection(db, 'buildingDatabase'));
      await setDoc(buildingRef, {
        address: buildingAddress,
        ...buildingInfo,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
      return buildingRef.id;
    } catch (error) {
      console.error('Error saving building info:', error);
      throw error;
    }
  };

  // Get building info from database
  const getBuildingInfo = async (buildingAddress) => {
    try {
      const buildingsRef = collection(db, 'buildingDatabase');
      const q = query(buildingsRef, where('address', '==', buildingAddress));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting building info:', error);
      return null;
    }
  };

  // Team assignment based on installation type
  const assignOptimalTeam = (items) => {
    const tbmItems = [];
    const professionalItems = [];
    
    items.forEach(item => {
      if (['air_conditioner', 'ceiling_fan', 'water_heater', 'cooker_hood'].includes(item.type)) {
        professionalItems.push(item);
      } else {
        tbmItems.push(item);
      }
    });

    const teams = [];
    
    if (tbmItems.length > 0) {
      teams.push({
        teamType: 'TBM_internal',
        items: tbmItems,
        estimatedTime: calculateInstallationTime(tbmItems)
      });
    }
    
    if (professionalItems.length > 0) {
      teams.push({
        teamType: 'Professional_outsource',
        items: professionalItems,
        estimatedTime: calculateInstallationTime(professionalItems)
      });
    }

    return teams;
  };

  // Emergency rescheduling for breakdown, medical leave, etc.
  const handleEmergencyReschedule = async (emergencyType, affectedSchedules, options = {}) => {
    try {
      const rescheduleStrategies = {
        'truck_breakdown': async () => {
          // Try to assign to different truck or merge orders
          return await mergeOrdersToAvailableTruck(affectedSchedules, options.availableTrucks);
        },
        'medical_leave': async () => {
          // Reassign to different team or postpone
          return await reassignToAvailableTeam(affectedSchedules, options.availableTeams);
        },
        'customer_cancellation': async () => {
          // Remove from schedule and optimize remaining deliveries
          return await optimizeAfterCancellation(affectedSchedules);
        },
        'weather_delay': async () => {
          // Postpone outdoor installations, continue indoor ones
          return await postponeWeatherSensitiveInstalls(affectedSchedules);
        }
      };

      const strategy = rescheduleStrategies[emergencyType];
      if (!strategy) {
        throw new Error(`No strategy defined for emergency type: ${emergencyType}`);
      }

      const result = await strategy();
      
      // Log the emergency reschedule
      await logEmergencyReschedule(emergencyType, affectedSchedules, result);
      
      return result;
    } catch (error) {
      console.error('Error handling emergency reschedule:', error);
      throw error;
    }
  };

  // Merge orders to available truck
  const mergeOrdersToAvailableTruck = async (affectedSchedules, availableTrucks) => {
    const mergedSchedules = [];
    
    for (const schedule of affectedSchedules) {
      let merged = false;
      
      for (const truck of availableTrucks) {
        const canMerge = await assessTruckCapacity(
          schedule.deliveryDate,
          schedule.deliveryTime,
          schedule.items,
          truck.type
        );
        
        if (canMerge.canFit) {
          // Update schedule with new truck
          const scheduleRef = doc(db, 'deliverySchedules', schedule.id);
          await updateDoc(scheduleRef, {
            truckId: truck.id,
            truckType: truck.type,
            status: 'rescheduled_truck',
            rescheduledAt: new Date(),
            rescheduleReason: 'truck_breakdown'
          });
          
          mergedSchedules.push({
            ...schedule,
            newTruckId: truck.id,
            newTruckType: truck.type
          });
          
          merged = true;
          break;
        }
      }
      
      if (!merged) {
        // Need to postpone this delivery
        const newSlot = await findNextAvailableSlot(schedule);
        mergedSchedules.push({
          ...schedule,
          postponed: true,
          newDate: newSlot.date,
          newTime: newSlot.time
        });
      }
    }
    
    return mergedSchedules;
  };

  // Find next available slot for postponed delivery
  const findNextAvailableSlot = async (originalSchedule) => {
    // This would implement logic to find the next best available slot
    // For now, return next day same time
    const nextDay = new Date(originalSchedule.deliveryDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return {
      date: nextDay.toISOString().split('T')[0],
      time: originalSchedule.deliveryTime
    };
  };

  // Log emergency reschedule for tracking and analytics
  const logEmergencyReschedule = async (emergencyType, affectedSchedules, result) => {
    try {
      await addDoc(collection(db, 'emergencyLogs'), {
        emergencyType,
        affectedCount: affectedSchedules.length,
        affectedSchedules: affectedSchedules.map(s => s.id),
        resolution: result,
        timestamp: new Date(),
        handledBy: currentUser.uid
      });
    } catch (error) {
      console.error('Error logging emergency reschedule:', error);
    }
  };

  return {
    calculateInstallationTime,
    checkDeliveryConstraints,
    assessTruckCapacity,
    assignOptimalTeam,
    handleEmergencyReschedule,
    saveBuildingInfo,
    getBuildingInfo,
    // ... other existing functions
  };
}