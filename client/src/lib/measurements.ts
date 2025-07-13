// Measurement conversion utilities for imperial/metric systems

export type MeasurementSystem = 'metric' | 'imperial';
export type HeightUnit = 'cm' | 'ft';
export type WeightUnit = 'kg' | 'lbs';
export type DistanceUnit = 'km' | 'miles';

// Height conversions
export function convertHeight(value: number, fromUnit: HeightUnit, toUnit: HeightUnit): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'cm' && toUnit === 'ft') {
    // Convert cm to feet/inches
    const totalInches = value / 2.54;
    return Math.round(totalInches); // Return total inches for easier calculation
  }
  
  if (fromUnit === 'ft' && toUnit === 'cm') {
    // Convert inches to cm
    return Math.round(value * 2.54);
  }
  
  return value;
}

// Format height for display
export function formatHeight(heightInCm: number, unit: HeightUnit = 'cm'): string {
  if (unit === 'cm') {
    return `${heightInCm} cm`;
  }
  
  // Convert to feet and inches
  const totalInches = heightInCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  
  return `${feet}'${inches}"`;
}

// Parse height input (handles both "5'8" and "173" formats)
export function parseHeight(input: string, unit: HeightUnit = 'cm'): number {
  if (unit === 'cm') {
    return parseInt(input) || 0;
  }
  
  // Handle feet/inches format like "5'8" or "5 8" or "68"
  const feetInchesRegex = /(\d+)'?\s*(\d+)?"?/;
  const match = input.match(feetInchesRegex);
  
  if (match) {
    const feet = parseInt(match[1]) || 0;
    const inches = parseInt(match[2]) || 0;
    return convertHeight((feet * 12) + inches, 'ft', 'cm');
  }
  
  // If just a number, assume inches
  const totalInches = parseInt(input) || 0;
  return convertHeight(totalInches, 'ft', 'cm');
}

// Weight conversions
export function convertWeight(value: number, fromUnit: WeightUnit, toUnit: WeightUnit): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return Math.round(value * 2.20462);
  }
  
  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return Math.round(value / 2.20462);
  }
  
  return value;
}

// Format weight for display
export function formatWeight(weightInKg: number, unit: WeightUnit = 'kg'): string {
  if (unit === 'kg') {
    return `${weightInKg} kg`;
  }
  
  const weightInLbs = convertWeight(weightInKg, 'kg', 'lbs');
  return `${weightInLbs} lbs`;
}

// Distance conversions
export function convertDistance(value: number, fromUnit: DistanceUnit, toUnit: DistanceUnit): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'km' && toUnit === 'miles') {
    return Math.round(value * 0.621371 * 10) / 10; // Round to 1 decimal
  }
  
  if (fromUnit === 'miles' && toUnit === 'km') {
    return Math.round(value * 1.60934 * 10) / 10; // Round to 1 decimal
  }
  
  return value;
}

// Format distance for display
export function formatDistance(distanceInKm: number, unit: DistanceUnit = 'km'): string {
  if (unit === 'km') {
    return `${distanceInKm} km`;
  }
  
  const distanceInMiles = convertDistance(distanceInKm, 'km', 'miles');
  return `${distanceInMiles} miles`;
}

// Get user's preferred measurement system from locale/browser
export function getDefaultMeasurementSystem(): MeasurementSystem {
  const locale = navigator.language || 'en-US';
  
  // Countries that primarily use imperial system
  const imperialCountries = ['US', 'LR', 'MM']; // United States, Liberia, Myanmar
  const country = locale.split('-')[1];
  
  return imperialCountries.includes(country) ? 'imperial' : 'metric';
}

// Get appropriate units based on measurement system
export function getUnitsForSystem(system: MeasurementSystem) {
  return {
    height: system === 'imperial' ? 'ft' as HeightUnit : 'cm' as HeightUnit,
    weight: system === 'imperial' ? 'lbs' as WeightUnit : 'kg' as WeightUnit,
    distance: system === 'imperial' ? 'miles' as DistanceUnit : 'km' as DistanceUnit,
  };
}

// Height options for dropdowns
export function getHeightOptions(unit: HeightUnit = 'cm'): Array<{ value: number; label: string }> {
  const options = [];
  
  if (unit === 'cm') {
    for (let cm = 140; cm <= 220; cm += 1) {
      options.push({
        value: cm,
        label: `${cm} cm`
      });
    }
  } else {
    // Generate feet/inches options from 4'7" to 7'2"
    for (let feet = 4; feet <= 7; feet++) {
      const maxInches = feet === 7 ? 2 : 11; // Cap at 7'2"
      const minInches = feet === 4 ? 7 : 0; // Start at 4'7"
      
      for (let inches = minInches; inches <= maxInches; inches++) {
        const totalInches = (feet * 12) + inches;
        const heightInCm = convertHeight(totalInches, 'ft', 'cm');
        options.push({
          value: heightInCm, // Store as cm for database consistency
          label: `${feet}'${inches}"`
        });
      }
    }
  }
  
  return options;
}

// Weight options for dropdowns
export function getWeightOptions(unit: WeightUnit = 'kg'): Array<{ value: number; label: string }> {
  const options = [];
  
  if (unit === 'kg') {
    for (let kg = 40; kg <= 150; kg += 1) {
      options.push({
        value: kg,
        label: `${kg} kg`
      });
    }
  } else {
    for (let lbs = 90; lbs <= 330; lbs += 5) {
      const weightInKg = convertWeight(lbs, 'lbs', 'kg');
      options.push({
        value: weightInKg, // Store as kg for database consistency
        label: `${lbs} lbs`
      });
    }
  }
  
  return options;
}