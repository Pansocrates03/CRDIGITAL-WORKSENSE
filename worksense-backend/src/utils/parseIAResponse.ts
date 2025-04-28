export interface Epic {
    name: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    assignees: string[];
    items: Story[];
}

export interface Task {
    name: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    assignees: string[];
}

export interface Story {
    name: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    assignees: string[];
    items: Task[]; // Sub-tareas
}

// Normalizar el campo "priority" y asegurar que sea uno de los valores permitidos
function normalizePriority(value: string): Epic['priority'] {
    const allowed = ['low', 'medium', 'high'];
    const lower = value.toLowerCase();
    return (allowed.includes(lower) ? lower : 'medium') as Epic ['priority'];
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

    // Mapear cada épica y sus sub-niveles
    const epics: Epic[] = parsed.epics.map((e: any, epiIdx: number) => {
        // Campos obligatorios de la épica
        if (typeof e.name !== 'string' || !e.name.trim()) {
            throw new Error(`Épica #${epiIdx + 1} falta campo "name" válido`);
        }
        if (typeof e.description !== 'string' || !e.description.trim()) {
            throw new Error(`Épica "${e.name}" falta campo "description" válido`);
        }

        // Mapear historias (Story)
        const stories: Story[] = Array.isArray(e.items) ? e.items.map((s: any, sIdx: number) => {
            if (typeof s.name !== 'string' || !s.name.trim()) {
                throw new Error(`Historia #${sIdx + 1} de "${e.name}" falta campo "name" válido`);
            }
            if (typeof s.description !== 'string' || !s.description.trim()) {
                throw new Error(`Historia "${s.name}" de "${e.name}" falta campo "description" válido`);
            }
            
            // Mapear tareas (Task)
            const tasks: Task[] = Array.isArray(s.items) ? s.items.map((t: any, tIdx: number) => {
                if (typeof t.name !== 'string' || !t.name.trim()) {
                    throw new Error(`Tarea #${tIdx + 1} de "${s.name}" de "${e.name}" falta campo "name" válido`);
                }
                if (typeof t.description !== 'string' || !t.description.trim()) {
                    throw new Error(`Tarea "${t.name}" de "${s.name}" de "${e.name}" falta campo "description" válido`);
                }
                return {
                    name: t.name.trim(),
                    description: t.description.trim(),
                    priority: normalizePriority(t.priority || ''),
                    assignees: Array.isArray(t.assignees) ? t.assignees.map(String) : []
                  };
            }) 
            : [];

            return {
                name: s.name.trim(),
                description: s.description.trim(),
                priority: normalizePriority(s.priority || ''),
                assignees: Array.isArray(s.assignees) ? s.assignees.map(String) : [],
                items: tasks
            };
        })
        : [];
        return {
            name: e.name.trim(),
            description: e.description.trim(),
            priority: normalizePriority(e.priority || ''),
            assignees: Array.isArray(e.assignees) ? e.assignees.map(String) : [],
            items: stories
        };
    });

    // Validar cantidad de épicas
    if (epics.length < 3 || epics.length > 5) {
        throw new Error(`Se esperaban entre 3 y 5 épicas, IA devolvió ${epics.length}`);
    }

    return epics;
            
}