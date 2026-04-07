'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useEvaluationStore } from '../hooks/useEvaluations';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const CriteriaManager = () => {
    const { criteria, fetchCriteria } = useEvaluationStore();
    const [displayDialog, setDisplayDialog] = useState(false);
    const [newCriterion, setNewCriterion] = useState({ name: '', description: '', phase: 'preparation' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCriteria();
    }, [fetchCriteria]);

    const phases = [
        { label: 'Preparación', value: 'preparation' },
        { label: 'Feria', value: 'fair' }
    ];

    const saveCriterion = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/project_criteria`, newCriterion);
            fetchCriteria();
            setDisplayDialog(false);
            setNewCriterion({ name: '', description: '', phase: 'preparation' });
        } catch (error) {
            console.error("Error creating criterion", error);
        } finally {
            setLoading(false);
        }
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Gestión de Metas (Criterios)</h5>
            <Button label="Nueva Meta" icon="pi pi-plus" onClick={() => setDisplayDialog(true)} />
        </div>
    );

    return (
        <div className="card">
            <DataTable value={criteria} header={header} responsiveLayout="scroll" emptyMessage="No hay metas definidas.">
                <Column field="name" header="Nombre"></Column>
                <Column field="description" header="Descripción"></Column>
                <Column field="phase" header="Fase"></Column>
            </DataTable>

            <Dialog visible={displayDialog} style={{ width: '450px' }} header="Nueva Meta" modal className="p-fluid" onHide={() => setDisplayDialog(false)}>
                <div className="field">
                    <label htmlFor="name">Nombre</label>
                    <InputText id="name" value={newCriterion.name} onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })} required autoFocus />
                </div>
                <div className="field">
                    <label htmlFor="description">Descripción</label>
                    <InputText id="description" value={newCriterion.description} onChange={(e) => setNewCriterion({ ...newCriterion, description: e.target.value })} />
                </div>
                <div className="field">
                    <label htmlFor="phase">Fase</label>
                    <Dropdown id="phase" value={newCriterion.phase} options={phases} onChange={(e) => setNewCriterion({ ...newCriterion, phase: e.value })} placeholder="Seleccionar Fase" />
                </div>
                <div className="flex justify-content-end mt-4">
                    <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setDisplayDialog(false)} />
                    <Button label="Guardar" icon="pi pi-check" onClick={saveCriterion} loading={loading} />
                </div>
            </Dialog>
        </div>
    );
};
