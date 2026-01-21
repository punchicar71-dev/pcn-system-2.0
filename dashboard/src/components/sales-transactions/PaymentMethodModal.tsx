'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, ChevronDown, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
  onSuccess?: () => void;
}

export default function PaymentMethodModal({ isOpen, onClose, saleId, onSuccess }: PaymentMethodModalProps) {
  const [paymentType, setPaymentType] = useState<string>('');
  const [leasingCompanyId, setLeasingCompanyId] = useState<string>('');
  const [leasingCompanies, setLeasingCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPaymentType, setCurrentPaymentType] = useState<string>('');
  
  // Add new leasing company state
  const [showAddNewCompany, setShowAddNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  
  // Custom combobox state
  const [isComboOpen, setIsComboOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const comboRef = useRef<HTMLDivElement>(null);

  // Fetch leasing companies and current payment info
  useEffect(() => {
    if (isOpen && saleId) {
      fetchData();
    }
  }, [isOpen, saleId]);

  // Close combobox when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(event.target as Node)) {
        setIsComboOpen(false);
        setSearchQuery('');
      }
    };

    if (isComboOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isComboOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowAddNewCompany(false);
      setNewCompanyName('');
      setSearchQuery('');
      setIsComboOpen(false);
    }
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch leasing companies and current sale data in parallel
      const [companiesResult, saleResult] = await Promise.all([
        supabase
          .from('leasing_companies')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true }),
        supabase
          .from('pending_vehicle_sales')
          .select('payment_type, leasing_company_id')
          .eq('id', saleId)
          .single()
      ]);

      if (companiesResult.error) {
        console.error('Error fetching leasing companies:', companiesResult.error);
      } else {
        setLeasingCompanies(companiesResult.data || []);
      }

      if (saleResult.error) {
        console.error('Error fetching sale data:', saleResult.error);
      } else if (saleResult.data) {
        setPaymentType(saleResult.data.payment_type || '');
        setCurrentPaymentType(saleResult.data.payment_type || '');
        setLeasingCompanyId(saleResult.data.leasing_company_id || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a 5-digit company ID
  const generateCompanyId = () => {
    return String(Math.floor(10000 + Math.random() * 90000));
  };

  // Add new leasing company
  const handleAddNewCompany = async () => {
    if (!newCompanyName.trim()) {
      alert('Please enter a company name');
      return;
    }

    setIsAddingCompany(true);
    try {
      const supabase = createClient();
      const companyId = generateCompanyId();

      const { data, error } = await supabase
        .from('leasing_companies')
        .insert([
          {
            company_id: companyId,
            name: newCompanyName.trim(),
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          alert('Company ID already exists. Please try again.');
        } else {
          alert('Failed to add leasing company: ' + error.message);
        }
        return;
      }

      // Add new company to list and select it
      if (data) {
        setLeasingCompanies((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setLeasingCompanyId(data.id);
      }

      // Reset and close add form
      setNewCompanyName('');
      setShowAddNewCompany(false);
      setIsComboOpen(false);
    } catch (error) {
      console.error('Error adding company:', error);
      alert('An error occurred while adding the company');
    } finally {
      setIsAddingCompany(false);
    }
  };

  // Get selected company name
  const getSelectedCompanyName = () => {
    const company = leasingCompanies.find(c => c.id === leasingCompanyId);
    return company?.name || '';
  };

  // Filter companies based on search
  const filteredCompanies = leasingCompanies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!paymentType) {
      alert('Please select a payment method');
      return;
    }

    if (paymentType === 'Leasing' && !leasingCompanyId) {
      alert('Please select a leasing company');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      
      const updateData: Record<string, any> = {
        payment_type: paymentType,
        leasing_company_id: paymentType === 'Leasing' ? leasingCompanyId : null,
      };

      const { error } = await supabase
        .from('pending_vehicle_sales')
        .update(updateData)
        .eq('id', saleId);

      if (error) {
        console.error('Error updating payment method:', error);
        alert('Failed to update payment method: ' + error.message);
        return;
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Select Payment Method</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <>
              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <Select
                  value={paymentType}
                  onValueChange={(value) => {
                    setPaymentType(value);
                    if (value !== 'Leasing') {
                      setLeasingCompanyId('');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Leasing">Leasing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leasing Company - Only show when Payment Type is Leasing */}
              {paymentType === 'Leasing' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Leasing Company <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Custom Combobox with Add New Option */}
                  <div ref={comboRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsComboOpen(!isComboOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <span className={leasingCompanyId ? 'text-gray-900' : 'text-gray-500'}>
                        {leasingCompanyId ? getSelectedCompanyName() : 'Select leasing company...'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isComboOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {isComboOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-2 border-b">
                          <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search companies..."
                            className="w-full h-9"
                            autoFocus
                          />
                        </div>

                        {/* Company List */}
                        <div className="max-h-40 overflow-y-auto">
                          {filteredCompanies.length > 0 ? (
                            filteredCompanies.map((company) => (
                              <button
                                key={company.id}
                                type="button"
                                onClick={() => {
                                  setLeasingCompanyId(company.id);
                                  setIsComboOpen(false);
                                  setSearchQuery('');
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 ${
                                  leasingCompanyId === company.id ? 'bg-green-50 text-green-700' : 'text-gray-700'
                                }`}
                              >
                                <span>{company.name}</span>
                                {leasingCompanyId === company.id && (
                                  <Check className="w-4 h-4 text-green-600" />
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No companies found
                            </div>
                          )}
                        </div>

                        {/* Add New Company Option */}
                        <div className="border-t">
                          {!showAddNewCompany ? (
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddNewCompany(true);
                                setNewCompanyName(searchQuery);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-green-600 hover:bg-green-50 font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              Add New Leasing Company
                            </button>
                          ) : (
                            <div className="p-3 space-y-2 bg-gray-50">
                              <Input
                                type="text"
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                                placeholder="Enter company name..."
                                className="w-full h-9"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setShowAddNewCompany(false);
                                    setNewCompanyName('');
                                  }}
                                  disabled={isAddingCompany}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleAddNewCompany}
                                  disabled={isAddingCompany || !newCompanyName.trim()}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {isAddingCompany ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      Adding...
                                    </>
                                  ) : (
                                    'Add Company'
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Current Status Info */}
              {currentPaymentType && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Current Payment Method: <span className="font-semibold text-gray-900">{currentPaymentType || 'Not set'}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? 'Saving...' : 'Save Payment Method'}
          </Button>
        </div>
      </div>
    </div>
  );
}
