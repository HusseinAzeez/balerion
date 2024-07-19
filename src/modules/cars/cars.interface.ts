export interface IFindAdditionalSimilarCars {
  bodyTypeName: string;
  excludeYear: number;
  shortfall: number;
  boundary: {
    lowerYear: number;
    upperYear: number;
    lowerPrice: number;
    upperPrice: number;
  };
}
