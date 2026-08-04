import { pseudoRandom } from '@/lib/pseudoRandom';

import type { CitationMessage } from './types';

/**
 * Conversación simulada por citación, para la pestaña "Conversación" del
 * panel de detalle. Solo un subconjunto de `INITIAL_CITATIONS` tiene
 * mensajes (no hace falta poblar las 16 para que la pantalla se vea
 * completa). Datos deterministas, sin persistencia ni backend.
 */
export const MESSAGES_BY_CITATION: Record<number, CitationMessage[]> = {
  1: [
    {
      id: 'c1-m1',
      sender: 'apoderado',
      text: 'Buenos días profesor, disculpe la tardanza en responder. ¿Podemos coordinar un horario de refuerzo para Valentina?',
      timestamp: '03/04/2026, 07:40 p. m.',
    },
    {
      id: 'c1-m2',
      sender: 'docente',
      text: 'Buenos días señor Sol, claro que sí. Le propongo los martes y jueves de 3:00 a 4:00 pm en el aula de reforzamiento.',
      timestamp: '04/04/2026, 08:05 a. m.',
    },
    {
      id: 'c1-m3',
      sender: 'apoderado',
      text: 'Perfecto, ahí estaremos. Muchas gracias por el apoyo con Valentina.',
      timestamp: '04/04/2026, 08:12 a. m.',
    },
  ],
  3: [
    {
      id: 'c3-m1',
      sender: 'docente',
      text: 'Buenas tardes señora Vega, quisiera coordinar una reunión para conversar sobre la conducta de Lucas en clase.',
      timestamp: '05/04/2026, 02:15 p. m.',
    },
    {
      id: 'c3-m2',
      sender: 'apoderado',
      text: 'Buenas tardes profesor, sí, estoy disponible el martes por la mañana.',
      timestamp: '05/04/2026, 06:30 p. m.',
    },
    {
      id: 'c3-m3',
      sender: 'sistema',
      text: 'Citación registrada para el 07/04/2026 a las 08:00 a. m.',
      timestamp: '05/04/2026, 06:31 p. m.',
    },
  ],
  5: [
    {
      id: 'c5-m1',
      sender: 'docente',
      text: 'Buenos días señora Ramos, notamos varias faltas sin justificar de Luciana la última semana de marzo. ¿Podría acercarse a coordinar?',
      timestamp: '01/04/2026, 09:00 a. m.',
    },
    {
      id: 'c5-m2',
      sender: 'apoderado',
      text: 'Buenos días profesora, Luciana estuvo enferma esos días. Le hago llegar el certificado médico esta semana.',
      timestamp: '01/04/2026, 11:20 a. m.',
    },
  ],
  8: [
    {
      id: 'c8-m1',
      sender: 'docente',
      text: 'Buenas tardes señora Campos, se han registrado varias incidencias de Valery este mes. Necesitamos conversar al respecto.',
      timestamp: '02/04/2026, 03:45 p. m.',
    },
    {
      id: 'c8-m2',
      sender: 'apoderado',
      text: 'Entiendo profesor, es preocupante. ¿Qué día puede recibirme?',
      timestamp: '02/04/2026, 05:10 p. m.',
    },
    {
      id: 'c8-m3',
      sender: 'docente',
      text: 'El lunes 6 de abril a las 11:15 am, en la dirección del colegio.',
      timestamp: '02/04/2026, 05:22 p. m.',
    },
    {
      id: 'c8-m4',
      sender: 'apoderado',
      text: 'De acuerdo, ahí estaré sin falta.',
      timestamp: '02/04/2026, 05:25 p. m.',
    },
  ],
  11: [
    {
      id: 'c11-m1',
      sender: 'docente',
      text: 'Buenos días señor Luna, se ha reportado un caso de ciberbullying que involucra a Sofía. Es importante conversarlo en persona.',
      timestamp: '08/04/2026, 08:30 a. m.',
    },
    {
      id: 'c11-m2',
      sender: 'apoderado',
      text: 'Buenos días, qué preocupante. Confirmo mi asistencia a la citación.',
      timestamp: '08/04/2026, 09:05 a. m.',
    },
    {
      id: 'c11-m3',
      sender: 'sistema',
      text: 'Citación confirmada para el 09/04/2026 a las 11:15 a. m.',
      timestamp: '08/04/2026, 09:06 a. m.',
    },
  ],
  14: [
    {
      id: 'c14-m1',
      sender: 'docente',
      text: 'Buenos días señora Arce, es urgente coordinar una reunión sobre un tema de falsificación de firma en un examen de Fernando.',
      timestamp: '07/04/2026, 10:00 a. m.',
    },
    {
      id: 'c14-m2',
      sender: 'apoderado',
      text: 'Buenos días profesora, con gusto. ¿Puede ser esta semana?',
      timestamp: '07/04/2026, 12:40 p. m.',
    },
  ],
};

/**
 * Estado del último mensaje enviado por el colegio en una citación, para el
 * doble check de la lista:
 * - `'ninguno'` — no hay conversación o el último turno fue del apoderado, así
 *   que no hay nada nuestro pendiente de lectura y no se pinta ningún check.
 * - `'entregado'` — se envió y el apoderado todavía no ha respondido.
 * - `'leido'` — el apoderado respondió después, única señal de lectura
 *   disponible sin backend (mismo criterio que `CitationConversationTab`).
 */
export type CitationReadState = 'ninguno' | 'entregado' | 'leido';

export function getReadState(citationId: number): CitationReadState {
  const messages = MESSAGES_BY_CITATION[citationId];
  if (!messages || messages.length === 0) return 'ninguno';

  // Último mensaje del docente: es el único cuya lectura nos interesa mostrar.
  const lastDocenteIndex = messages.map((m) => m.sender).lastIndexOf('docente');
  if (lastDocenteIndex === -1) return 'ninguno';

  return lastDocenteIndex < messages.length - 1 ? 'leido' : 'entregado';
}

/**
 * Mensajes sin leer por citación, derivados de forma determinista del `id`
 * (nunca `Math.random()`). Solo aplica a citaciones con conversación; las
 * demás no muestran el indicador en la lista.
 */
export function getUnreadCount(citationId: number): number {
  const messages = MESSAGES_BY_CITATION[citationId];
  if (!messages || messages.length === 0) return 0;
  return Math.floor(pseudoRandom(`citation-unread-${citationId}`) * 4); // 0 a 3
}
