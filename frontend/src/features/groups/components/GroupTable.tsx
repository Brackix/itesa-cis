'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useGroupStore } from '../hooks/useGroups';
import { Group } from '../types/group.types';
import { GroupForm } from './GroupForm';

export const GroupTable = () => {
    const { groups, loading, fetchGroups, deleteGroup } = useGroupStore();
    const [groupDialog, setGroupDialog] = useState(false);
    const [deleteGroupDialog, setDeleteGroupDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const openNew = () => {
        setSelectedGroup(null);
        setGroupDialog(true);
    };

    const editGroup = (group: Group) => {
        setSelectedGroup(group);
        setGroupDialog(true);
    };

    const confirmDeleteGroup = (group: Group) => {
        setSelectedGroup(group);
        setDeleteGroupDialog(true);
    };

    const hideGroupDialog = () => {
        setGroupDialog(false);
    };

    const hideDeleteGroupDialog = () => {
        setDeleteGroupDialog(false);
    };

    const submitDelete = () => {
        if (selectedGroup) {
            deleteGroup(selectedGroup.id);
            setDeleteGroupDialog(false);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Grupo eliminado', life: 3000 });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const actionBodyTemplate = (rowData: Group) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined severity="success" onClick={() => editGroup(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteGroup(rowData)} />
            </div>
        );
    };

    const deleteGroupDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteGroupDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={submitDelete} />
        </React.Fragment>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

            <DataTable 
                value={groups} 
                loading={loading}
                paginator 
                rows={10} 
                className="datatable-responsive"
                emptyMessage="No se encontraron grupos."
            >
                <Column field="group_name" header="Nombre del Grupo" sortable></Column>
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
            </DataTable>

            <Dialog 
                visible={groupDialog} 
                style={{ width: '40rem' }} 
                breakpoints={{ '960px': '75vw', '641px': '90vw' }} 
                header={selectedGroup ? "Editar Grupo" : "Nuevo Grupo"} 
                modal 
                className="p-fluid" 
                onHide={hideGroupDialog}
            >
                <GroupForm 
                    initialData={selectedGroup} 
                    onHide={hideGroupDialog}
                />
            </Dialog>

            <Dialog 
                visible={deleteGroupDialog} 
                style={{ width: '32rem' }} 
                breakpoints={{ '960px': '75vw', '641px': '90vw' }} 
                header="Confirmar" 
                modal 
                footer={deleteGroupDialogFooter} 
                onHide={hideDeleteGroupDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedGroup && (
                        <span>
                            ¿Estás seguro de que quieres eliminar al grupo <b>{selectedGroup.group_name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};
