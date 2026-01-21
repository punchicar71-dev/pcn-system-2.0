'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, X, Search, Loader2 } from 'lucide-react';
import { VehicleOptionsData, STANDARD_OPTIONS, SPECIAL_OPTIONS } from '@/types/vehicle-form.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase-client';

interface Step3VehicleOptionsProps {
  data: VehicleOptionsData;
  onChange: (data: Partial<VehicleOptionsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface OptionFromDB {
  id: string;
  option_name: string;
  option_type: string;
  is_active: boolean;
}

export default function Step3VehicleOptions({ data, onChange, onNext, onBack }: Step3VehicleOptionsProps) {
  const [customOptionInput, setCustomOptionInput] = useState('');
  
  // Search states
  const [standardSearch, setStandardSearch] = useState('');
  const [specialSearch, setSpecialSearch] = useState('');
  
  // Add new option dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addOptionType, setAddOptionType] = useState<'standard' | 'special'>('standard');
  const [newOptionName, setNewOptionName] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  
  // Database options states
  const [dbStandardOptions, setDbStandardOptions] = useState<OptionFromDB[]>([]);
  const [dbSpecialOptions, setDbSpecialOptions] = useState<OptionFromDB[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const supabase = createClient();

  // Fetch options from database on mount
  useEffect(() => {
    fetchOptionsFromDB();
  }, []);

  const fetchOptionsFromDB = async () => {
    setIsLoadingOptions(true);
    try {
      const { data: options, error } = await supabase
        .from('vehicle_options_master')
        .select('*')
        .eq('is_active', true)
        .order('option_name');

      if (error) {
        console.error('Error fetching options:', error);
        return;
      }

      if (options) {
        setDbStandardOptions(options.filter((o: OptionFromDB) => o.option_type === 'standard'));
        setDbSpecialOptions(options.filter((o: OptionFromDB) => o.option_type === 'special'));
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Merge DB options with hardcoded options (for backward compatibility)
  const standardOptionsList = useMemo(() => {
    const dbNames = dbStandardOptions.map(o => o.option_name);
    const hardcodedNotInDB = STANDARD_OPTIONS.filter(o => !dbNames.includes(o));
    return [...dbNames, ...hardcodedNotInDB].sort();
  }, [dbStandardOptions]);

  const specialOptionsList = useMemo(() => {
    const dbNames = dbSpecialOptions.map(o => o.option_name);
    const hardcodedNotInDB = SPECIAL_OPTIONS.filter(o => !dbNames.includes(o));
    return [...dbNames, ...hardcodedNotInDB].sort();
  }, [dbSpecialOptions]);

  // Filtered options based on search
  const filteredStandardOptions = useMemo(() => {
    if (!standardSearch.trim()) return standardOptionsList;
    return standardOptionsList.filter(option =>
      option.toLowerCase().includes(standardSearch.toLowerCase())
    );
  }, [standardOptionsList, standardSearch]);

  const filteredSpecialOptions = useMemo(() => {
    if (!specialSearch.trim()) return specialOptionsList;
    return specialOptionsList.filter(option =>
      option.toLowerCase().includes(specialSearch.toLowerCase())
    );
  }, [specialOptionsList, specialSearch]);

  // Open add dialog for specific option type
  const openAddDialog = (type: 'standard' | 'special') => {
    setAddOptionType(type);
    setNewOptionName('');
    setAddError(null);
    setIsAddDialogOpen(true);
  };

  // Handle adding new option to database
  const handleAddNewOption = async () => {
    if (!newOptionName.trim()) {
      setAddError('Option name is required');
      return;
    }

    // Check if option already exists
    const existingOptions = addOptionType === 'standard' ? standardOptionsList : specialOptionsList;
    if (existingOptions.some(o => o.toLowerCase() === newOptionName.trim().toLowerCase())) {
      setAddError('This option already exists');
      return;
    }

    setIsAddingOption(true);
    setAddError(null);

    try {
      const { data: newOption, error } = await supabase
        .from('vehicle_options_master')
        .insert([{
          option_name: newOptionName.trim(),
          option_type: addOptionType,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding option:', error);
        setAddError('Failed to add option. Please try again.');
        return;
      }

      if (newOption) {
        // Update local state
        if (addOptionType === 'standard') {
          setDbStandardOptions(prev => [...prev, newOption].sort((a, b) => a.option_name.localeCompare(b.option_name)));
          // Auto-select the new option
          onChange({
            standardOptions: {
              ...data.standardOptions,
              [newOption.option_name]: true
            }
          });
        } else {
          setDbSpecialOptions(prev => [...prev, newOption].sort((a, b) => a.option_name.localeCompare(b.option_name)));
          // Auto-select the new option
          onChange({
            specialOptions: {
              ...data.specialOptions,
              [newOption.option_name]: true
            }
          });
        }

        setNewOptionName('');
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding option:', error);
      setAddError('Failed to add option. Please try again.');
    } finally {
      setIsAddingOption(false);
    }
  };

  const handleStandardOptionToggle = (option: string) => {
    const newOptions = {
      ...data.standardOptions,
      [option]: !data.standardOptions[option],
    };
    onChange({ standardOptions: newOptions });
  };

  const handleSpecialOptionToggle = (option: string) => {
    const newOptions = {
      ...data.specialOptions,
      [option]: !data.specialOptions[option],
    };
    onChange({ specialOptions: newOptions });
  };

  const handleAddCustomOption = () => {
    if (customOptionInput.trim()) {
      const newCustomOptions = [...data.customOptions, customOptionInput.trim()];
      onChange({ customOptions: newCustomOptions });
      setCustomOptionInput('');
    }
  };

  const handleRemoveCustomOption = (index: number) => {
    const newCustomOptions = data.customOptions.filter((_, i) => i !== index);
    onChange({ customOptions: newCustomOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  // Get selected options for summary
  const selectedStandardOptions = Object.entries(data.standardOptions)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
  
  const selectedSpecialOptions = Object.entries(data.specialOptions)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);

  return (
    <div className="bg-slate-50 px-6 pt-6 pb-0 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Options</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
          {/* Left side - Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="standard" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="standard">Standard Options</TabsTrigger>
                <TabsTrigger value="special">Special Options</TabsTrigger>
                <TabsTrigger value="custom">Custom Options</TabsTrigger>
              </TabsList>

              {/* Standard Options Tab */}
              <TabsContent value="standard">
                {/* Add New Option Button & Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search standard options..."
                      value={standardSearch}
                      onChange={(e) => setStandardSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                    <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAddDialog('standard')}
                    className="gap-2 text-white bg-black border-primary/30 hover:bg-gray-800 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Option
                  </Button>
                </div>

                {isLoadingOptions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading options...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-h-[500px] overflow-y-auto">
                    {filteredStandardOptions.length > 0 ? (
                      filteredStandardOptions.map((option) => (
                        <div
                          key={option}
                          className="flex border bg-white p-2 rounded-lg items-center gap-3"
                        >
                          <Switch
                            id={`standard-${option}`}
                            checked={data.standardOptions[option] || false}
                            onCheckedChange={() => handleStandardOptionToggle(option)}
                          />
                          <Label htmlFor={`standard-${option}`} className="text-sm font-normal cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No options found matching &quot;{standardSearch}&quot;
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Special Options Tab */}
              <TabsContent value="special">
                {/* Add New Option Button & Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
               
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search special options..."
                      value={specialSearch}
                      onChange={(e) => setSpecialSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                     <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAddDialog('special')}
                    className="gap-2 text-white bg-black border-primary/30 hover:bg-gray-800 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Option
                  </Button>
                </div>

                {isLoadingOptions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading options...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-h-[500px] overflow-y-auto">
                    {filteredSpecialOptions.length > 0 ? (
                      filteredSpecialOptions.map((option) => (
                        <div
                          key={option}
                          className="flex border bg-white p-2 rounded-lg items-center gap-3"
                        >
                          <Switch
                            id={`special-${option}`}
                            checked={data.specialOptions[option] || false}
                            onCheckedChange={() => handleSpecialOptionToggle(option)}
                          />
                          <Label htmlFor={`special-${option}`} className="text-sm font-normal cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No options found matching &quot;{specialSearch}&quot;
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Custom Options Tab */}
              <TabsContent value="custom" className="space-y-4">
                <div>
                  <Label htmlFor="customOption" className="text-sm font-medium mb-2 block">
                    Manual Add Vehicle options
                  </Label>
                  <Label htmlFor="customOption" className="text-sm font-normal text-gray-600 mb-3 block">
                    Options Name
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="customOption"
                      value={customOptionInput}
                      onChange={(e) => setCustomOptionInput(e.target.value)}
                      placeholder="Enter option name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomOption();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomOption}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Custom Options List */}
                <div className="space-y-3 mt-6">
                  {data.customOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center  p-4 bg-white border rounded-lg"
                    >
                      <div className="flex items-center justify-start gap-3 flex-1">
                        <Switch checked={true} disabled />
                        <Label className="text-sm font-normal">{option}</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCustomOption(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right side - Selected Options Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-6  top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Selected Options Summary</h3>

              {/* Standard Options Summary */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Standard</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStandardOptions.length > 0 ? (
                    selectedStandardOptions.map((option) => (
                      <span
                        key={option}
                        className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-md border"
                      >
                        {option}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No options selected</span>
                  )}
                </div>
              </div>

              {/* Special Options Summary */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Special</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSpecialOptions.length > 0 ? (
                    selectedSpecialOptions.map((option) => (
                      <span
                        key={option}
                        className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-md border"
                      >
                        {option}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No options selected</span>
                  )}
                </div>
              </div>

              {/* Custom Options Summary */}
              {data.customOptions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Custome</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.customOptions.map((option, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-md border"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Sticky Bottom */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t py-4 px-6 -mx-6 mt-6">
          <div className="flex justify-start gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="px-6 py-2"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-black text-white hover:bg-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      </form>

      {/* Add New Option Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Add New {addOptionType === 'standard' ? 'Standard' : 'Special'} Option
            </DialogTitle>
            <DialogDescription>
              Enter the option name. This will be saved to the database and available for all vehicles.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-option-name">Option Name</Label>
              <Input
                id="new-option-name"
                value={newOptionName}
                onChange={(e) => {
                  setNewOptionName(e.target.value);
                  setAddError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAddingOption) {
                    e.preventDefault();
                    handleAddNewOption();
                  }
                }}
                placeholder="e.g., Heated Mirrors, Lane Departure Warning..."
                disabled={isAddingOption}
                autoFocus
              />
              {addError && (
                <p className="text-sm text-destructive">{addError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isAddingOption}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNewOption} disabled={isAddingOption}>
              {isAddingOption ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Option'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
