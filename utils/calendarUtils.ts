export async function fetchChartData(calendarName: string) {
    try {
        const response = await fetch(`data/chart-data-${calendarName}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data for ${calendarName}:`, error);
        return [];
    }
}

export function processRoutinesData(data: any[], eventType: 'read' | 'Daily 60*60*3') {
    return data.filter(item => {
        const summary = item.summary.toLowerCase();
        return eventType === 'read' ? 
            summary === "read" : 
            summary.includes("daily 60*60*3");
    }).map(item => ({
        date: item.date.split('T')[0],
        value: 1
    }));
}
