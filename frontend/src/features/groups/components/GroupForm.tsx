'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { useGroupStore } from '../hooks/useGroups';
import { useStudentStore } from '../../students/hooks/useStudents';
import { Group, CreateGroupInput } from '../types/group.types';

interface GroupFormProps {
    initialData?: Group | null;
    onHide: () => void;
}

export const GroupForm = ({ initialData, onHide }: GroupFormProps) => {
    const { addGroup, updateGroup } = useGroupStore();
    const { students } = useStudentStore();
    const toast = useRef<Toast>(null);
    
    // UI State for the builder
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]); 
    const [coordinatorId, setCoordinatorId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSection, setFilterSection] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<{ group_name: string }>({
        defaultValues: { group_name: initialData?.group_name || '' }
    });

    // Derive available unassigned students
    const availableStudents = useMemo(() => {
        return students.filter(s => 
            !s.in_group && 
            !selectedStudents.find(selected => selected.id === s.id) &&
            (!filterSection || s.section === filterSection) &&
            (!searchQuery || `${s.name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()))
        ).sort((a,b) => (a.list_number || 0) - (b.list_number || 0));
    }, [students, selectedStudents, filterSection, searchQuery]);

    const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    const addStudent = (student: any) => {
        if (selectedStudents.length >= 7) {
            toast.current?.show({ severity: 'warn', summary: 'Límite alcanzado', detail: 'Solo puedes tener un máximo de 7 estudiantes.' });
            return;
        }
        
        setSelectedStudents(prev => {
            const next = [...prev, student];
            // Auto pick coordinator if it's the first
            if (next.length === 1) setCoordinatorId(student.id);
            return next;
        });
    };

    const removeStudent = (studentId: string) => {
        setSelectedStudents(prev => {
            const next = prev.filter(s => s.id !== studentId);
            if (coordinatorId === studentId) {
                setCoordinatorId(next.length > 0 ? next[0].id : null);
            }
            return next;
        });
    };

    const onSubmit = (data: { group_name: string }) => {
        if (initialData) {
            updateGroup({ ...initialData, group_name: data.group_name });
        } else {
            // Validation
            if (selectedStudents.length > 0 && !coordinatorId) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Debes seleccionar un coordinador explícitamente.' });
                return;
            }

            const structuredData: CreateGroupInput = {
                group_name: data.group_name,
                students: selectedStudents.map(s => ({
                    id: s.id,
                    isCoordinator: s.id === coordinatorId
                }))
            };
            addGroup(structuredData);
        }
        onHide();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
            <Toast ref={toast} />
            <div className="field">
                <label htmlFor="group_name" className="font-bold">Nombre del Grupo</label>
                <InputText 
                    id="group_name" 
                    {...register('group_name', { required: true })} 
                    autoFocus 
                    placeholder="Ej. Los Innovadores"
                    className={classNames({ 'p-invalid': errors.group_name })} 
                />
                {errors.group_name && <small className="p-error">El nombre del grupo es requerido.</small>}
            </div>

            {!initialData && (
                <div className="grid mt-4 border-top-1 surface-border pt-4">
                    {/* Left Column: Available */}
                    <div className="col-12 md:col-6 flex flex-column gap-3">
                        <div className="font-bold text-lg mb-2 text-900 border-bottom-1 surface-border pb-2">Estudiantes Disponibles</div>
                        
                        <div className="flex gap-2">
                           <span className="p-input-icon-left w-full">
                               <i className="pi pi-search" />
                               <InputText placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                           </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div 
                                className={`cursor-pointer px-3 py-1 border-round text-sm font-bold transition-colors ${filterSection === null ? 'bg-primary' : 'surface-200 text-700 hover:surface-300'}`}
                                onClick={() => setFilterSection(null)}
                            >All</div>
                            {SECTIONS.map(s => (
                                <div 
                                    key={s}
                                    className={`cursor-pointer px-3 py-1 border-round text-sm font-bold transition-colors ${filterSection === s ? 'bg-primary' : 'surface-200 text-700 hover:surface-300'}`}
                                    onClick={() => setFilterSection(s)}
                                >{s}</div>
                            ))}
                        </div>

                        <div className="flex flex-column gap-2 overflow-y-auto pr-2" style={{ maxHeight: '350px' }}>
                            {availableStudents.map(s => (
                                <div key={s.id} className="flex align-items-center justify-content-between p-2 border-round surface-card border-1 surface-border hover:surface-hover transition-colors">
                                    <div className="flex align-items-center gap-3">
                                        <div className="flex align-items-center justify-content-center bg-blue-100 text-blue-800 font-bold border-circle flex-shrink-0" style={{ width: '2.5rem', height: '2.5rem' }}>
                                            {s.list_number || '?'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-900 line-height-2">{s.name} {s.last_name}</div>
                                            <div className="text-500 text-sm">Sección {s.section || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <Button icon="pi pi-plus" rounded text severity="success" onClick={(e) => { e.preventDefault(); addStudent(s); }} />
                                </div>
                            ))}
                            {availableStudents.length === 0 && (
                                <div className="text-center text-500 py-4">No hay estudiantes disponibles.</div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Selected */}
                    <div className="col-12 md:col-6 flex flex-column gap-3">
                        <div className="font-bold text-lg mb-2 text-900 border-bottom-1 surface-border pb-2 flex justify-content-between align-items-center">
                            <span>Módulo del Grupo</span>
                            <span className={`text-sm px-2 py-1 font-bold border-round ${selectedStudents.length === 7 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                {selectedStudents.length} / 7
                            </span>
                        </div>

                        <div className="flex flex-column gap-2">
                            {selectedStudents.map(s => (
                                <div key={s.id} className="flex align-items-center justify-content-between p-2 border-round surface-card border-1 surface-border transition-colors animate-fadein">
                                    <div className="flex align-items-center gap-3">
                                        <Button 
                                            icon="pi pi-star-fill" 
                                            rounded 
                                            text 
                                            severity={coordinatorId === s.id ? "warning" : "secondary"} 
                                            className={coordinatorId === s.id ? 'bg-orange-50' : ''}
                                            tooltip={coordinatorId === s.id ? "Coordinador" : "Hacer Coordinador"}
                                            tooltipOptions={{ position: 'top'}}
                                            onClick={(e) => { e.preventDefault(); setCoordinatorId(s.id); }}
                                        />
                                        <div>
                                            <div className="font-bold text-900 line-height-2">{s.name} {s.last_name}</div>
                                            <div className="text-500 text-sm">#{s.list_number} - Sec. {s.section}</div>
                                        </div>
                                    </div>
                                    <Button icon="pi pi-times" rounded text severity="danger" onClick={(e) => { e.preventDefault(); removeStudent(s.id); }} />
                                </div>
                            ))}

                            {selectedStudents.length === 0 && (
                                <div className="flex flex-column align-items-center justify-content-center text-500 p-5 border-2 border-dashed surface-border border-round mt-3">
                                    <i className="pi pi-users text-4xl mb-3 text-300"></i>
                                    <span className="font-medium">Agrega estudiantes al grupo</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-content-end gap-2 mt-5 pt-3 border-top-1 surface-border">
                <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} type="button" />
                <Button label="Guardar Grupo" icon="pi pi-check" type="submit" />
            </div>
        </form>
    );
};
