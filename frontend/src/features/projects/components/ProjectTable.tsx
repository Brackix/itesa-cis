'use client'; // ProjectTable.tsx component


import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useProjectStore } from '../hooks/useProjects';
import { Project } from '../types/project.types';
import { ProjectForm } from '../components/ProjectForm';


export const ProjectTable = () => {
    const { projects, loading, fetchProjects, deleteProject } = useProjectStore();
    const [projectDialog, setProjectDialog] = useState(false);
    const [deleteProjectDialog, setDeleteProjectDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const openNew = () => {
        setSelectedProject(null);
        setProjectDialog(true);
    };

    const editProject = (project: Project) => {
        setSelectedProject(project);
        setProjectDialog(true);
    };

    const confirmDeleteProject = (project: Project) => {
        setSelectedProject(project);
        setDeleteProjectDialog(true);
    };

    const hideProjectDialog = () => {
        setProjectDialog(false);
    };

    const hideDeleteProjectDialog = () => {
        setDeleteProjectDialog(false);
    };

    const submitDelete = () => {
        if (selectedProject) {
            deleteProject(selectedProject.id);
            setDeleteProjectDialog(false);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Proyecto eliminado', life: 3000 });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const actionBodyTemplate = (rowData: Project) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined severity="success" onClick={() => editProject(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProject(rowData)} />
            </div>
        );
    };

    const deleteProjectDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProjectDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={submitDelete} />
        </React.Fragment>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

            <DataTable
                value={projects}
                loading={loading}
                paginator
                rows={10}
                className="datatable-responsive"
                emptyMessage="No se encontraron proyectos."
            >
                <Column field="name" header="Nombre del Proyecto" sortable></Column>
                <Column field="description" header="Descripción" sortable></Column>
                <Column field="group_id" header="ID Grupo" sortable></Column>
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
            </DataTable>

            <Dialog
                visible={projectDialog}
                style={{ width: '40rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header={selectedProject ? "Editar Proyecto" : "Nuevo Proyecto"}
                modal
                className="p-fluid"
                onHide={hideProjectDialog}
            >
                <ProjectForm
                    initialData={selectedProject}
                    onHide={hideProjectDialog}
                />
            </Dialog>

            <Dialog
                visible={deleteProjectDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar"
                modal
                footer={deleteProjectDialogFooter}
                onHide={hideDeleteProjectDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedProject && (
                        <span>
                            ¿Estás seguro de que quieres eliminar al proyecto <b>{selectedProject.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};
