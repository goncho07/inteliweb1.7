import { pseudoRandom } from '@/lib/pseudoRandom';

const KEYWORD_REPLIES: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ['reporte', 'informe', 'boleta', 'libreta'],
    reply:
      'Puedes generar reportes desde el módulo Reportes, filtrando por aula y periodo. ¿Buscas boletas de notas o un reporte de asistencia?',
  },
  {
    keywords: ['inscrib', 'matric', 'nuevo alumno', 'nuevo estudiante'],
    reply:
      'Para inscribir un alumno nuevo, ve al módulo Usuarios y usa "Nuevo usuario" con el rol Estudiante. Ahí completas sus datos y lo asignas a un aula.',
  },
  {
    keywords: ['citaci', 'apoderado', 'cita'],
    reply:
      'Las citaciones a apoderados se gestionan desde el módulo Citaciones: puedes programar una nueva o revisar el estado de las pendientes.',
  },
  {
    keywords: ['asistencia', 'falta', 'inasist'],
    reply:
      'El registro y las notificaciones de asistencia están en el perfil de cada alumno, dentro de Aulas. También puedes justificar inasistencias desde ahí.',
  },
  {
    keywords: ['incidencia', 'conducta', 'convivencia'],
    reply:
      'Las incidencias conductuales se registran en el perfil del alumno, en Aulas. Cada una queda asociada a ese estudiante.',
  },
];

const FALLBACK_REPLIES = [
  'No tengo información sobre eso todavía. Puedo ayudarte con reportes, asistencia, citaciones o incidencias de un alumno.',
  'Cuéntame un poco más: ¿es sobre un aula, un alumno o un reporte específico?',
  'Por ahora puedo orientarte dentro de los módulos de Intelicole. ¿Sobre cuál te gustaría que te ayude?',
];

export function getSimulatedAssistantReply(message: string): string {
  const normalized = message.toLowerCase();

  for (const entry of KEYWORD_REPLIES) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.reply;
    }
  }

  const index = Math.floor(pseudoRandom(normalized) * FALLBACK_REPLIES.length);
  return FALLBACK_REPLIES[index];
}
