import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  Paperclip,
  Mic,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Phone,
  BookOpen,
  FileText,
  Plus,
  X,
  MoreVertical,
  Lock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  CheckCheck,
  Tag,
  Share2,
  ExternalLink,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { ModuleProps } from '../types';
import { PageHeader, containerVariants } from '../components/UI';
import { APP_CONFIG } from '../constants';

interface Message {
  id: string;
  sender: 'parent' | 'teacher' | 'system' | 'note';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'image' | 'document' | 'audio';
    name: string;
    url?: string;
  };
}

interface Conversation {
  id: string;
  studentName: string;
  studentAvatar: string;
  parentName: string;
  parentPhone: string;
  parentRelationship: string;
  grade: string;
  section: string;
  level: 'Primaria' | 'Secundaria';
  category: 'Asistencia' | 'Incidencias' | 'Citaciones' | 'Comunicados';
  status: 'Sin atender' | 'En seguimiento' | 'Resuelto';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  attendanceRate: number;
  incidentCount: number;
  pendingCitations: number;
  messages: Message[];
}

export const WhatsAppModule: React.FC<ModuleProps> = ({ onNavigate }) => {
  // Mock conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      studentName: 'Mateo Rojas',
      studentAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      parentName: 'Elena Rojas',
      parentPhone: '+51 987 654 321',
      parentRelationship: 'Madre de Familia',
      grade: '2°',
      section: 'A',
      level: 'Secundaria',
      category: 'Citaciones',
      status: 'Sin atender',
      lastMessage: 'Buenas días profesor, confirmo la asistencia a la citación de mañana a las 8:00 AM.',
      lastMessageTime: '10:42 AM',
      unreadCount: 2,
      attendanceRate: 95,
      incidentCount: 0,
      pendingCitations: 1,
      messages: [
        {
          id: 'm1',
          sender: 'teacher',
          text: 'Estimada Sra. Elena, le saludamos del colegio I.E 6049 Ricardo Palma. Le enviamos la citación para coordinar la entrega de libreta y avance de Mateo.',
          timestamp: 'Ayer 04:15 PM',
          status: 'read'
        },
        {
          id: 'm2',
          sender: 'system',
          text: '📌 Citación Agendada: Entrega de libreta — 06/04/2026 a las 08:00 AM (Prof. María Suarez)',
          timestamp: 'Ayer 04:16 PM'
        },
        {
          id: 'm3',
          sender: 'parent',
          text: 'Buenas días profesor, confirmo la asistencia a la citación de mañana a las 8:00 AM.',
          timestamp: '10:42 AM'
        },
        {
          id: 'm4',
          sender: 'parent',
          text: '¿Debo llevar algún documento firmado?',
          timestamp: '10:43 AM'
        }
      ]
    },
    {
      id: 'conv-2',
      studentName: 'Valentina Sol',
      studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      parentName: 'Roberto Sol',
      parentPhone: '+51 912 345 678',
      parentRelationship: 'Padre de Familia',
      grade: '1°',
      section: 'A',
      level: 'Secundaria',
      category: 'Incidencias',
      status: 'En seguimiento',
      lastMessage: 'Entiendo profesor, conversarè con Valentina hoy mismo sobre el tema del celular.',
      lastMessageTime: '09:15 AM',
      unreadCount: 0,
      attendanceRate: 88,
      incidentCount: 2,
      pendingCitations: 1,
      messages: [
        {
          id: 'm10',
          sender: 'teacher',
          text: 'Estimado D. Roberto, se ha registrado una incidencia leve respecto al uso de celular en horario de clase de Matemáticas.',
          timestamp: 'Ayer 11:30 AM',
          status: 'read'
        },
        {
          id: 'm11',
          sender: 'system',
          text: '⚠️ Incidencia Registrada: Uso de celular no autorizado por Prof. Luis Gomez.',
          timestamp: 'Ayer 11:31 AM'
        },
        {
          id: 'm12',
          sender: 'note',
          text: 'Nota Interna Auxiliar: El apoderado llamó previamente para indicar que estaba pendiente de este caso.',
          timestamp: 'Ayer 02:00 PM'
        },
        {
          id: 'm13',
          sender: 'parent',
          text: 'Entiendo profesor, conversarè con Valentina hoy mismo sobre el tema del celular.',
          timestamp: '09:15 AM'
        }
      ]
    },
    {
      id: 'conv-3',
      studentName: 'Lucas Vega',
      studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      parentName: 'María Vega',
      parentPhone: '+51 945 882 119',
      parentRelationship: 'Madre de Familia',
      grade: '3°',
      section: 'B',
      level: 'Secundaria',
      category: 'Asistencia',
      status: 'Sin atender',
      lastMessage: 'Profesor, envío la foto del certificado médico por la falta de Lucas de ayer.',
      lastMessageTime: '08:30 AM',
      unreadCount: 1,
      attendanceRate: 82,
      incidentCount: 1,
      pendingCitations: 0,
      messages: [
        {
          id: 'm20',
          sender: 'parent',
          text: 'Buenos días, Lucas amaneció con fiebre y dolor de garganta. No podrá asistir a clases hoy.',
          timestamp: 'Ayer 07:15 AM'
        },
        {
          id: 'm21',
          sender: 'teacher',
          text: 'Buenos días Sra. María. Gracias por avisar. Recuerde adjuntar el certificado médico o nota para justificar la inasistencia.',
          timestamp: 'Ayer 08:00 AM',
          status: 'read'
        },
        {
          id: 'm22',
          sender: 'parent',
          text: 'Profesor, envío la foto del certificado médico por la falta de Lucas de ayer.',
          timestamp: '08:30 AM',
          attachment: {
            type: 'image',
            name: 'Certificado_Medico_LucasVega.jpg',
            url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&auto=format&fit=crop&q=80'
          }
        }
      ]
    },
    {
      id: 'conv-4',
      studentName: 'Camila Paz',
      studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      parentName: 'Andrés Paz',
      parentPhone: '+51 961 223 445',
      parentRelationship: 'Padre de Familia',
      grade: '4°',
      section: 'B',
      level: 'Secundaria',
      category: 'Comunicados',
      status: 'Resuelto',
      lastMessage: 'Muchas gracias por la información del taller de robótica.',
      lastMessageTime: 'Ayer',
      unreadCount: 0,
      attendanceRate: 98,
      incidentCount: 0,
      pendingCitations: 0,
      messages: [
        {
          id: 'm30',
          sender: 'teacher',
          text: '📢 COMUNICADO OFICIAL: Se invita a los alumnos destacados de 4° B al taller de robótica este sábado.',
          timestamp: 'Ayer 02:00 PM',
          status: 'read'
        },
        {
          id: 'm31',
          sender: 'parent',
          text: 'Muchas gracias por la información del taller de robótica.',
          timestamp: 'Ayer 03:10 PM'
        }
      ]
    },
    {
      id: 'conv-5',
      studentName: 'Juan Pérez',
      studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      parentName: 'Ana L. Pérez',
      parentPhone: '+51 933 112 778',
      parentRelationship: 'Madre de Familia',
      grade: '3°',
      section: 'C',
      level: 'Secundaria',
      category: 'Incidencias',
      status: 'En seguimiento',
      lastMessage: 'Ya hablé con Juan sobre la situación en Educación Física.',
      lastMessageTime: '2 días',
      unreadCount: 0,
      attendanceRate: 90,
      incidentCount: 3,
      pendingCitations: 1,
      messages: [
        {
          id: 'm40',
          sender: 'teacher',
          text: 'Estimada apoderada, le escribimos con urgencia para citarla por un incidente violento en el patio.',
          timestamp: 'Hace 2 días',
          status: 'read'
        },
        {
          id: 'm41',
          sender: 'system',
          text: '🚨 Incidencia Grave: Agresión física reportada por el Prof. José Pinto.',
          timestamp: 'Hace 2 días'
        },
        {
          id: 'm42',
          sender: 'parent',
          text: 'Ya hablé con Juan sobre la situación en Educación Física.',
          timestamp: 'Hace 2 días'
        }
      ]
    }
  ]);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [selectedGrade, setSelectedGrade] = useState<string>('Todos');
  const [selectedSection, setSelectedSection] = useState<string>('Todos');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'Todos' | 'Sin atender' | 'Resuelto'>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Conversation State
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');

  // Input composer state
  const [inputMode, setInputMode] = useState<'whatsapp' | 'note'>('whatsapp');
  const [messageText, setMessageText] = useState<string>('');
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showQuickActionModal, setShowQuickActionModal] = useState<'citation' | 'incident' | 'attendance' | 'announcement' | null>(null);

  // Quick action form inputs
  const [actionReason, setActionReason] = useState<string>('');
  const [actionDate, setActionDate] = useState<string>('2026-08-10');
  const [actionTime, setActionTime] = useState<string>('09:00 AM');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      // Category filter
      if (selectedCategory !== 'Todas' && c.category !== selectedCategory) return false;

      // Level filter
      if (selectedLevel !== 'Todos' && c.level !== selectedLevel) return false;

      // Grade filter
      if (selectedGrade !== 'Todos' && c.grade !== selectedGrade) return false;

      // Section filter
      if (selectedSection !== 'Todos' && c.section !== selectedSection) return false;

      // Status Tab filter
      if (selectedStatusTab === 'Sin atender' && c.status !== 'Sin atender') return false;
      if (selectedStatusTab === 'Resuelto' && c.status !== 'Resuelto') return false;

      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesStudent = c.studentName.toLowerCase().includes(q);
        const matchesParent = c.parentName.toLowerCase().includes(q);
        const matchesPhone = c.parentPhone.includes(q);
        const matchesMsg = c.lastMessage.toLowerCase().includes(q);
        return matchesStudent || matchesParent || matchesPhone || matchesMsg;
      }

      return true;
    });
  }, [conversations, selectedCategory, selectedLevel, selectedGrade, selectedSection, selectedStatusTab, searchQuery]);

  const activeConv = useMemo(() => {
    return conversations.find(c => c.id === activeConvId) || conversations[0];
  }, [conversations, activeConvId]);

  // Handle send message
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConv) return;

    const newMessage: Message = {
      id: 'm_' + Date.now(),
      sender: inputMode === 'whatsapp' ? 'teacher' : 'note',
      text: messageText,
      timestamp: 'Ahora',
      status: 'sent'
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          lastMessage: inputMode === 'note' ? `[Nota Interna] ${messageText}` : messageText,
          lastMessageTime: 'Ahora',
          unreadCount: 0,
          messages: [...c.messages, newMessage]
        };
      }
      return c;
    }));

    setMessageText('');
    showToast(inputMode === 'whatsapp' ? 'Mensaje de WhatsApp enviado al apoderado' : 'Nota interna agregada');
  };

  // Handle Quick Action submit (Citación, Incidencia, Justificación)
  const handleConfirmQuickAction = () => {
    if (!activeConv || !showQuickActionModal) return;

    let sysMsgText = '';
    let categoryUpdate: Conversation['category'] = activeConv.category;

    if (showQuickActionModal === 'citation') {
      sysMsgText = `📌 Citación registrada para ${actionDate} a las ${actionTime}. Motivo: ${actionReason || 'Coordinación escolar'}.`;
      categoryUpdate = 'Citaciones';
    } else if (showQuickActionModal === 'incident') {
      sysMsgText = `⚠️ Incidencia reportada en el sistema: ${actionReason || 'Falta de conducta'}.`;
      categoryUpdate = 'Incidencias';
    } else if (showQuickActionModal === 'attendance') {
      sysMsgText = `✅ Inasistencia justificada formalmente en el sistema de Asistencia.`;
      categoryUpdate = 'Asistencia';
    } else if (showQuickActionModal === 'announcement') {
      sysMsgText = `📢 Comunicado oficial enviado al apoderado: ${actionReason || 'Aviso escolar'}.`;
      categoryUpdate = 'Comunicados';
    }

    const sysMessage: Message = {
      id: 'sys_' + Date.now(),
      sender: 'system',
      text: sysMsgText,
      timestamp: 'Ahora'
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          category: categoryUpdate,
          status: 'En seguimiento',
          lastMessage: sysMsgText,
          lastMessageTime: 'Ahora',
          messages: [...c.messages, sysMessage]
        };
      }
      return c;
    }));

    setShowQuickActionModal(null);
    setActionReason('');
    showToast('Acción registrada y sincronizada con los módulos educativos');
  };

  // Predefined Response Templates
  const templates = [
    {
      title: 'Recordatorio de Citación',
      category: 'Citaciones',
      text: 'Estimado apoderado, le recordamos que tiene una citación programada para coordinar sobre el desempeño de su hijo/a. Agradecemos su puntualidad.'
    },
    {
      title: 'Aviso de Inasistencia Injustificada',
      category: 'Asistencia',
      text: 'Estimado apoderado, se registra la inasistencia de su menor hijo/a a las clases de hoy. Por favor enviar el justificante o certificado correspondiente.'
    },
    {
      title: 'Reporte de Conducta e Incidencia',
      category: 'Incidencias',
      text: 'Buenas tardes. Le notificamos que se ha presentado un incidente disciplinario con el alumno/a durante la jornada lectiva. Le solicitamos revisar el portal.'
    },
    {
      title: 'Felicitación Académica',
      category: 'Comunicados',
      text: '¡Felicitaciones! Queremos destacar el excelente desempeño y la constancia de su menor hijo/a en las últimas evaluaciones bimestrales.'
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full w-full font-poppins overflow-hidden bg-[#EFEAE2] dark:bg-[#0b141a]"
    >
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-emerald-600 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-white" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL 2 COLUMNAS (WHATSAPP WEB CLONE) */}
      <div className="flex-1 overflow-hidden flex w-full">
        
        {/* COLUMNA 1: SIDEBAR IZQUIERDO (Lista de chats) */}
        <section className="w-full sm:w-[350px] md:w-[400px] bg-white dark:bg-[#111b21] flex flex-col shrink-0 overflow-hidden border-r border-slate-200 dark:border-slate-800/60 z-10">
          
          {/* HEADER SIDEBAR (Perfil y acciones) */}
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                <img src={APP_CONFIG.schoolLogo} alt="Perfil" className="w-full h-full object-contain scale-75" referrerPolicy="no-referrer" />
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">I.E 6049 WhatsApp</h1>
            </div>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              <button><MessageCircle className="w-5 h-5" /></button>
              <button><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>

          {/* SEARCH BAR & FILTERS */}
          <div className="bg-white dark:bg-[#111b21] p-2 flex flex-col gap-2 shrink-0 border-b border-slate-100 dark:border-slate-800/30">
            <div className="relative flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5 mx-2">
              <Search className="w-4 h-4 text-[#54656f] dark:text-[#aebac1] shrink-0" />
              <input
                type="text"
                placeholder="Busca un chat o inicia uno nuevo"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none pl-4 pr-2 text-sm text-[#111b21] dark:text-white outline-none placeholder:text-[#54656f] dark:placeholder:text-[#aebac1]"
              />
            </div>

            {/* EDUCATIONAL & CATEGORY FILTERS */}
            <div className="flex gap-2 px-2 pb-1 overflow-x-auto hidden-scrollbar">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[12px] px-2 py-1.5 rounded-full outline-none"
              >
                <option value="Todas">Categoría</option>
                <option value="Asistencia">Asistencia</option>
                <option value="Incidencias">Incidencias</option>
                <option value="Citaciones">Citaciones</option>
                <option value="Comunicados">Comunicados</option>
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[12px] px-2 py-1.5 rounded-full outline-none"
              >
                <option value="Todos">Nivel</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[12px] px-2 py-1.5 rounded-full outline-none"
              >
                <option value="Todos">Grado</option>
                <option value="1°">1°</option>
                <option value="2°">2°</option>
                <option value="3°">3°</option>
                <option value="4°">4°</option>
                <option value="5°">5°</option>
                <option value="6°">6°</option>
              </select>

              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[12px] px-2 py-1.5 rounded-full outline-none"
              >
                <option value="Todos">Sec.</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </div>

            {/* LISTA DE CHATS */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/10 hidden-scrollbar">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                  <MessageSquare className="w-8 h-8 stroke-1" />
                  <p className="text-xs font-bold">No hay chats</p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const isSelected = conv.id === activeConv?.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`px-3 py-3 flex gap-3 cursor-pointer transition-colors relative ${
                        isSelected
                          ? 'bg-[#f0f2f5] dark:bg-[#2a3942]'
                          : 'bg-white dark:bg-[#111b21] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]'
                      }`}
                    >
                      {/* Avatar del estudiante */}
                      <div className="relative shrink-0">
                        <img
                          src={conv.studentAvatar}
                          alt={conv.studentName}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                      </div>

                      {/* Contenido info */}
                      <div className="flex-1 min-w-0 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-[15px] font-normal text-[#111b21] dark:text-[#e9edef] truncate">
                            {conv.parentName}
                          </h4>
                          <span className={`text-[12px] shrink-0 ${conv.unreadCount > 0 ? 'text-[#25D366] dark:text-[#00a884] font-medium' : 'text-[#667781] dark:text-[#8696a0]'}`}>
                            {conv.lastMessageTime}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] text-[#667781] dark:text-[#8696a0] truncate mb-0.5">
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 bg-[#25D366] dark:bg-[#00a884] text-white text-[11px] font-medium w-5 h-5 rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* COLUMNA 2: CHAT VIEWPORT PRINCIPAL */}
          <main className="flex-1 flex flex-col overflow-hidden relative bg-[#efeae2] dark:bg-[#0b141a]">
            {activeConv ? (
              <>
                {/* CHAT HEADER */}
                <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2 flex items-center justify-between shrink-0 z-10 h-[59px]">
                  {/* Info Apoderado + Estudiante */}
                  <div className="flex items-center gap-3">
                    <img
                      src={activeConv.studentAvatar}
                      alt={activeConv.studentName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex flex-col">
                      <h2 className="text-[15px] font-normal text-[#111b21] dark:text-[#e9edef] truncate">
                        {activeConv.parentName}
                      </h2>
                      <span className="text-[13px] text-[#667781] dark:text-[#8696a0] truncate">
                        {activeConv.studentName} • {activeConv.parentPhone}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
                    <button><Search className="w-5 h-5" /></button>
                    <button><MoreVertical className="w-5 h-5" /></button>
                  </div>
                </div>

                {/* MESSAGES THREAD */}
                <div className="absolute inset-0 top-[59px] bottom-[62px] bg-[#efeae2] dark:bg-[#0b141a] z-0">
                  <div className="absolute inset-0 [background-image:url('https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png')] dark:[background-image:url('https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png')] bg-repeat opacity-40 dark:opacity-10 mix-blend-overlay"></div>
                </div>
                
                <div className="flex-1 overflow-y-auto px-[5%] py-4 flex flex-col gap-1.5 z-10 hidden-scrollbar">
                  
                  <div className="text-center my-3">
                    <span className="bg-white/80 dark:bg-[#182229]/80 backdrop-blur-sm text-[#54656f] dark:text-[#8696a0] text-[12px] font-medium px-4 py-1.5 rounded-lg shadow-sm">
                      Historial de Atención Educativa — I.E 6049
                    </span>
                  </div>

                  {activeConv.messages.map((msg) => {
                    if (msg.sender === 'system') {
                      return (
                        <div key={msg.id} className="my-2 flex justify-center">
                          <div className="bg-white/90 dark:bg-[#182229]/90 backdrop-blur-sm text-[#54656f] dark:text-[#8696a0] px-4 py-1.5 rounded-lg text-[12px] shadow-sm flex items-center gap-2 max-w-lg">
                            <span>{msg.text}</span>
                          </div>
                        </div>
                      );
                    }

                    if (msg.sender === 'note') {
                      return (
                        <div key={msg.id} className="my-2 flex justify-center">
                          <div className="bg-[#fff3c4] dark:bg-[#423a23] text-[#111b21] dark:text-[#e9edef] px-4 py-2 rounded-lg text-[13px] shadow-sm flex flex-col max-w-md border border-[#e6d070] dark:border-[#524933]">
                            <span className="font-semibold text-[#8b7515] dark:text-[#f8e182] text-[11px] uppercase block mb-1 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Nota Interna Docente
                            </span>
                            <p>{msg.text}</p>
                          </div>
                        </div>
                      );
                    }

                    const isTeacher = msg.sender === 'teacher';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'} mb-1`}
                      >
                        <div className={`max-w-[80%] md:max-w-[70%] p-2 rounded-lg text-[14.2px] shadow-sm relative ${
                          isTeacher
                            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none'
                            : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none'
                        }`}>
                          
                          {/* Attachments if any */}
                          {msg.attachment && (
                            <div className="mb-2 rounded-md overflow-hidden">
                              {msg.attachment.type === 'image' ? (
                                <img src={msg.attachment.url} alt={msg.attachment.name} className="w-full max-h-64 object-cover" />
                              ) : (
                                <div className="p-3 bg-black/5 flex items-center gap-3">
                                  <FileText className="w-8 h-8 text-[#54656f] dark:text-[#aebac1]" />
                                  <span className="truncate">{msg.attachment.name}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap items-end justify-between gap-2">
                            <p className="whitespace-pre-wrap leading-relaxed pr-8">{msg.text}</p>

                            <div className={`flex items-center gap-1 text-[11px] absolute bottom-1.5 right-2 ${
                              isTeacher ? 'text-[#667781] dark:text-[#8696a0]' : 'text-[#667781] dark:text-[#8696a0]'
                            }`}>
                              <span>{msg.timestamp.replace('Ayer ', '')}</span>
                              {isTeacher && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* COMPOSER / INPUT BAR */}
                <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2.5 shrink-0 flex items-end gap-3 z-20">
                  <div className="flex items-center gap-3 pb-1 text-[#54656f] dark:text-[#aebac1]">
                    <button><Plus className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg flex items-center px-3 py-2">
                    <textarea
                      rows={1}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Escribe un mensaje"
                      className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#111b21] dark:text-white resize-none max-h-32"
                      style={{ minHeight: '24px' }}
                    />
                  </div>

                  <div className="flex items-center gap-3 pb-1 text-[#54656f] dark:text-[#aebac1]">
                    {messageText.trim() ? (
                      <button onClick={handleSendMessage} className="text-[#00a884]">
                        <Send className="w-6 h-6" />
                      </button>
                    ) : (
                      <button><Mic className="w-6 h-6" /></button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#54656f] dark:text-[#8696a0] bg-[#f0f2f5] dark:bg-[#222e35]">
                <img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669aeJeom.png" alt="WhatsApp" className="w-80 opacity-50 mb-8 mix-blend-multiply dark:mix-blend-screen" />
                <h2 className="text-3xl font-light text-[#41525d] dark:text-[#e9edef] mb-4">WhatsApp para Web</h2>
                <p className="text-sm">Envía y recibe mensajes sin mantener tu teléfono conectado.</p>
                <p className="text-sm mt-1">Usa WhatsApp en hasta 4 dispositivos vinculados y 1 teléfono a la vez.</p>
              </div>
            )}
          </main>
        </div>

      {/* MODAL DE PLANTILLAS RÁPIDAS */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Plantillas de Respuestas Oficiales</span>
              </h3>
              <button onClick={() => setShowTemplatesModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              {templates.map((tpl, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setMessageText(tpl.text);
                    setShowTemplatesModal(false);
                    showToast('Plantilla insertada');
                  }}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700/50 rounded-2xl cursor-pointer transition-all hover:border-emerald-400"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{tpl.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tpl.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ACCIÓN RÁPIDA (AGENDAR CITACIÓN / REPORTAR INCIDENCIA / JUSTIFICAR) */}
      {showQuickActionModal && activeConv && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                {showQuickActionModal === 'citation' && <Calendar className="w-4 h-4 text-blue-500" />}
                {showQuickActionModal === 'incident' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                {showQuickActionModal === 'attendance' && <Clock className="w-4 h-4 text-amber-500" />}
                {showQuickActionModal === 'announcement' && <FileText className="w-4 h-4 text-emerald-500" />}
                <span>
                  {showQuickActionModal === 'citation' && 'Agendar Citación Oficial'}
                  {showQuickActionModal === 'incident' && 'Registrar Incidencia Disciplinaria'}
                  {showQuickActionModal === 'attendance' && 'Justificar Inasistencia del Estudiante'}
                  {showQuickActionModal === 'announcement' && 'Enviar Comunicado'}
                </span>
              </h3>
              <button onClick={() => setShowQuickActionModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl font-bold text-slate-700 dark:text-slate-300">
                <p>Estudiante: <span className="text-slate-900 dark:text-white">{activeConv.studentName}</span> ({activeConv.grade} {activeConv.section})</p>
                <p>Apoderado: <span className="text-slate-900 dark:text-white">{activeConv.parentName}</span></p>
              </div>

              {showQuickActionModal === 'citation' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="font-extrabold text-slate-500">Fecha de Citación</label>
                    <input
                      type="date"
                      value={actionDate}
                      onChange={(e) => setActionDate(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-extrabold text-slate-500">Hora</label>
                    <input
                      type="text"
                      value={actionTime}
                      onChange={(e) => setActionTime(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1">
                <label className="font-extrabold text-slate-500">Motivo / Detalle de la Acción</label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Escribe el motivo o detalle..."
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowQuickActionModal(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmQuickAction}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-extrabold shadow-md"
              >
                Confirmar y Registrar
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};
