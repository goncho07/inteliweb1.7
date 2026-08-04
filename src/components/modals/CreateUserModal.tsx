import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { modalVariants } from '@/lib/motion';

const USER_TYPES = ['Estudiante', 'Docente', 'Administrativo'] as const;

export const CreateUserModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<string>('Estudiante');
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex w-full max-w-[500px] max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
              <UserPlus size={16} strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Crear usuario</h2>
          </div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="rounded-full"
                >
                  <X size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cerrar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-user-type">Tipo de usuario</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="create-user-type" className="h-12 w-full rounded-xl text-base">
                <SelectValue placeholder="Seleccionar tipo de usuario" />
              </SelectTrigger>
              <SelectContent>
                {USER_TYPES.map((userType) => (
                  <SelectItem key={userType} value={userType}>
                    {userType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-user-name">Nombre completo</Label>
            <Input id="create-user-name" type="text" placeholder="Nombre y apellidos" className="h-12 rounded-xl text-base" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-user-dni">DNI</Label>
            <Input id="create-user-dni" type="text" placeholder="Documento de identidad" className="h-12 rounded-xl text-base" />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 p-6 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={onClose} className="rounded-xl px-8">
            Registrar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
