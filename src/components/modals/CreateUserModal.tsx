import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { modalVariants } from '@/lib/motion';

export const CreateUserModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [type, setType] = useState('Estudiante');
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex justify-center items-center p-4" onClick={onClose}>
      <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-600 p-8 flex justify-between items-center text-white"><h2 className="text-2xl font-bold">Nuevo Registro</h2><button onClick={onClose}><X/></button></div>
        <div className="p-8 space-y-6">
           <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none"><option>Estudiante</option><option>Docente</option><option>Administrativo</option></select>
           <input type="text" className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none" placeholder="Nombre Completo"/>
           <input type="text" className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none" placeholder="DNI"/>
           <button onClick={onClose} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl">Registrar</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
