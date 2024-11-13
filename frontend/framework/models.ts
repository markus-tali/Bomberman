// Element Options interface
export interface ElOptions {
    className?: string;
    onClick?: () => void;
    onKeyDown?: () => void;
    onDblClick?: () => void;
    attributes?: Attributes;
}

// Add any attributes
interface Attributes extends Partial<HTMLElement>{
    [key: string]: any;
}

// route model
export interface RouteModel {
    pathName: string,
}