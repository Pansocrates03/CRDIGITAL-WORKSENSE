export function parseIAResponse(text: string): any {
    try {
        const parsed = JSON.parse(text);
        return parsed.epics || null;
    } catch (error) {
        console.error('Error parsing IA response:', error);
        return null;
    }
}
