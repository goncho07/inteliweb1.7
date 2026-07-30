import React, { useState } from 'react';
import { Bell, IdCard, Pencil, Phone, User, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface DataFieldProps {
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  icon: LucideIcon;
}

/** Par etiqueta/valor con icono, usado en las fichas de detalle de usuario. */
export const DataField: React.FC<DataFieldProps> = ({ label, value, subValue, icon: Icon }) => (
  <div className="flex items-center gap-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400">
      <Icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-400">
        {label}
      </p>
      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
        {value}
        {subValue && <span className="ml-1 text-xs font-medium text-gray-500">{subValue}</span>}
      </p>
    </div>
  </div>
);

interface FamilyRowProps {
  role: string;
  name: string;
  dni: string;
  phone: string;
  color?: 'pink' | 'blue';
  isNotified: boolean;
  onSetNotified: () => void;
}

/**
 * Fila editable de un familiar (padre/madre) con designación de apoderado.
 * La edición es local: al guardar sólo se refleja en pantalla, aún no persiste.
 */
export const FamilyRow: React.FC<FamilyRowProps> = ({
  role,
  name,
  dni,
  phone,
  color,
  isNotified,
  onSetNotified,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState(phone);
  const [editedName, setEditedName] = useState(name);
  const [editedDni, setEditedDni] = useState(dni);

  const isPink = color === 'pink';
  const accent = cn(
    isPink ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400',
    isPink ? 'bg-pink-50 dark:bg-pink-900/20' : 'bg-blue-50 dark:bg-blue-900/20',
    isPink ? 'border-pink-100 dark:border-pink-800' : 'border-blue-100 dark:border-blue-800',
  );

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedName(name);
    setEditedPhone(phone);
    setEditedDni(dni);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-6 p-6 transition-all hover:bg-gray-50/50 dark:hover:bg-slate-800/30',
        isNotified && 'bg-blue-50/20 dark:bg-blue-900/5',
      )}
    >
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-4">
          <div
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-xl font-bold shadow-sm',
              accent,
            )}
          >
            {role[0]}
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Nombre Completo
                  </Label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Nombre completo"
                      className="rounded-xl pl-10 text-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    DNI / Documento
                  </Label>
                  <div className="relative">
                    <IdCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={editedDni}
                      onChange={(e) => setEditedDni(e.target.value)}
                      placeholder="DNI"
                      className="rounded-xl pl-10 text-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Teléfono de Contacto
                  </Label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      placeholder="Teléfono"
                      className="rounded-xl pl-10 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-1.5 flex items-center gap-3">
                  <p className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    {editedName}
                  </p>
                  <span className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase', accent)}>
                    {role}
                  </span>
                  {isNotified && (
                    <span className="flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <Bell size={10} /> Apoderado
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <IdCard size={14} className="text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-200">{editedDni}</span>
                  </span>
                  <span className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-200">+51 {editedPhone}</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                className="rounded-xl bg-emerald-600 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
              >
                Guardar
              </Button>
              <Button
                variant="secondary"
                onClick={cancelEdit}
                className="rounded-xl text-xs font-black uppercase tracking-wider"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="gap-2 rounded-xl bg-blue-600 text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700"
            >
              <Pencil size={14} />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'rounded-lg p-2',
              isNotified ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400',
            )}
          >
            <Bell size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">Recibir Notificaciones</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Designar como apoderado principal para avisos y alertas.
            </p>
          </div>
        </div>

        <Switch
          checked={isNotified}
          onCheckedChange={onSetNotified}
          disabled={isNotified}
          aria-label="Designar como apoderado principal"
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>
    </div>
  );
};
