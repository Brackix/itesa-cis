'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';
import { useStudentStore } from '../hooks/useStudents';
import { Student, CreateStudentInput } from '../types/student.types';

interface StudentFormProps {
    initialData?: Student | null;
    onHide: () => void;
}

export const StudentForm = ({ initialData, onHide }: StudentFormProps) => {
    const { addStudent, updateStudent } = useStudentStore();
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CreateStudentInput>({
        defaultValues: initialData || {
            list_number: 0,
            name: '',
            last_name: '',
            section: '',
        }
    });

    const onSubmit = (data: CreateStudentInput) => {
        if (initialData) {
            updateStudent({ ...initialData, ...data });
        } else {
            addStudent(data);
        }
        onHide();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
            <div className="field">
                <label htmlFor="list_number" className="font-bold">No. Lista</label>
                <InputNumber 
                    id="list_number" 
                    value={watch('list_number')} 
                    onValueChange={(e) => setValue('list_number', e.value || 0)} 
                    className={classNames({ 'p-invalid': errors.list_number })}
                />
                {errors.list_number && <small className="p-error">El número de lista es requerido.</small>}
            </div>

            <div className="field">
                <label htmlFor="name" className="font-bold">Nombre</label>
                <InputText 
                    id="name" 
                    {...register('name', { required: true })} 
                    autoFocus 
                    className={classNames({ 'p-invalid': errors.name })} 
                />
                {errors.name && <small className="p-error">El nombre es requerido.</small>}
            </div>

            <div className="field">
                <label htmlFor="last_name" className="font-bold">Apellido</label>
                <InputText 
                    id="last_name" 
                    {...register('last_name', { required: true })} 
                    className={classNames({ 'p-invalid': errors.last_name })} 
                />
                {errors.last_name && <small className="p-error">El apellido es requerido.</small>}
            </div>

            <div className="field">
                <label htmlFor="section" className="font-bold">Sección</label>
                <InputText 
                    id="section" 
                    {...register('section', { required: true, maxLength: 1 })} 
                    className={classNames({ 'p-invalid': errors.section })} 
                />
                {errors.section && <small className="p-error">La sección es requerida (máx. 1 carácter).</small>}
            </div>

            <div className="flex justify-content-end gap-2 mt-4">
                <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} type="button" />
                <Button label="Guardar" icon="pi pi-check" type="submit" />
            </div>
        </form>
    );
};
