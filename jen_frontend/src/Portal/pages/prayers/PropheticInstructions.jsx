import React from 'react';
import PropheticHeader from '../../components/prayers/prophetic/PropheticHeader';
import PropheticActions from '../../components/prayers/prophetic/PropheticActions';
import PropheticTable from '../../components/prayers/prophetic/PropheticTable';

const PropheticInstructions = () => {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
            <PropheticHeader />
            <PropheticActions />
            <PropheticTable />
        </div>
    );
};

export default PropheticInstructions;
