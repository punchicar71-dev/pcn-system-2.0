'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { VehicleOptionsData, STANDARD_OPTIONS, SPECIAL_OPTIONS } from '@/types/vehicle-form.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Step3VehicleOptionsProps {
  data: VehicleOptionsData;
  onChange: (data: Partial<VehicleOptionsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3VehicleOptions({ data, onChange, onNext, onBack }: Step3VehicleOptionsProps) {
  const [customOptionInput, setCustomOptionInput] = useState('');

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
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Options</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {STANDARD_OPTIONS.map((option) => (
                    <div
                      key={option}
                      className="flex border p-2 rounded-lg items-center gap-3"
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
                  ))}
                </div>
              </TabsContent>

              {/* Special Options Tab */}
              <TabsContent value="special">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {SPECIAL_OPTIONS.map((option) => (
                    <div
                      key={option}
                      className="flex border p-2 rounded-lg  items-center gap-3"
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
                  ))}
                </div>
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

        {/* Navigation Buttons */}
        <div className="flex justify-start gap-4 pt-6 mt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="px-8"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="px-8 bg-black text-white hover:bg-gray-800"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
