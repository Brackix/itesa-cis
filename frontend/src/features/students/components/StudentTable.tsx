'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useStudentStore } from '../hooks/useStudents';
import { Student } from '../types/student.types';
import { StudentForm } from './StudentForm';

export const StudentTable = () => {
    const { students, loading, fetchStudents, deleteStudent } = useStudentStore();
    const [studentDialog, setStudentDialog] = useState(false);
    const [deleteStudentDialog, setDeleteStudentDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const openNew = () => {
        setSelectedStudent(null);
        setStudentDialog(true);
    };

    const editStudent = (student: Student) => {
        setSelectedStudent(student);
        setStudentDialog(true);
    };

    const confirmDeleteStudent = (student: Student) => {
        setSelectedStudent(student);
        setDeleteStudentDialog(true);
    };

    const hideStudentDialog = () => {
        setStudentDialog(false);
    };

    const hideDeleteStudentDialog = () => {
        setDeleteStudentDialog(false);
    };

    const submitDelete = () => {
        if (selectedStudent) {
            deleteStudent(selectedStudent.id);
            setDeleteStudentDialog(false);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Estudiante eliminado', life: 3000 });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const actionBodyTemplate = (rowData: Student) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined severity="success" onClick={() => editStudent(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteStudent(rowData)} />
            </div>
        );
    };

    const deleteStudentDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteStudentDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={submitDelete} />
        </React.Fragment>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

            <DataTable
                value={students}
                loading={loading}
                paginator
                rows={10}
                className="datatable-responsive"
                emptyMessage="No se encontraron estudiantes."
            >
                <Column field="list_number" header="No. Lista" sortable></Column>
                <Column field="name" header="Nombre" sortable></Column>
                <Column field="last_name" header="Apellido" sortable></Column>
                <Column field="section" header="Sección" sortable></Column>

                <Column
                    field="in_group"
                    header="En Grupo"
                    body={(rowData: Student) => (
                        <span className={`customer-badge status-${rowData.in_group ? 'qualified' : 'unqualified'}`}>
                            {rowData.in_group ? 'Sí' : 'No'}
                        </span>
                    )}
                    sortable
                ></Column>
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
            </DataTable>

            <Dialog
                visible={studentDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header={selectedStudent ? "Editar Estudiante" : "Nuevo Estudiante"}
                modal
                className="p-fluid"
                onHide={hideStudentDialog}
            >
                <StudentForm
                    initialData={selectedStudent}
                    onHide={hideStudentDialog}
                />
            </Dialog>

            <Dialog
                visible={deleteStudentDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar"
                modal
                footer={deleteStudentDialogFooter}
                onHide={hideDeleteStudentDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedStudent && (
                        <span>
                            ¿Estás seguro de que quieres eliminar a <b>{selectedStudent.name} {selectedStudent.last_name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};
