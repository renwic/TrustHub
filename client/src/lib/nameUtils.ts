/**
 * Utility functions for formatting user names with privacy controls
 */

export function formatNameWithInitials(fullName: string, showFullName: boolean = false): string {
  if (!fullName || typeof fullName !== 'string') {
    return 'Anonymous';
  }

  const nameParts = fullName.trim().split(' ');
  
  if (nameParts.length === 1) {
    // Only first name, return as is
    return nameParts[0];
  }

  if (showFullName) {
    // Return full name as provided
    return fullName;
  }

  // Show first name + first initial of last name
  const firstName = nameParts[0];
  const lastNameInitial = nameParts[nameParts.length - 1][0]?.toUpperCase() || '';
  
  return lastNameInitial ? `${firstName} ${lastNameInitial}.` : firstName;
}

/**
 * Format a user's name based on their global privacy preference
 * @param user - User object with name field or firstName/lastName fields and showFullName preference
 * @param overrideShowFull - Optional override for specific contexts (like circles)
 * @returns Formatted name string
 */
export function formatUserDisplayName(user: any, overrideShowFull?: boolean): string {
  if (!user) {
    return 'Unknown User';
  }

  // Handle both profile objects (with 'name' field) and user objects (with firstName/lastName)
  let fullName: string;
  if (user.name) {
    fullName = user.name;
  } else {
    fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  
  if (!fullName) {
    return 'Anonymous';
  }

  const showFullName = overrideShowFull !== undefined ? overrideShowFull : (user.showFullName || false);
  
  return formatNameWithInitials(fullName, showFullName);
}

export function getNameInitials(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') {
    return 'A';
  }

  const nameParts = fullName.trim().split(' ');
  
  if (nameParts.length === 1) {
    return nameParts[0][0]?.toUpperCase() || 'A';
  }

  const firstInitial = nameParts[0][0]?.toUpperCase() || '';
  const lastInitial = nameParts[nameParts.length - 1][0]?.toUpperCase() || '';
  
  return `${firstInitial}${lastInitial}`;
}