'use client';

import React, { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { useStudentStore } from '../hooks/useStudents';
import { Student, CreateStudentInput } from '../types/student.types';

interface StudentFormProps {
    initialData?: Student | null;
    onHide: () => void;
}

export const StudentForm = ({ initialData, onHide }: StudentFormProps) => {
    const { addStudent, updateStudent, loading } = useStudentStore();
    
    const {
        handleSubmit,
        control,
    } = useForm<CreateStudentInput>({
        defaultValues: initialData || {
            list_number: 0,
            name: '',
            last_name: '',
            section: '',
        }
    });

    const toast = useRef<Toast>(null);

    const onSubmit = async (data: CreateStudentInput) => {
        try {
            const cleanData = {
                ...data,
                name: data.name.trim(),
                last_name: data.last_name.trim()
            };

            if (initialData) {
                await updateStudent({ ...initialData, ...cleanData });
            } else {
                await addStudent(cleanData);
            }
            onHide();
        } catch (error: any) {
            if (error.message === 'STUDENT_ALREADY_EXISTS_IN_SECTION') {
                toast.current?.show({ severity: 'error', summary: 'Estudiante Duplicado', detail: `El número #${data.list_number} ya fue asignado en la Sección ${data.section}.`, life: 5000 });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error de Guardado', detail: 'No se pudo guardar el estudiante. Intente de nuevo.', life: 4000 });
            }
        }
    };

    return (
        <React.Fragment>
        <Toast ref={toast} />
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
            <div className="field">
                <label htmlFor="list_number" className="font-bold">No. Lista</label>
                <Controller
                    name="list_number"
                    control={control}
                    rules={{ required: 'El número de lista es requerido.', min: { value: 1, message: 'El mínimo es 1.' } }}
                    render={({ field, fieldState }) => (
                        <>
                            <InputNumber 
                                id={field.name}
                                value={field.value}
                                onValueChange={(e) => field.onChange(e.value || null)}
                                min={1}
                                className={classNames({ 'p-invalid': fieldState.error })}
                            />
                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                        </>
                    )}
                />
            </div>

            <div className="field">
                <label htmlFor="name" className="font-bold">Nombre</label>
                <Controller
                    name="name"
                    control={control}
                    rules={{ 
                        required: 'El nombre es requerido.', 
                        validate: (value) => value.trim().length > 0 || 'El nombre no puede estar vacío.' 
                    }}
                    render={({ field, fieldState }) => (
                        <>
                            <InputText 
                                id={field.name}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                autoFocus 
                                className={classNames({ 'p-invalid': fieldState.error })} 
                            />
                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                        </>
                    )}
                />
            </div>

            <div className="field">
                <label htmlFor="last_name" className="font-bold">Apellido</label>
                <Controller
                    name="last_name"
                    control={control}
                    rules={{ 
                        required: 'El apellido es requerido.', 
                        validate: (value) => value.trim().length > 0 || 'El apellido no puede estar vacío.' 
                    }}
                    render={({ field, fieldState }) => (
                        <>
                            <InputText 
                                id={field.name}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className={classNames({ 'p-invalid': fieldState.error })} 
                            />
                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                        </>
                    )}
                />
            </div>

            <div className="field">
                <label htmlFor="section" className="font-bold">Sección</label>
                <Controller
                    name="section"
                    control={control}
                    rules={{ required: 'La sección es requerida.' }}
                    render={({ field, fieldState }) => (
                        <>
                            <Dropdown
                                id={field.name}
                                value={field.value}
                                onChange={(e) => field.onChange(e.value)}
                                options={['A', 'B', 'C', 'D', 'E', 'F', 'G']}
                                placeholder="Seleccione una sección"
                                className={classNames({ 'p-invalid': fieldState.error })}
                            />
                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                        </>
                    )}
                />
            </div>

            <div className="flex justify-content-end gap-2 mt-4">
                <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} type="button" disabled={loading} />
                <Button label="Guardar" icon="pi pi-check" type="submit" loading={loading} />
            </div>
        </form>
        </React.Fragment>
    );
};
