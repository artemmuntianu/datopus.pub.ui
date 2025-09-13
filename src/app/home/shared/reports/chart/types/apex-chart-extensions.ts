export interface ApexChartAnimation {
    enabled?: boolean;
    easing?: "linear" | "easein" | "easeout" | "easeinout";
    speed?: number;
    animateGradually?: {
        enabled?: boolean;
        delay?: number;
    };
    dynamicAnimation?: {
        enabled?: boolean;
        speed?: number;
    };
}

export interface ApexChartZoom {
    enabled?: boolean;
    type?: "x" | "y" | "xy";
    autoScaleYaxis?: boolean;
    zoomedArea?: {
        fill?: {
            color?: string;
            opacity?: number;
        };
        stroke?: {
            color?: string;
            opacity?: number;
            width?: number;
        };
    };
}

export interface ApexChartToolbar {
    show?: boolean;
    offsetX?: number;
    offsetY?: number;
    tools?: {
        download?: boolean | string;
        selection?: boolean | string;
        zoom?: boolean | string;
        zoomin?: boolean | string;
        zoomout?: boolean | string;
        pan?: boolean | string;
        reset?: boolean | string;
        customIcons?: {
            icon?: string;
            title?: string;
            index?: number;
            class?: string;
            click?(chart?: any, options?: any, e?: any): any;
        }[];
    };
    export?: {
        csv?: {
            filename?: undefined | string;
            columnDelimiter?: string;
            headerCategory?: string;
            headerValue?: string;
            dateFormatter?(timestamp?: number): any;
        };
        svg?: {
            filename?: undefined | string;
        };
        png?: {
            filename?: undefined | string;
        };
    };
    autoSelected?: "zoom" | "selection" | "pan";
}