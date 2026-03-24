'use client';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { LayoutContext } from '@/src/components/layout/context/layoutcontext';
import { ChartData, ChartOptions } from 'chart.js';

const lineData: ChartData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
    datasets: [
        {
            label: 'Estudiantes Activos',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            backgroundColor: '#2f4860',
            borderColor: '#2f4860',
            tension: 0.4
        },
        {
            label: 'Nuevas Inscripciones',
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
            tension: 0.4
        }
    ]
};

// Static mock data for recent students
const recentStudents = [
    { id: '001', name: 'Ana García', group: 'Grupo A', status: 'Activo' },
    { id: '002', name: 'Carlos López', group: 'Grupo B', status: 'Activo' },
    { id: '003', name: 'María Martínez', group: 'Grupo A', status: 'Inactivo' },
    { id: '004', name: 'José Hernández', group: 'Grupo C', status: 'Activo' },
    { id: '005', name: 'Laura Sánchez', group: 'Grupo B', status: 'Activo' },
];

const Dashboard = () => {
    const menu1 = useRef<Menu>(null);
    const menu2 = useRef<Menu>(null);
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);

    const applyLightTheme = () => {
        const lineOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: { color: '#495057' }
                }
            },
            scales: {
                x: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
                y: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } }
            }
        };
        setLineOptions(lineOptions);
    };

    const applyDarkTheme = () => {
        const lineOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: { color: '#ebedef' }
                }
            },
            scales: {
                x: { ticks: { color: '#ebedef' }, grid: { color: 'rgba(160, 167, 181, .3)' } },
                y: { ticks: { color: '#ebedef' }, grid: { color: 'rgba(160, 167, 181, .3)' } }
            }
        };
        setLineOptions(lineOptions);
    };

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);

    const statusBodyTemplate = (student: { status: string }) => {
        return (
            <span className={`customer-badge status-${student.status === 'Activo' ? 'qualified' : 'unqualified'}`}>
                {student.status}
            </span>
        );
    };

    return (
        <div className="grid">
            {/* KPI Cards */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Estudiantes</span>
                            <div className="text-900 font-medium text-xl">1,284</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">48 nuevos </span>
                    <span className="text-500">este mes</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Grupos Activos</span>
                            <div className="text-900 font-medium text-xl">24</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-th-large text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">3 nuevos </span>
                    <span className="text-500">esta semana</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Inscripciones</span>
                            <div className="text-900 font-medium text-xl">320</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-inbox text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">52 </span>
                    <span className="text-500">nuevas inscripciones</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Asistencia Promedio</span>
                            <div className="text-900 font-medium text-xl">87%</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-chart-bar text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">+5% </span>
                    <span className="text-500">vs mes anterior</span>
                </div>
            </div>

            {/* Recent Students Table */}
            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Estudiantes Recientes</h5>
                    <DataTable value={recentStudents} rows={5} paginator responsiveLayout="scroll">
                        <Column field="id" header="ID" style={{ width: '15%' }} />
                        <Column field="name" header="Nombre" sortable style={{ width: '40%' }} />
                        <Column field="group" header="Grupo" sortable style={{ width: '25%' }} />
                        <Column field="status" header="Estado" body={statusBodyTemplate} style={{ width: '20%' }} />
                    </DataTable>
                </div>

                {/* Top Groups */}
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-5">
                        <h5>Grupos por Ocupación</h5>
                        <div>
                            <Button type="button" icon="pi pi-ellipsis-v" rounded text className="p-button-plain" onClick={(event) => menu1.current?.toggle(event)} />
                            <Menu
                                ref={menu1}
                                popup
                                model={[
                                    { label: 'Ver todos', icon: 'pi pi-fw pi-list' },
                                    { label: 'Exportar', icon: 'pi pi-fw pi-download' }
                                ]}
                            />
                        </div>
                    </div>
                    <ul className="list-none p-0 m-0">
                        {[
                            { name: 'Grupo A — Turno Mañana', pct: 85, color: 'orange' },
                            { name: 'Grupo B — Turno Tarde', pct: 72, color: 'cyan' },
                            { name: 'Grupo C — Turno Noche', pct: 60, color: 'pink' },
                            { name: 'Grupo D — Sabatino', pct: 45, color: 'green' },
                            { name: 'Grupo E — Virtual', pct: 91, color: 'purple' },
                        ].map(({ name, pct, color }) => (
                            <li key={name} className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                                <div>
                                    <span className="text-900 font-medium mr-2 mb-1 md:mb-0">{name}</span>
                                </div>
                                <div className="mt-2 md:mt-0 flex align-items-center">
                                    <div className="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style={{ height: '8px' }}>
                                        <div className={`bg-${color}-500 h-full`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className={`text-${color}-500 ml-3 font-medium`}>{pct}%</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Chart + Notifications */}
            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Inscripciones por Mes</h5>
                    <Chart type="line" data={lineData} options={lineOptions} />
                </div>

                <div className="card">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <h5>Actividad Reciente</h5>
                        <div>
                            <Button type="button" icon="pi pi-ellipsis-v" rounded text className="p-button-plain" onClick={(event) => menu2.current?.toggle(event)} />
                            <Menu
                                ref={menu2}
                                popup
                                model={[
                                    { label: 'Ver todo', icon: 'pi pi-fw pi-list' },
                                    { label: 'Limpiar', icon: 'pi pi-fw pi-trash' }
                                ]}
                            />
                        </div>
                    </div>

                    <span className="block text-600 font-medium mb-3">HOY</span>
                    <ul className="p-0 mx-0 mt-0 mb-4 list-none">
                        <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                            <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                                <i className="pi pi-user-plus text-xl text-blue-500" />
                            </div>
                            <span className="text-900 line-height-3">
                                Ana García{' '}
                                <span className="text-700">fue inscrita en <span className="text-blue-500">Grupo A</span></span>
                            </span>
                        </li>
                        <li className="flex align-items-center py-2">
                            <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-orange-100 border-circle mr-3 flex-shrink-0">
                                <i className="pi pi-th-large text-xl text-orange-500" />
                            </div>
                            <span className="text-700 line-height-3">
                                Se creó el <span className="text-blue-500 font-medium">Grupo F — Sabatino B</span>.
                            </span>
                        </li>
                    </ul>

                    <span className="block text-600 font-medium mb-3">AYER</span>
                    <ul className="p-0 m-0 list-none">
                        <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                            <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                                <i className="pi pi-user text-xl text-blue-500" />
                            </div>
                            <span className="text-900 line-height-3">
                                Carlos López{' '}
                                <span className="text-700">actualizó su información de contacto.</span>
                            </span>
                        </li>
                        <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                            <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-pink-100 border-circle mr-3 flex-shrink-0">
                                <i className="pi pi-exclamation-triangle text-xl text-pink-500" />
                            </div>
                            <span className="text-900 line-height-3">
                                María Martínez{' '}
                                <span className="text-700">fue marcada como <span className="text-pink-500">Inactiva</span>.</span>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
