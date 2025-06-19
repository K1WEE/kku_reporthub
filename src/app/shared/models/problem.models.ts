

export interface Problem {
    id: number;
    title: string;
    description: string;
    location: {
        lat: number;
        lng: number;
    };
    created_at: Date;
    updated_at: Date;
    status: string;
    user_id?: string; 
}

export interface Report {
    id: number;
    user_id: number;
    categories_id: number;
    location_id: number;
    title: string;
    description: string;
    severity_level: number;
    status: string;
    image_url: string;
    created_at: Date;
    updated_at: Date;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

export interface Location {
    id: number;
    latitude: number;
    longitude: number;
    created_at: Date;
    updated_at: Date;
}

