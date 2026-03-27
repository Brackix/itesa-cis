'use client';
import React, { useContext, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/src/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [expandedSections, setExpandedSections] = useState<number[]>([0]);

    const toggleSection = (index: number) => {
        setExpandedSections(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const model: AppMenuItem[] = [
        {
            label: 'Inicio',
            icon: 'pi pi-fw pi-home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Estudiantes',
            icon: 'pi pi-fw pi-users',
            items: [
                { label: 'Listado', icon: 'pi pi-fw pi-list', to: '/students' },
            ]
        },
        {
            label: 'Grupos',
            icon: 'pi pi-fw pi-th-large',
            items: [
                { label: 'Listado', icon: 'pi pi-fw pi-list', to: '/groups' },
            ]
        },
        {
            label: 'Proyectos',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                { label: 'Listado', icon: 'pi pi-fw pi-list', to: '/projects' },
            ]
        },
        {
            label: 'Evaluaciones',
            icon: 'pi pi-fw pi-check-square',
            items: [
                { label: 'Listado', icon: 'pi pi-fw pi-list', to: '/evaluations' },
            ]
        },
        {
            label: 'Sistema',
            icon: 'pi pi-fw pi-cog',
            items: [
                { label: 'Usuarios', icon: 'pi pi-fw pi-user', to: '/users' },
                { label: 'Configuración', icon: 'pi pi-fw pi-cog', to: '/settings' },
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    const isExpanded = expandedSections.includes(i);

                    return (
                        <li key={item.label} className="layout-menuitem-category">
                            <div
                                className={`layout-menuitem-root-text ${isExpanded ? 'active' : ''}`}
                                onClick={() => toggleSection(i)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem 1.5rem',
                                    transition: 'all 0.3s ease',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {item.icon && <i className={item.icon} style={{ fontSize: '1.1rem' }}></i>}
                                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.label}</span>
                                </div>
                                <i
                                    className={`pi pi-chevron-${isExpanded ? 'down' : 'right'}`}
                                    style={{ fontSize: '0.875rem', transition: 'transform 0.3s ease' }}
                                ></i>
                            </div>

                            <div
                                style={{
                                    maxHeight: isExpanded ? '1000px' : '0',
                                    overflow: 'hidden',
                                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    paddingLeft: '1rem'
                                }}
                            >
                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    opacity: isExpanded ? 1 : 0,
                                    transition: 'opacity 0.3s ease'
                                }}>
                                    {item.items?.map((subItem, j) => (
                                        <AppMenuitem
                                            item={subItem}
                                            root={false}
                                            index={j}
                                            key={subItem.label}
                                        />
                                    ))}
                                </ul>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
