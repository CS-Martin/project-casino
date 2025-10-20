'use client';

import { AppProgressProvider as ProgressProvider } from '@bprogress/next';
import React from 'react';

export const LoadingProgressProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProgressProvider
            height='5px'
            color='#9811fb'
            options={{ showSpinner: true }}>
            {children}
        </ProgressProvider>
    );
};