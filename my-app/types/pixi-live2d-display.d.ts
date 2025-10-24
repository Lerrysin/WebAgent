declare module "pixi-live2d-display/cubism4" {
interface Live2DModel {
setParameterValueById(id: string, value: number): void;
getParameterValueById(id: string): number;
addParameterValueById(id: string, value: number, weight?: number): void;
}
}