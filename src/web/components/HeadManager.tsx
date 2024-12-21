import React from 'react';
import { Helmet } from 'react-helmet-async';

interface HeadManagerProps {
    title: string;
    description?: string;
}

const HeadManager: React.FC<HeadManagerProps> = ({ title, description }) => (
    <Helmet>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
    </Helmet>
);

export default HeadManager;
