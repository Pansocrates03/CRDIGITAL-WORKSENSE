declare module 'react-chartkick' {
    import { ComponentType } from 'react';

    interface ChartProps {
        data: any;
        width?: string | number;
        height?: string | number;
        colors?: string[];
        donut?: boolean;
        suffix?: string;
        prefix?: string;
        empty?: string;
        loading?: string;
        library?: any;
    }

    export const LineChart: ComponentType<ChartProps>;
    export const PieChart: ComponentType<ChartProps>;
    export const ColumnChart: ComponentType<ChartProps>;
    export const BarChart: ComponentType<ChartProps>;
    export const AreaChart: ComponentType<ChartProps>;
    export const ScatterChart: ComponentType<ChartProps>;
}

declare module 'chartkick/chart.js' {
    // This is just a side-effect import
} 