import React from 'react';

const AppFooter = () => {
    return (
        <div className="layout-footer">
            <i className="pi pi-graduation-cap" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }} />
            <span className="font-medium ml-2">ITESA CIS &copy; {new Date().getFullYear()}</span>
        </div>
    );
};

export default AppFooter;
