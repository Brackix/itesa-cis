'use client'; // ProjectForm.tsx component


import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { useProjectStore } from '../hooks/useProjects';
import { useGroupStore } from '../../groups/hooks/useGroups';
import { Project, CreateProjectInput } from '../types/project.types';

interface ProjectFormProps {
    initialData?: Project | null;
    onHide: () => void;
}

export const ProjectForm = ({ initialData, onHide }: ProjectFormProps) => {
    const { addProject, updateProject } = useProjectStore();
    const { groups } = useGroupStore();
    
    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<CreateProjectInput>({
        defaultValues: initialData || {
            name: '',
            description: '',
            group_id: '',
        }
    });

    const onSubmit = (data: CreateProjectInput) => {
        if (initialData) {
            updateProject({ ...initialData, ...data });
        } else {
            addProject(data);
        }
        onHide();
    };

    const groupOptions = groups.map(g => ({
        label: g.group_name,
        value: g.id
    }));

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
            <div className="field">
                <label htmlFor="name" className="font-bold">Nombre del Proyecto</label>
                <InputText 
                    id="name" 
                    {...register('name', { required: true })} 
                    autoFocus 
                    className={classNames({ 'p-invalid': errors.name })} 
                />
                {errors.name && <small className="p-error">El nombre es requerido.</small>}
            </div>

            <div className="field">
                <label htmlFor="description" className="font-bold">Descripción</label>
                <InputTextarea 
                    id="description" 
                    rows={4} 
                    {...register('description')} 
                />
            </div>

            <div className="field">
                <label htmlFor="group_id" className="font-bold">Grupo</label>
                <Controller
                    name="group_id"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <Dropdown 
                            id="group_id" 
                            value={field.value} 
                            options={groupOptions} 
                            onChange={(e) => field.onChange(e.value)} 
                            placeholder="Seleccionar grupo"
                            className={classNames({ 'p-invalid': errors.group_id })}
                        />
                    )}
                />
                {errors.group_id && <small className="p-error">El grupo es requerido.</small>}
            </div>

            <div className="flex justify-content-end gap-2 mt-4">
                <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} type="button" />
                <Button label="Guardar" icon="pi pi-check" type="submit" />
            </div>
        </form>
    );
};
