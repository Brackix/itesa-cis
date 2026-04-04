'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useStudentStore } from '../hooks/useStudents';
import { Student } from '../types/student.types';
import { StudentForm } from './StudentForm';
import { StudentProfile } from './StudentProfile';

export const StudentTable = () => {
    const { students, loading, fetchStudents, deleteStudent } = useStudentStore();
    const [studentDialog, setStudentDialog] = useState(false);
    const [deleteStudentDialog, setDeleteStudentDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [profileDialog, setProfileDialog] = useState(false);
    const toast = useRef<Toast>(null);

    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    // Debounce for the search bar
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents({
                search: globalFilterValue || undefined,
                section: selectedSection || undefined
            });
        }, 400);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalFilterValue]);

    // Instant fetch for the section target
    useEffect(() => {
        fetchStudents({
            search: globalFilterValue || undefined,
            section: selectedSection || undefined
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSection]);

    const openNew = () => {
        setSelectedStudent(null);
        setStudentDialog(true);
    };

    const editStudent = (student: Student) => {
        setSelectedStudent(student);
        setStudentDialog(true);
    };

    const viewStudent = (student: Student) => {
        setSelectedStudent(student);
        setProfileDialog(true);
    };

    const confirmDeleteStudent = (student: Student) => {
        setSelectedStudent(student);
        setDeleteStudentDialog(true);
    };

    const hideStudentDialog = () => {
        setStudentDialog(false);
    };

    const hideProfileDialog = () => {
        setProfileDialog(false);
    };

    const hideDeleteStudentDialog = () => {
        setDeleteStudentDialog(false);
    };

    const submitDelete = async () => {
        if (selectedStudent) {
            try {
                await deleteStudent(selectedStudent.id);
                setDeleteStudentDialog(false);
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Estudiante eliminado', life: 3000 });
            } catch {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al eliminar estudiante', life: 3000 });
            }
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Directorio de Estudiantes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    value={globalFilterValue}
                    onChange={(e) => setGlobalFilterValue(e.target.value)} 
                    placeholder="Buscar por nombre..." 
                />
            </span>
        </div>
    );

    const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    const actionBodyTemplate = (rowData: Student) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-eye" rounded outlined severity="info" onClick={() => viewStudent(rowData)} />
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

            <div className="flex flex-column mb-5">
                <h4 className="mb-4">Filtro por Sección</h4>
                <div className="flex flex-wrap gap-3">
                    <div 
                        className={classNames('flex flex-column align-items-center justify-content-center p-3 border-round cursor-pointer shadow-2 transition-all transition-duration-300 hover:shadow-4 hover:-translate-y-1', {
                            'bg-primary border-primary': selectedSection === null,
                            'surface-card hover:surface-100 border-1 surface-border': selectedSection !== null
                        })}
                        style={{ minWidth: '120px', transform: selectedSection === null ? 'scale(1.05)' : 'scale(1)' }}
                        onClick={() => setSelectedSection(null)}
                    >
                        <i className="pi pi-users text-2xl mb-2"></i>
                        <span className="font-bold text-lg">Todos</span>
                    </div>
                    {SECTIONS.map((sec) => (
                        <div 
                            key={sec} 
                            className={classNames('flex flex-column align-items-center justify-content-center p-3 border-round cursor-pointer shadow-2 transition-all transition-duration-300 hover:shadow-4 hover:-translate-y-1', {
                                'bg-primary border-primary': selectedSection === sec,
                                'surface-card hover:surface-100 border-1 surface-border': selectedSection !== sec
                            })}
                            style={{ minWidth: '90px', transform: selectedSection === sec ? 'scale(1.05)' : 'scale(1)' }}
                            onClick={() => setSelectedSection(sec)}
                        >
                            <span className="font-bold text-3xl mb-1">{sec}</span>
                            <span className="text-sm opacity-80">Sección</span>
                        </div>
                    ))}
                </div>
            </div>

            <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

            <div style={{ transition: 'opacity 0.3s ease-in-out, transform 0.3s ease', opacity: loading ? 0.4 : 1, transform: loading ? 'translateY(5px)' : 'translateY(0)' }}>
                <DataTable
                    value={students}
                header={header}
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
            </div>

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

            <StudentProfile
                studentId={selectedStudent?.id || null}
                visible={profileDialog}
                onHide={hideProfileDialog}
            />

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
