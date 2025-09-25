export interface Dimensions {
  width: number;
  height: number;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface ThreeDimensionalCoordinates extends Coordinates {
  z: number;
}
