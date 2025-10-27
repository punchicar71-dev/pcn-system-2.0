'use client';

import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { VehicleOptionsData, STANDARD_OPTIONS, SPECIAL_OPTIONS } from '@/types/vehicle-form.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Step3VehicleOptionsProps {
  data: VehicleOptionsData;
  onChange: (data: Partial<VehicleOptionsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3VehicleOptions({ data, onChange, onNext, onBack }: Step3VehicleOptionsProps) {
  const [standardSearch, setStandardSearch] = useState('');
  const [specialSearch, setSpecialSearch] = useState('');
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

  const filteredStandardOptions = STANDARD_OPTIONS.filter((option) =>
    option.toLowerCase().includes(standardSearch.toLowerCase())
  );

  const filteredSpecialOptions = SPECIAL_OPTIONS.filter((option) =>
    option.toLowerCase().includes(specialSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="bg-white p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicle Options</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Standard Vehicle Options */}
          <div>
            <Label className="text-base font-semibold">Standard Vehicle options</Label>
            <div className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={standardSearch}
                  onChange={(e) => setStandardSearch(e.target.value)}
                  placeholder="Search option..."
                  className="pl-9"
                />
              </div>

              <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredStandardOptions.map((option) => (
                  <div key={option} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <span className="text-sm text-gray-700">{option}</span>
                    <Switch
                      checked={data.standardOptions[option] || false}
                      onCheckedChange={() => handleStandardOptionToggle(option)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Special Vehicle Options */}
          <div>
            <Label className="text-base font-semibold">Special Vehicle options</Label>
            <div className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={specialSearch}
                  onChange={(e) => setSpecialSearch(e.target.value)}
                  placeholder="Search option..."
                  className="pl-9"
                />
              </div>

              <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredSpecialOptions.map((option) => (
                  <div key={option} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <span className="text-sm text-gray-700">{option}</span>
                    <Switch
                      checked={data.specialOptions[option] || false}
                      onCheckedChange={() => handleSpecialOptionToggle(option)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Manual Add Vehicle Options */}
          <div>
            <Label className="text-base font-semibold">Manuel Add Vehicle options</Label>
            <div className="mt-3">
              <Label htmlFor="customOption" className="text-sm">Options Name</Label>
              <div className="flex gap-2 mt-1">
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
                />
                <button
                  type="button"
                  onClick={handleAddCustomOption}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Custom Options List */}
              <div className="mt-4 space-y-2">
                {data.customOptions.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{option}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomOption(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Selected Options Display */}
              {(Object.values(data.standardOptions).some((v) => v) ||
                Object.values(data.specialOptions).some((v) => v) ||
                data.customOptions.length > 0) && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Selected Options Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Standard:</span>{' '}
                      {Object.entries(data.standardOptions)
                        .filter(([_, enabled]) => enabled)
                        .map(([name]) => name)
                        .join(', ') || 'None'}
                    </div>
                    <div>
                      <span className="font-medium">Special:</span>{' '}
                      {Object.entries(data.specialOptions)
                        .filter(([_, enabled]) => enabled)
                        .map(([name]) => name)
                        .join(', ') || 'None'}
                    </div>
                    {data.customOptions.length > 0 && (
                      <div>
                        <span className="font-medium">Custom:</span> {data.customOptions.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
