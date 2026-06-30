'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import DocEditor from '../components/DocEditor';
import ClientPortal from '../components/ClientPortal';
import N8nWorkflow from '../components/N8nWorkflow';
import { initialDocuments } from '../data/mockDatabase';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState(initialDocuments);
  const [viewDocument, setViewDocument] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Save Document
  const handleSaveDocument = (savedDoc) => {
    const exists = documents.some((d) => d.id === savedDoc.id);
    let updatedDocs;

    if (exists) {
      updatedDocs = documents.map((d) => (d.id === savedDoc.id ? savedDoc : d));
      showNotification(`Document ${savedDoc.quote_no} state updated successfully.`);
    } else {
      updatedDocs = [savedDoc, ...documents];
      showNotification(`Document ${savedDoc.quote_no} created successfully.`);
    }

    setDocuments(updatedDocs);
    setViewDocument(savedDoc);
  };

  // Convert Quote to Proforma Invoice or Agreement
  const handleConvertDocument = (docId, newType) => {
    const sourceDoc = documents.find((d) => d.id === docId);
    if (!sourceDoc) return;

    // Generate new quote number sequence or suffix
    const suffix = newType === 'Proforma' ? 'PI' : newType === 'Agreement' ? 'AG' : 'INV';
    const newQuoteNo = `${sourceDoc.quote_no}-${suffix}`;

    // Status map
    const defaultStatus = newType === 'Proforma' ? 'Unpaid' : newType === 'Agreement' ? 'Draft' : 'Sent';

    const newDoc = {
      ...sourceDoc,
      id: newQuoteNo,
      quote_no: newQuoteNo,
      type: newType,
      status: defaultStatus,
      issue_date: new Date().toISOString().split('T')[0],
      notes: `Converted from approved Quote: ${sourceDoc.quote_no}. ${sourceDoc.notes || ''}`
    };

    setDocuments([newDoc, ...documents]);
    setViewDocument(newDoc);
    showNotification(`Quotation successfully converted to ${newType} [${newQuoteNo}].`);
  };

  // Update Status directly (from Client actions)
  const handleUpdateStatus = (docId, newStatus) => {
    const updatedDocs = documents.map((d) => {
      if (d.id === docId) {
        // If Agreement is signed, let's also auto create a Work Order in production!
        if (d.type === 'Agreement' && newStatus === 'Signed') {
          // create order
          setTimeout(() => {
            const orderDoc = {
              ...d,
              id: `${d.quote_no.replace('-AG', '')}-WO`,
              quote_no: `${d.quote_no.replace('-AG', '')}-WO`,
              type: 'Order',
              status: 'In Production',
              notes: `Auto-generated from signed Agreement ${d.quote_no}. Proceed to fabrication.`
            };
            setDocuments((prev) => {
              if (prev.some((o) => o.id === orderDoc.id)) return prev;
              return [orderDoc, ...prev];
            });
            showNotification(`Work Order for ${d.customer_name} generated and sent to production!`);
          }, 3000);
        }
        
        // If Invoice is paid, we are complete!
        return { ...d, status: newStatus };
      }
      return d;
    });

    setDocuments(updatedDocs);
    // Update current active doc view context
    setViewDocument((prev) => (prev && prev.id === docId ? { ...prev, status: newStatus } : prev));
  };

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 selection:bg-brand-blue selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Notification Banner */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 shadow-xl flex items-center gap-2 max-w-sm animate-bounce no-print">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-200">{notification.message}</span>
          </div>
        )}

        {/* Dynamic Panel Header */}
        <header className="border-b border-slate-800/60 bg-slate-950/20 px-8 py-5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan"></span>
            <span className="text-xs font-mono text-slate-400">Environment: Staging (Live Sync Mocked)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-medium">Domain: smartquote.pixelwave.lk</span>
          </div>
        </header>

        {/* Tabs Render Routing */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              documents={documents} 
              setViewDocument={(doc) => {
                setViewDocument(doc);
                setActiveTab('editor');
              }} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'editor' && (
            <DocEditor 
              viewDocument={viewDocument} 
              onSaveDocument={handleSaveDocument}
              onConvertDocument={handleConvertDocument}
              documents={documents}
            />
          )}

          {activeTab === 'portal' && (
            <ClientPortal 
              activeDocument={viewDocument} 
              onUpdateStatus={handleUpdateStatus} 
            />
          )}

          {activeTab === 'n8n' && (
            <N8nWorkflow />
          )}
        </div>
      </main>
    </div>
  );
}
