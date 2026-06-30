'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ClientPortal from '@/components/ClientPortal';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

export default function SecurePortalPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchDocument() {
      try {
        if (!supabase) {
          throw new Error('Supabase client is not initialized. Please verify your environment variables.');
        }

        let query = supabase
          .from('quotations')
          .select(`
            *,
            customers(name, email, phone, address),
            quotation_items(*)
          `);

        // Check if param is a valid UUID, otherwise query by quote_no
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          query = query.eq('id', id);
        } else {
          query = query.eq('quote_no', id);
        }

        const { data, error: qError } = await query.single();
        if (qError) throw qError;

        if (data) {
          // Map to standard activeDocument schema
          setDoc({
            id: data.quote_no, // keep ID as quote_no to match state logic in other components
            db_id: data.id,
            quote_no: data.quote_no,
            customer_name: data.customers?.name || 'Valued Customer',
            customer_email: data.customers?.email || '',
            customer_phone: data.customers?.phone || '',
            customer_address: data.customers?.address || '',
            type: data.type,
            issue_date: data.issue_date,
            status: data.status,
            subtotal: parseFloat(data.subtotal) || 0,
            discount_percentage: parseFloat(data.discount_percentage) || 0,
            tax_percentage: parseFloat(data.tax_percentage) || 0,
            grand_total: parseFloat(data.grand_total) || 0,
            notes: data.notes || '',
            terms: data.terms || '',
            items: data.quotation_items.map(item => ({
              item_title: item.item_title,
              description: item.description || '',
              qty: item.quantity,
              unit_price: parseFloat(item.unit_price) || 0,
              line_total: parseFloat(item.line_total) || 0
            }))
          });
        }
      } catch (err) {
        console.error('Portal load error:', err);
        setError('Document not found or link has expired.');
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [id]);

  const handleUpdateStatus = async (docId, newStatus) => {
    try {
      const { error: updateError } = await supabase
        .from('quotations')
        .update({ status: newStatus })
        .eq('quote_no', docId);

      if (updateError) throw updateError;
      
      // Update local state
      setDoc(prev => {
        const nextDoc = { ...prev, status: newStatus };
        
        // Trigger order generation if signed
        if (prev.type === 'Agreement' && newStatus === 'Signed') {
          generateWorkOrder(nextDoc);
        }
        return nextDoc;
      });
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const generateWorkOrder = async (signedDoc) => {
    try {
      const newQuoteNo = `${signedDoc.quote_no.replace('-AG', '')}-WO`;
      
      // Get customer_id
      const { data: quoteObj } = await supabase
        .from('quotations')
        .select('id, customer_id')
        .eq('quote_no', signedDoc.quote_no)
        .single();
        
      if (!quoteObj) return;

      // 1. Create Order Document in quotations table
      const { data: orderObj, error: orderErr } = await supabase
        .from('quotations')
        .upsert({
          quote_no: newQuoteNo,
          customer_id: quoteObj.customer_id,
          issue_date: new Date().toISOString().split('T')[0],
          type: 'Order',
          status: 'In Production',
          subtotal: signedDoc.subtotal,
          discount_percentage: signedDoc.discount_percentage,
          tax_percentage: signedDoc.tax_percentage,
          grand_total: signedDoc.grand_total,
          notes: `Auto-generated from signed Agreement ${signedDoc.quote_no}. Proceed to fabrication.`
        }, { onConflict: 'quote_no' })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Copy items
      const itemsToInsert = signedDoc.items.map(item => ({
        quotation_id: orderObj.id,
        item_title: item.item_title,
        description: item.description,
        quantity: item.qty,
        unit_price: item.unit_price
      }));

      await supabase.from('quotation_items').insert(itemsToInsert);

      // 3. Create Kanban card
      await supabase.from('work_orders').insert({
        quotation_id: orderObj.id,
        title: `${newQuoteNo}`,
        client_name: signedDoc.customer_name,
        kanban_col: 'todo',
        priority: 'normal',
        notes: `Proceed to printing/fabrication.`
      });
      
    } catch (e) {
      console.error('Work order generation error:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-4 text-slate-300">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-sm font-semibold tracking-wide uppercase">Securing Connection...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
        <div className="glass-panel max-w-md w-full p-6 text-center space-y-4 rounded-2xl border border-slate-800 bg-slate-950/40">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
          <h2 className="text-lg font-bold text-white">Access Denied</h2>
          <p className="text-sm text-slate-400">
            {error || 'This document link is invalid, expired, or you do not have permission to view it.'}
          </p>
          <div className="pt-2">
            <p className="text-[11px] text-slate-500 font-mono">PixelWave Security Gateway v1.0.3</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] py-12 px-4 sm:px-6 relative overflow-hidden select-none">
      {/* Visual Ambient Lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-pink/5 blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header Indicator */}
        <div className="flex justify-between items-center text-[13px] text-slate-500 border-b border-slate-900 pb-4 no-print">
          <div className="flex items-center gap-1.5 font-bold text-brand-cyan">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-End Encrypted Session</span>
          </div>
          <span className="font-mono text-[11px]">{doc.quote_no}</span>
        </div>

        {/* Client Portal Render */}
        <ClientPortal activeDocument={doc} onUpdateStatus={handleUpdateStatus} />
      </div>
    </div>
  );
}
