declare module 'cal-heatmap' {
  export default class CalHeatmap {
    constructor();
    paint(options: any, plugins: any[]): void;
    previous(): void;
    next(): void;
    on(event: string, callback: (error: any) => void): void;
  }
}

declare module 'cal-heatmap/plugins/Tooltip' {
  const Tooltip: any;
  export default Tooltip;
}

declare module 'cal-heatmap/plugins/LegendLite' {
  const LegendLite: any;
  export default LegendLite;
}

declare module 'cal-heatmap/plugins/CalendarLabel' {
  const CalendarLabel: any;
  export default CalendarLabel;
}
