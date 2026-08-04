import React from 'react';
import { CheckCheck, MessageSquare } from 'lucide-react';

import whatsappChatPattern from '@/assets/images/whatsapp-chat-pattern.png';
import { formatRelativeDayLabel } from '@/lib/formatRelativeDate';
import { cn } from '@/lib/utils';

import { CitationAvatar } from './CitationAvatar';
import { parseCitationDate } from '../citations.constants';
import type { CitationMessage } from '../types';

/** Extrae solo la hora de un timestamp `'DD/MM/YYYY, hh:mm a. m.'` para mostrarla en la esquina de la burbuja. */
const bubbleTime = (timestamp: string): string => {
  const parts = timestamp.split(', ');
  return parts.length > 1 ? parts[1] : timestamp;
};

/**
 * Fecha del mensaje, para agrupar por día en la conversación. Los mensajes
 * enviados en vivo durante la sesión usan `timestamp: 'Ahora'` (sin fecha,
 * ver `citations.constants.ts` § `handleSendMessage`) — se tratan como de hoy.
 */
const messageDate = (timestamp: string): Date => {
  if (timestamp === 'Ahora') return new Date();
  const [datePart] = timestamp.split(', ');
  return parseCitationDate(datePart);
};

/** `true` si `a` y `b` caen en el mismo día calendario. */
const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Conversación con el apoderado por una citación: contenido principal de
 * `CitationDetailPanel` (el tipo, la descripción, el seguimiento y las
 * acciones viven aparte, en el drawer "Detalle"). Burbujas de mensaje entre
 * docente y apoderado, de solo lectura (el historial ya registrado, sin
 * campo para escribir uno nuevo). Datos en memoria, sin backend. Las
 * burbujas usan los tokens de color del sistema de diseño, no la paleta
 * verde/blanca de WhatsApp — lo único que se toma prestado de ahí es la
 * textura de fondo (`whatsapp-chat-pattern.png`, imagen local en
 * `src/assets/images/`, nunca cargada por URL externa).
 */
export const CitationConversationTab: React.FC<{
  messages: CitationMessage[];
}> = ({ messages }) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/*
        Fondo de WhatsApp con sus colores reales — única excepción a los
        tokens del sistema fuera del módulo WhatsApp, y deliberada (pedido
        explícito). El PNG dibuja el patrón en blanco sobre transparente y se
        muestra tal cual, sin invertir, tanto en claro (líneas blancas sobre
        el beige) como en oscuro (líneas blancas sobre el navy).
      */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#efeae2] dark:bg-[#0b141a]">
        <div
          className="pointer-events-none absolute inset-0 bg-repeat opacity-50 dark:opacity-[0.06]"
          style={{ backgroundImage: `url(${whatsappChatPattern})`, backgroundSize: '600px' }}
          aria-hidden="true"
        />
        <div className="custom-scrollbar relative z-10 h-full overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400 dark:text-slate-500">
              <MessageSquare className="h-8 w-8" strokeWidth={2} />
              <p className="text-sm font-semibold">Todavía no hay mensajes</p>
              <p className="max-w-xs text-sm text-slate-400 dark:text-slate-500">
                No hay conversación registrada con el apoderado sobre esta citación.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((msg, index) => {
                const currentDate = messageDate(msg.timestamp);
                const previousDate = index > 0 ? messageDate(messages[index - 1].timestamp) : null;
                const showDaySeparator = !previousDate || !isSameDay(currentDate, previousDate);

                const daySeparator = showDaySeparator && (
                  <div key={`${msg.id}-day`} className="flex justify-center">
                    <p className="rounded-full bg-slate-100 px-4 py-1.5 text-center text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {formatRelativeDayLabel(currentDate)}
                    </p>
                  </div>
                );

                if (msg.sender === 'sistema') {
                  return (
                    <React.Fragment key={msg.id}>
                      {daySeparator}
                      <div className="flex justify-center">
                        <p className="max-w-[80%] rounded-full bg-slate-100 px-4 py-1.5 text-center text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {msg.text}
                        </p>
                      </div>
                    </React.Fragment>
                  );
                }

                const isDocente = msg.sender === 'docente';
                // El apoderado "lee" un mensaje del docente cuando llega la respuesta
                // siguiente (real o simulada) — no hay backend que confirme la lectura,
                // así que se usa la única señal disponible: ¿ya le contestó?
                const isRead = isDocente && index < messages.length - 1;
                return (
                  <React.Fragment key={msg.id}>
                    {daySeparator}
                    <div className={cn('flex items-end gap-2', isDocente ? 'flex-row-reverse' : 'flex-row')}>
                      <CitationAvatar variant={isDocente ? 'institucion' : 'apoderado'} />
                      <div className={cn('flex min-w-0 flex-1 flex-col', isDocente ? 'items-end' : 'items-start')}>
                        <div
                          className={cn(
                            'relative max-w-[80%] rounded-2xl px-4 pb-5 pt-2.5 text-sm leading-relaxed',
                            isDocente
                              ? 'rounded-tr-sm bg-primary text-primary-foreground'
                              : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
                          )}
                        >
                          <p className="whitespace-pre-wrap pr-10">{msg.text}</p>
                          <span
                            className={cn(
                              'absolute bottom-1.5 right-3 flex items-center gap-1 text-xs',
                              isDocente ? 'text-primary-foreground/75' : 'text-slate-400 dark:text-slate-500',
                            )}
                          >
                            {bubbleTime(msg.timestamp)}
                            {isDocente && (
                              <CheckCheck
                                className={cn('h-4 w-4', isRead && 'text-accent')}
                                strokeWidth={2}
                                aria-label={isRead ? 'Leído por el apoderado' : 'Entregado, aún no leído'}
                              />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
