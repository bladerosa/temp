import './theme/tokens.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import App from './App';
import { ccpaymentTheme } from './theme';
import { rootStore, StoresProvider } from './stores';

// Expose the store in dev so PRD-figure capture scripts can mark per-row
// states (e.g. paid-pending) without going through the whole modal flow.
if (import.meta.env.DEV) {
  (window as unknown as { __rootStore: typeof rootStore }).__rootStore = rootStore;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoresProvider value={rootStore}>
        <ThemeProvider theme={ccpaymentTheme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <App />
          </LocalizationProvider>
        </ThemeProvider>
      </StoresProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
