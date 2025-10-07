/**
 * Utility functions for room dimension calculations
 * Extracted to prevent code duplication and improve performance
 */

export interface RoomDimensions {
  roomWidth: number;
  roomDepth: number;
  roomHeight: number;
  dynamicFloorY: number;
}

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

export interface CameraTarget {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculate dynamic room dimensions based on configuration
 */
export function calculateRoomDimensions(
  barCount: number,
  shelfQuantity: number,
  shelfSpacing: number,
  userHeight?: number
): RoomDimensions {
  const heightInInches = userHeight ? userHeight / 25.4 : 47;
  
  // Base room dimensions
  let roomWidth = 2000;
  let roomDepth = 1200;
  let roomHeight = 1500;
  
  // Adjust room width dynamically based on barCount
  if (barCount > 1) {
    const additionalWidth = (barCount - 1) * 950;
    roomWidth = Math.max(2000, roomWidth + additionalWidth);
  }
  
  // Calculate dynamic room height based on shelf quantity and spacing
  const baseRoomHeight = 1500;
  const totalShelfSystemHeight = shelfQuantity * shelfSpacing;
  const heightExtension = Math.max(0, totalShelfSystemHeight - 500);
  roomHeight = baseRoomHeight + heightExtension;
  
  // Adjust room size for taller shelf systems
  if (heightInInches > 60) {
    const scaleFactor = Math.max(1.2, heightInInches / 50);
    roomWidth = Math.max(roomWidth, roomWidth * scaleFactor);
    roomDepth = Math.max(1200, roomDepth * scaleFactor);
    roomHeight = Math.max(roomHeight, userHeight! + 400);
  }
  
  const dynamicFloorY = -heightExtension;
  
  return { roomWidth, roomDepth, roomHeight, dynamicFloorY };
}

/**
 * Calculate optimal camera position based on room dimensions
 */
export function calculateCameraPosition(
  roomDimensions: RoomDimensions,
  userHeight: number,
  shelfQuantity: number,
  barCount: number
): CameraPosition {
  const { roomWidth, roomDepth, roomHeight, dynamicFloorY } = roomDimensions;
  
  const roomDiagonal = Math.sqrt(
    roomWidth * roomWidth + roomDepth * roomDepth + roomHeight * roomHeight
  );
  
  const shelfHeightFactor = (userHeight || 1194) / 1000;
  const shelfQuantityFactor = Math.max(1, shelfQuantity / 3);
  const bayCountFactor = Math.max(1, barCount / 2);
  const roomHeightFactor = roomHeight / 1500;
  
  const baseCameraDistance = 
    roomDiagonal * 0.8 * shelfHeightFactor * shelfQuantityFactor * bayCountFactor * roomHeightFactor;
  const cameraDistance = Math.max(2000, Math.min(baseCameraDistance, 6000));
  
  const x = 0;
  const y = Math.max((userHeight || 1194) * 0.7, roomHeight * 0.5) + Math.abs(dynamicFloorY);
  const z = cameraDistance * 0.9;
  
  return { x, y, z };
}

/**
 * Calculate camera target (where the camera looks at)
 */
export function calculateCameraTarget(
  roomDimensions: RoomDimensions
): CameraTarget {
  const { roomHeight, roomDepth, dynamicFloorY } = roomDimensions;
  
  return {
    x: 0,
    y: roomHeight / 2 + Math.abs(dynamicFloorY),
    z: -roomDepth / 2
  };
}

