'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import DocEditor from '../components/DocEditor';
import ClientPortal from '../components/ClientPortal';
import N8nWorkflow from '../components/N8nWorkflow';
import ClientsSubscriptions from '../components/ClientsSubscriptions';
import OperationsCalendar from '../components/OperationsCalendar';
import PricingMatrix from '../components/PricingMatrix';
import KanbanBoard from '../components/KanbanBoard';
import MarketingHub from '../components/MarketingHub';
import BrandCustomizer from '../components/BrandCustomizer';
import SupplierTracker from '../components/SupplierTracker';
import PnLTracker from '../components/PnLTracker';
import LoginScreen from '../components/LoginScreen';
import TopBar from '../components/TopBar';
import { initialDocuments } from '../data/mockDatabase';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState(initialDocuments);
  const [viewDocument, setViewDocument] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Check session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('pw_admin_auth');
      if (auth === 'true') setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem('pw_admin_auth');
    setIsAuthenticated(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Check Supabase connection and fetch live data
  useEffect(() => {
    if (supabase) {
      setIsSupabaseConnected(true);
      fetchLiveDocuments();
    }
  }, []);

  // Fetch from Supabase quotations & items
  const fetchLiveDocuments = async () => {
    try {
      const { data: quotationsData, error: qError } = await supabase
        .from('quotations')
        .select(`
          *,
          customers(name, email, phone, address),
          quotation_items(*)
        `)
        .order('created_at', { ascending: false });

      if (qError) throw qError;

      if (quotationsData && quotationsData.length > 0) {
        // Map database schema to frontend document format
        const mappedDocs = quotationsData.map(q => ({
          id: q.quote_no,
          quote_no: q.quote_no,
          customer_name: q.customers?.name || 'Unknown',
          customer_email: q.customers?.email || '',
          customer_phone: q.customers?.phone || '',
          customer_address: q.customers?.address || '',
          issue_date: q.issue_date,
          type: q.type,
          status: q.status,
          subtotal: parseFloat(q.subtotal) || 0,
          discount_percentage: parseFloat(q.discount_percentage) || 0,
          tax_percentage: parseFloat(q.tax_percentage) || 0,
          grand_total: parseFloat(q.grand_total) || 0,
          notes: q.notes || '',
          terms: q.terms || '',
          items: q.quotation_items.map(item => ({
            id: item.id,
            item_title: item.item_title,
            description: item.description || '',
            qty: item.quantity,
            unit_price: parseFloat(item.unit_price) || 0,
            line_total: parseFloat(item.line_total) || 0
          }))
        }));

        setDocuments(mappedDocs);
        console.log('🔄 Data successfully synced from Supabase database.');
      }
    } catch (error) {
      console.error('⚠️ Supabase fetch error:', error);
      showNotification('Failed to sync live data from Supabase. Falling back to local cache.', 'error');
    }
  };

  // Save Document (Offline / Online Sync)
  const handleSaveDocument = async (savedDoc) => {
    // 1. Local UI State Update
    const exists = documents.some((d) => d.id === savedDoc.id);
    let updatedDocs;

    if (exists) {
      updatedDocs = documents.map((d) => (d.id === savedDoc.id ? savedDoc : d));
      showNotification(`Document ${savedDoc.quote_no} state updated locally.`);
    } else {
      updatedDocs = [savedDoc, ...documents];
      showNotification(`Document ${savedDoc.quote_no} created locally.`);
    }
    setDocuments(updatedDocs);
    setViewDocument(savedDoc);

    // 2. Supabase Live Sync
    if (isSupabaseConnected && supabase) {
      try {
        // Upsert Customer first
        const { data: customerData, error: custError } = await supabase
          .from('customers')
          .insert({
            name: savedDoc.customer_name,
            email: savedDoc.customer_email,
            phone: savedDoc.customer_phone,
            address: savedDoc.customer_address
          })
          .select()
          .single();

        let customerId = customerData?.id;

        // If insert failed because we want to reuse, we can fetch or ignore error
        if (custError) {
          const { data: existingCust } = await supabase
            .from('customers')
            .select('id')
            .eq('name', savedDoc.customer_name)
            .limit(1)
            .single();
          customerId = existingCust?.id;
        }

        // Upsert Quotation
        const { data: quoteObj, error: qError } = await supabase
          .from('quotations')
          .upsert({
            quote_no: savedDoc.quote_no,
            customer_id: customerId,
            issue_date: savedDoc.issue_date,
            type: savedDoc.type,
            status: savedDoc.status,
            subtotal: savedDoc.subtotal,
            discount_percentage: savedDoc.discount_percentage,
            tax_percentage: savedDoc.tax_percentage,
            grand_total: savedDoc.grand_total,
            notes: savedDoc.notes,
            terms: savedDoc.terms
          }, { onConflict: 'quote_no' })
          .select()
          .single();

        if (qError) throw qError;

        // Sync items: delete previous and insert new
        await supabase
          .from('quotation_items')
          .delete()
          .eq('quotation_id', quoteObj.id);

        const itemsToInsert = savedDoc.items.map(item => ({
          quotation_id: quoteObj.id,
          item_title: item.item_title,
          description: item.description,
          quantity: item.qty,
          unit_price: item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        showNotification(`⚡ Live Synced: ${savedDoc.quote_no} pushed to Supabase!`);
        fetchLiveDocuments(); // refresh view
      } catch (error) {
        console.error('⚠️ Supabase Sync Error:', error);
        showNotification('Supabase Sync Failed. Document saved to local state only.', 'error');
      }
    }
  };

  // Convert Quote to Proforma Invoice or Agreement
  const handleConvertDocument = (docId, newType) => {
    const sourceDoc = documents.find((d) => d.id === docId);
    if (!sourceDoc) return;

    const suffix = newType === 'Proforma' ? 'PI' : newType === 'Agreement' ? 'AG' : 'INV';
    const newQuoteNo = `${sourceDoc.quote_no}-${suffix}`;
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

    handleSaveDocument(newDoc); // handles both local and live Supabase upsert
    showNotification(`Quotation converted to ${newType} [${newQuoteNo}].`);
  };

  // Update Status directly (from Client actions)
  const handleUpdateStatus = async (docId, newStatus) => {
    // Local Update
    const updatedDocs = documents.map((d) => {
      if (d.id === docId) {
        // Auto create Work Order on Agreement Sign
        if (d.type === 'Agreement' && newStatus === 'Signed') {
          setTimeout(() => {
            const orderDoc = {
              ...d,
              id: `${d.quote_no.replace('-AG', '')}-WO`,
              quote_no: `${d.quote_no.replace('-AG', '')}-WO`,
              type: 'Order',
              status: 'In Production',
              notes: `Auto-generated from signed Agreement ${d.quote_no}. Proceed to fabrication.`
            };
            handleSaveDocument(orderDoc);
            showNotification(`Work Order generated and sent to production!`);
          }, 2500);
        }
        return { ...d, status: newStatus };
      }
      return d;
    });

    setDocuments(updatedDocs);
    setViewDocument((prev) => (prev && prev.id === docId ? { ...prev, status: newStatus } : prev));

    // Supabase DB update
    if (isSupabaseConnected && supabase) {
      try {
        const { error } = await supabase
          .from('quotations')
          .update({ status: newStatus })
          .eq('quote_no', docId);

        if (error) throw error;
        showNotification(`⚡ Live Synced: Document status set to '${newStatus}' in Supabase.`);
      } catch (error) {
        console.error('⚠️ Supabase Status Update Error:', error);
      }
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const themeClass = isDark
    ? 'bg-[#090d16] text-slate-100'
    : 'bg-slate-50 text-slate-900';

  return (
    <div className={`flex min-h-screen ${themeClass} selection:bg-brand-blue selection:text-white`}>
      {/* macOS-style Top Status Bar */}
      <TopBar isDark={isDark} setIsDark={setIsDark} onLogout={handleLogout} />

      {/* Sidebar Navigation — shift down 28px for topbar */}
      <div className="pt-7 flex flex-1">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />

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
            <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-400' : 'bg-brand-cyan animate-pulse'}`}></span>
            <span className="text-xs font-mono text-slate-400">
              {isSupabaseConnected 
                ? 'Database: Connected (Supabase Cloud Sync active)' 
                : 'Database: Offline Demo Mode (Mock storage active)'}
            </span>
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
              isDark={isDark}
            />
          )}

          {activeTab === 'suppliers' && (
            <SupplierTracker isDark={isDark} />
          )}

          {activeTab === 'pnl' && (
            <PnLTracker isDark={isDark} />
          )}

          {activeTab === 'portal' && (
            <ClientPortal 
              activeDocument={viewDocument} 
              onUpdateStatus={handleUpdateStatus} 
              isDark={isDark}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsSubscriptions isDark={isDark} />
          )}

          {activeTab === 'calendar' && (
            <OperationsCalendar />
          )}

          {activeTab === 'pricing' && (
            <PricingMatrix 
              isDark={isDark}
              onSendToDocBuilder={(item) => {
                // Pre-fill doc editor with the pricing item
                setViewDocument(prev => {
                  const base = prev || { 
                    id: `PW-${Date.now()}`, quote_no: `PW-${Date.now()}`, type: 'Quote',
                    status: 'Draft', customer_name: '', customer_email: '',
                    customer_phone: '', customer_address: '', issue_date: new Date().toISOString().split('T')[0],
                    subtotal: 0, discount_percentage: 0, tax_percentage: 0, grand_total: 0,
                    notes: '', terms: '', items: []
                  };
                  const newItem = {
                    id: `item-${Date.now()}`,
                    item_title: item.title,
                    description: item.unit,
                    qty: item.qty || 1,
                    unit_price: item.rate,
                    line_total: (item.qty || 1) * item.rate
                  };
                  return { ...base, items: [...(base.items || []), newItem] };
                });
                setActiveTab('editor');
              }}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanBoard />
          )}

          {activeTab === 'marketing' && (
            <MarketingHub />
          )}

          {activeTab === 'customizer' && (
            <BrandCustomizer />
          )}

          {activeTab === 'n8n' && (
            <N8nWorkflow />
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
