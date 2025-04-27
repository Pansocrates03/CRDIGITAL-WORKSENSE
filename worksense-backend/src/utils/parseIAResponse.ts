export interface Epic {
    name: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    assignees: string[];
}

/**
 * Toma un rawText con JSON: '{"epics":[{...},...]}' y devuelve Epic[]
 * o lanza un Error con un mensaje descriptivo.
 */    

export function parseIAResponse(rawText: string): Epic[] {
    // Limpiar fences de Markdown si existen
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
        // Quita el fence de apertura y cierre
        cleaned = cleaned
        .replace(/^```(?:json)?\r?\n?/, '')
        .replace(/```$/, '')
        .trim();
    }

    // Parsear el JSON
    let parsed: any;
    try {
        parsed = JSON.parse(cleaned);
    } catch (err) {
        throw new Error('Respuesta de IA no es JSON válido');
    }

    // Validar estructura JSON
    if (!parsed.epics || !Array.isArray(parsed.epics)) {
        throw new Error('El JSON debe incluir "epics" como array');
    }

    const epics: Epic[] = parsed.epics.map((e: any, idx: number) => {
        // Validar tipo de cada campo
        if (typeof e.name !== 'string' || e.name.trim() === '') {
            throw new Error(`Épica "${e.name}" falta campo "name" válido`);
        }
        if (typeof e.description !== 'string' || e.description.trim() === '') {
            throw new Error(`Épica "${e.name}" falta campo "description" válido`);
        }

        // Prioridad válida o default
        const allowed = ['low', 'medium', 'high'];
        const priority = typeof e.priority === 'string' && allowed.includes(e.priority.toLowerCase())
        ? e.priority.toLowerCase() as Epic['priority']
        : 'medium';

        // Assignees como array de strings
        const assignees = Array.isArray(e.assignees)
        ? e.assignees.map((a: any) => String(a))
        : [];

        return {
            name: e.name.trim(),
            description: e.description.trim(),
            priority,
            assignees
        };
    });
    
    if (epics.length < 3 || epics.length > 5) {
        throw new Error(`Se esperaban entre 3 y 5 épicas, IA devolvió ${epics.length}`);
    }

    return epics;
}