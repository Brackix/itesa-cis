'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
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
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CreateGroupInput>({
        defaultValues: initialData || {
            group_name: '',
            project_name: '',
            project_desc: '',
            student_id: '',
        }
    });

    const onSubmit = (data: CreateGroupInput) => {
        if (initialData) {
            updateGroup({ ...initialData, ...data });
        } else {
            addGroup(data);
        }
        onHide();
    };

    const studentOptions = students.map(s => ({
        label: `${s.name} ${s.lastname} (${s.section})`,
        value: s.id
    }));

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
            <div className="field">
                <label htmlFor="group_name" className="font-bold">Nombre del Grupo</label>
                <InputText 
                    id="group_name" 
                    {...register('group_name', { required: true })} 
                    autoFocus 
                    className={classNames({ 'p-invalid': errors.group_name })} 
                />
                {errors.group_name && <small className="p-error">El nombre del grupo es requerido.</small>}
            </div>

            <div className="field">
                <label htmlFor="project_name" className="font-bold">Nombre del Proyecto</label>
                <InputText 
                    id="project_name" 
                    {...register('project_name', { required: true })} 
                    className={classNames({ 'p-invalid': errors.project_name })} 
                />
                {errors.project_name && <small className="p-error">El nombre del proyecto es requerido.</small>}
            </div>

            <div className="field">
                <label htmlFor="project_desc" className="font-bold">Descripción del Proyecto</label>
                <InputTextarea 
                    id="project_desc" 
                    rows={4} 
                    {...register('project_desc', { required: true })} 
                    className={classNames({ 'p-invalid': errors.project_desc })} 
                />
                {errors.project_desc && <small className="p-error">La descripción es requerida (mín. 10 caracteres).</small>}
            </div>

            <div className="field">
                <label htmlFor="student_id" className="font-bold">Líder del Grupo</label>
                <Dropdown 
                    id="student_id" 
                    value={watch('student_id')} 
                    options={studentOptions} 
                    onChange={(e) => setValue('student_id', e.value)} 
                    placeholder="Seleccionar líder"
                    className={classNames({ 'p-invalid': errors.student_id })}
                />
                {errors.student_id && <small className="p-error">El líder del grupo es requerido.</small>}
            </div>

            <div className="flex justify-content-end gap-2 mt-4">
                <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} type="button" />
                <Button label="Guardar" icon="pi pi-check" type="submit" />
            </div>
        </form>
    );
};
