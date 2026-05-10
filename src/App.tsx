/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProjectView } from './components/ProjectView';
import { SharedProjectView } from './components/SharedProjectView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/share/:token" element={<SharedProjectView />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="p/:projectId" element={<ProjectView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
