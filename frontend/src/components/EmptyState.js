import React from 'react';
import { Link } from 'react-router-dom';
import { FaInbox } from 'react-icons/fa';

function EmptyState({
    icon = <FaInbox />,
    title = 'No Data Found',
    description = 'There is currently nothing to display here.',
    actionText = null,
    actionLink = null,
    actionOnClick = null
}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            background: '#ffffff',
            border: '2px dashed #eaeaea',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#6c757d',
            margin: '2rem 0'
        }}>
            <div style={{ fontSize: '4rem', color: '#dee2e6', marginBottom: '1rem' }}>
                {icon}
            </div>
            <h3 style={{ color: '#343a40', marginBottom: '0.5rem', fontWeight: '600' }}>
                {title}
            </h3>
            <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
                {description}
            </p>

            {actionText && actionLink && (
                <Link
                    to={actionLink}
                    style={{
                        padding: '0.6rem 1.5rem',
                        background: '#2575fc',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        transition: 'background 0.2s'
                    }}
                >
                    {actionText}
                </Link>
            )}

            {actionText && actionOnClick && !actionLink && (
                <button
                    onClick={actionOnClick}
                    style={{
                        padding: '0.6rem 1.5rem',
                        background: '#2575fc',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontWeight: '500',
                        transition: 'background 0.2s'
                    }}
                >
                    {actionText}
                </button>
            )}
        </div>
    );
}

export default EmptyState;
