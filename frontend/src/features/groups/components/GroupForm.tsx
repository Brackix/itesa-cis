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
    } = useForm<CreateGroupInput>({
        defaultValues: initialData || {
            group_name: '',
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
        label: `${s.name} ${s.last_name} (${s.section})`,
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


            <div className="flex justify-content-end gap-2 mt-4">
                <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} type="button" />
                <Button label="Guardar" icon="pi pi-check" type="submit" />
            </div>
        </form>
    );
};
